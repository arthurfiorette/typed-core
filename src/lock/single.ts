import type { Runnable } from 'src/types';

export class SingleLock {
  private locks: Runnable[] = [];

  private running = false;

  acquire(callback: (...args: any[]) => void, args: any[]): void;
  acquire<R>(callback: (...args: any[]) => R | Promise<R>, args?: any[]): Promise<R>;
  acquire<R>(
    callback: (...args: any[]) => R | Promise<R> | void,
    args: any[] = []
  ): Promise<R> | void {
    return new Promise<any>((res, rej) => {
      this.locks.push(async () => {
        try {
          const result = await callback(...args);
          res(result);
        } catch (err) {
          rej(err);
        }
      });

      if (!this.running) {
        this.running = true;
        this.wakeUp();
      }
    });
  }

  private async wakeUp() {
    while (this.locks.length > 0) {
      const fn = this.locks.shift();
      fn && (await fn());
    }
  }
}
