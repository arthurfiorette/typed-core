import { EmitterOptions, EventListener, EventMap, EventType } from './types';

function mergeOptions(options: Partial<EmitterOptions>): EmitterOptions {
  if ((options.maxListeners || 0) < 0) delete options.maxListeners;
  return {
    maxListeners: 10,
    ...options
  };
}

export class EventEmitter<E extends EventType<E> = EventType<any>> {
  private _events: EventMap<E> = Object.create(null);
  private _options: EmitterOptions;

  constructor(options: Partial<EmitterOptions> = {}) {
    this._options = mergeOptions(options);
  }

  setMaxListeners(n: number): EventEmitter<E> {
    if (n < 0 || Number.isNaN(n)) throw new Error(`n must be a non-negative number, got ${n}`);

    this._options.maxListeners = n;
    return this;
  }

  getMaxListeners(): number {
    return this._options.maxListeners;
  }

  emit<K extends keyof E>(type: K, val: E[K]): boolean {
    const events = this._events;

    // If there is no 'error' event listener then throw.
    if (type == 'error' && !events.error) {
      throw val instanceof Error ? val : new Error(JSON.stringify(val));
    }

    const handler = events[type];

    if (!handler) return false;

    // Single listener
    if (typeof handler === 'function') {
      const result = handler.apply(this, [val]);

      if (result) {
        result.then(undefined, (err) => {
          process.nextTick(this.emit, 'error', err);
        });
      }

      // Array of listeners
    } else {
      const listeners = handler.slice(0);

      for (const listener of listeners) {
        const result = listener.apply(this, [val]);

        if (result) {
          result.then(undefined, (err) => {
            process.nextTick(this.emit, 'error', err);
          });
        }
      }
    }

    return true;
  }

  private _addListener<K extends keyof E>(
    type: K,
    listener: EventListener<E[K]>,
    prepend: boolean
  ): EventEmitter<E> {
    const events = this._events;

    if (events.newListener) {
      // When using a generic that extends `keyof E`, and if the `E[keyof E]`
      // uses the generic type `keyof E` as it value, it will be forced to be the same as the
      // generic `keyof E` value.
      this.emit('newListener', { type, listener } as any);
    }

    const handler = events[type];

    if (!handler) {
      events[type] = listener;
    } else if (typeof handler === 'function') {
      events[type] = prepend
        ? [listener, handler as EventListener<E[K]>]
        : [handler as EventListener<E[K]>, listener];
    } else {
      if (prepend) {
        handler.unshift(listener);
      } else {
        handler.push(listener);
      }

      const maxListeners = this.getMaxListeners();

      if (handler.length > maxListeners) {
        process.emitWarning(
          'Possible EventEmitter memory leak detected.' +
            `${handler.length} ${type} listeners added.` +
            'Use emitter.setMaxListeners() to increase the limit.'
        );
      }
    }
    return this;
  }

  addListener<K extends keyof E>(type: K, listener: EventListener<E[K]>): EventEmitter<E> {
    return this._addListener(type, listener, false);
  }

  on = this.addListener;

  prependListener<K extends keyof E>(type: K, listener: EventListener<E[K]>): EventEmitter<E> {
    return this._addListener(type, listener, true);
  }

  private _onceWrapper<K extends keyof E>(
    type: K,
    listener: EventListener<E[K]>
  ): EventListener<E[K]> {
    let fired = false;

    const wrapper = (val: E[K]) => {
      // Prevent multiple calls if is an removeListener event
      if (!fired) {
        fired = true;
        this.removeListener(type, wrapper);
        listener.call(this, val);
      }
    };

    return wrapper;
  }

  once<K extends keyof E>(type: K, listener: EventListener<E[K]>): EventEmitter<E> {
    return this.addListener(type, this._onceWrapper(type, listener));
  }

  next<K extends keyof E>(type: K): Promise<E[K]> {
    return new Promise((res) => this.once(type, (val) => res(val)));
  }

  prependOnceListener<K extends keyof E>(type: K, listener: EventListener<E[K]>): EventEmitter<E> {
    return this.prependListener(type, this._onceWrapper(type, listener));
  }

  removeListener<K extends keyof E>(type: K, listener: EventListener<E[K]>): EventEmitter<E> {
    const events = this._events;

    const list = events[type];

    if (!list) return this;

    if (list === listener) {
      delete events[type];
      if (events.removeListener) {
        this.emit('removeListener', { type, listener } as any);
      }
      // Redundant else if for type checking
    } else if (typeof list !== 'function') {
      let index = -1;

      // Prevents list being []
      if (list.length === 1 && list[0] === listener) {
        delete events[type];
        return this;
      }

      // loop backwards the list to find the listener index, we are looping
      // backwards because it's more common to remove a listener shortly
      // after its addition

      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i] === listener) {
          index = i;
          break;
        }
      }

      if (index < 0) return this;

      if (index === 0) list.shift();
      else list.splice(index, 1);

      if (events.removeListener) {
        this.emit('removeListener', { type, listener } as any);
      }
    }

    return this;
  }

  off = this.removeListener;

  removeAllListeners<K extends keyof E>(type?: K): EventEmitter<E> {
    const events = this._events;

    // If we don't have any remove listeners, just delete the listeners
    if (!events.removeListener) {
      if (!type) {
        this._events = Object.create(null);
      } else {
        delete events[type];
      }
      return this;
    }

    // Emit and remove all listeners through recursion
    if (!type) {
      // https://github.com/Microsoft/TypeScript/issues/12870
      for (const key of Object.keys(events) as Array<K>) {
        // Emit before remove all listeners
        if (key === 'removeListener') continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      return this;
    }

    const listeners = events[type];

    if (!listeners) return this;

    if (typeof listeners === 'function') {
      this.removeListener(type, listeners as EventListener<E[K]>);
    } else {
      for (let i = listeners.length - 1; i >= 0; i--) {
        this.removeListener(type, listeners[i]);
      }
    }

    return this;
  }

  private _listeners<K extends keyof E>(type: K, unwrap: boolean): EventListener<E[K]>[] {
    const events = this._events;
    const listeners = events[type];

    if (!listeners) return [];
    if (unwrap) {
      // TODO: Unwrap the onceWrapper for every method that return a event listener
    }

    if (typeof listeners === 'function') {
      return [listeners] as EventListener<E[K]>[];
    }

    return listeners.slice(0);
  }

  listeners<K extends keyof E>(type: K): EventListener<E[K]>[] {
    return this._listeners(type, true);
  }

  rawListeners<K extends keyof E>(type: K): EventListener<E[K]>[] {
    return this._listeners(type, true);
  }

  listenerCount(type: keyof E): number {
    const events = this._events;

    const listeners = events[type];

    if (!listeners) return 0;
    if (typeof listeners === 'function') return 1;
    else return listeners.length;
  }

  eventNames(): (keyof E)[] {
    // Only return registered event names, because thats all we can know
    return Object.keys(this._events) as (keyof E)[];
  }
}
