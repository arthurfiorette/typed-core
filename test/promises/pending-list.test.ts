import { PendingList } from '../../src';

const KEY = 'key';
type List = Record<typeof KEY, number>;

describe('tests pending lists', () => {
  it('tests resolve', () => {
    const list = new PendingList<List>();

    expect(list.get(KEY)).resolves.toBe(1);
    list.resolve(KEY, 1);
  });

  it('tests reject', () => {
    const list = new PendingList<List>();

    expect(list.get(KEY)).rejects.toBe(1);
    list.reject(KEY, 1);
  });

  it('tests resolve with renew', () => {
    const list = new PendingList<List>();

    expect(list.get(KEY)).resolves.toBe(1);
    list.resolve(KEY, 1);

    list.renew(KEY);

    expect(list.get(KEY)).rejects.toBe(1);
    list.reject(KEY, 1);
  });

  it('tests reject with renew', () => {
    const list = new PendingList<List>();

    expect(list.get(KEY)).rejects.toBe(1);
    list.reject(KEY, 1);

    list.renew(KEY);

    expect(list.get(KEY)).resolves.toBe(1);
    list.resolve(KEY, 1);
  });
});
