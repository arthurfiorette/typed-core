export class RecordLock<K extends string | symbol> {
  private running = {} as Record<K, boolean>;
  private records = {} as Record<K, (() => void)[]>;

  acquire(key: K, callback: (...args: any[]) => void, args: any[]): void;
  acquire<R>(
    key: K,
    callback: (...args: any[]) => R | Promise<R>,
    args?: any[]
  ): Promise<R>;
  acquire<R>(
    key: K,
    callback: (...args: any[]) => R | Promise<R> | void,
    args: any[] = []
  ): Promise<R> | void {
    return new Promise<any>((res, rej) => {
      const record = this.records[key] || [];
      record.push(async () => {
        try {
          const result = await callback(...args);
          res(result);
        } catch (err) {
          console.log('aaaaaa', err);
          rej(err);
        }
      });
      this.records[key] = record;

      if (!this.running[key]) {
        this.running[key] = true;
        this.wakeUp(key);
      }
    });
  }

  private async wakeUp(key: K) {
    const record = this.records[key];
    while (record.length > 0) {
      const fn = record.shift();
      fn && (await fn());
    }
  }
}
