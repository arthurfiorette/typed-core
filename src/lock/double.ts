type HoldableList = {
  hold: boolean;
  listeners: {
    hold: (() => void)[];
    release: (() => void)[];
  };
};

export class DoubleLock<K extends string | symbol> {
  private running = {} as Record<K, boolean>;
  private records = {} as Record<K, HoldableList>;

  private getRecord(key: K): HoldableList {
    const record = this.records[key];
    if (record) return record;

    return (this.records[key] = {
      hold: true,
      listeners: { hold: [], release: [] }
    });
  }

  hold(key: K, callback: (...args: any[]) => void, args: any[]): void;
  hold<R>(key: K, callback: (...args: any[]) => R | Promise<R>, args?: any[]): Promise<R>;
  hold<R>(
    key: K,
    callback: (...args: any[]) => void | R | Promise<R>,
    args: any[]
  ): void | Promise<R> {
    return new Promise<any>((res, rej) => {
      const record = this.getRecord(key);

      record.listeners.hold.push(async () => {
        try {
          const result = await callback(...args);
          res(result);
        } catch (err) {
          rej(err);
        }
      });

      if (!this.running[key]) {
        this.running[key] = true;
        this.wakeUp(key);
      }
    });
  }

  release(key: K, callback: (...args: any[]) => void, args: any[]): void;
  release<R>(key: K, callback: (...args: any[]) => R | Promise<R>, args?: any[]): Promise<R>;
  release<R>(
    key: K,
    callback: (...args: any[]) => void | R | Promise<R>,
    args: any[]
  ): void | Promise<R> {
    return new Promise<any>((res, rej) => {
      const record = this.getRecord(key);
      record.listeners.release.push(async () => {
        try {
          const result = await callback(...args);
          res(result);
        } catch (err) {
          rej(err);
        }
      });

      if (!this.running[key]) {
        this.running[key] = true;
        this.wakeUp(key);
      }
    });
  }

  private async wakeUp(key: K) {
    const record = this.getRecord(key);

    while (record.listeners.hold.length > 0 || record.listeners.release.length > 0) {
      const holdOrRelease = record.hold ? 'hold' : 'release';
      const fn = record.listeners[holdOrRelease].shift();

      // One side is empty
      if (!fn) {
        break;
      }

      await fn();
      record.hold = !record.hold;
    }
  }
}
