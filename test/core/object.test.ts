import { exclude, extract } from '../../src';

describe('tests exclude and extract', () => {
  it('tests exclude', () => {
    expect(exclude({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toEqual({ c: 3 });
  });

  it('tests exclude with different objects', () => {
    const a = { a: 1, b: 2, c: 3 };
    const b = exclude(a, ['a', 'b']);

    expect(a).toEqual({ a: 1, b: 2, c: 3 });
    expect(b).toEqual({ c: 3 });
  });

  it('tests extract', () => {
    expect(extract({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toEqual({ a: 1, b: 2 });
  });

  it('tests extract with different objects', () => {
    const a = { a: 1, b: 2, c: 3 };
    const b = extract(a, ['a', 'b']);

    expect(a).toEqual({ a: 1, b: 2, c: 3 });
    expect(b).toEqual({ a: 1, b: 2 });
  });
});
