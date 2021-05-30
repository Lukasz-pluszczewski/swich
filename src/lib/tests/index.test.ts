import swich, {
  createSwich,
  gt,
  gte,
  lt,
  lte,
  defaultMatcher,
  defaultResultGetter,
} from '../index';

describe('swich', () => {
  it('Matches strings', () => {
    const foo = 'foo';
    const bar = 'bar';

    const instance = swich<string, string>([
      [foo, 'This is foo'],
      [bar, 'This is bar'],
      ['This is default'],
    ]);

    expect(instance('foo')).toEqual('This is foo');
    expect(instance('bar')).toEqual('This is bar');
    expect(instance('Lorem ipsum')).toEqual('This is default');
  });

  it('Matches patterns', () => {
    const instance = swich<string | number, string>([
      [/fo./, 'This is foo'],
      [/.ar/, 'This is bar'],
      ['This is default'],
    ]);

    expect(instance('foo')).toEqual('This is foo');
    expect(instance('xar')).toEqual('This is bar');
    expect(instance('Lorem ipsum')).toEqual('This is default');
    expect(instance(5)).toEqual('This is default');
  });


  it('Matches values based on compare function', () => {
    const instance = swich<number | string, string>([
      [1, 'This is one'],
      [2, 'This is two'],
      [(value: number | string) => value > 2, 'This is more than two'],
      ['This is default'],
    ]);

    expect(instance(1)).toEqual('This is one');
    expect(instance(2)).toEqual('This is two');
    expect(instance(10)).toEqual('This is more than two');
    expect(instance(-2)).toEqual('This is default');
    expect(instance('Lorem ipsum')).toEqual('This is default');
  });

  it('Compares values with true when no value is provided', () => {
    const value = 'foo';
    const instance = swich<string, string>([
      [value === 'foo', 'This is foo'],
      ['This is default'],
    ]);

    expect(instance()).toEqual('This is foo');
  });

  it('Returns first default when multiple are provided and returnMany is set to false', () => {
    const foo = 'foo';
    const bar = 'bar';

    const instance = swich<string, string>([
      [foo, 'This is foo'],
      [bar, 'This is bar'],
      ['This is default 1'],
      ['This is default 2'],
    ]);

    expect(instance('xyz')).toEqual('This is default 2');
  });

  it('Returns all matches when returnMany is set to true', () => {
    const instance = swich<number, string>([
      [(value: number) => value < 3, 'This is less than three'],
      [(value: number) => value > 2, 'This is more than two'],
    ], { returnMany: true });

    expect(instance(5)).toEqual(['This is more than two']);
    expect(instance(2.5)).toEqual(['This is less than three', 'This is more than two']);
  });

  it('Returns all matches or all defaults when returnMany is set to true', () => {
    const instance = swich<string, string>([
      [/ab./, 'This is ab'],
      [/.bc/, 'This is bc'],
      ['Default 1'],
      ['Default 2'],
    ], { returnMany: true });

    expect(instance('abx')).toEqual(['This is ab']);
    expect(instance('abc')).toEqual(['This is ab', 'This is bc']);
    expect(instance('xyz')).toEqual(['Default 1', 'Default 2']);
  });

  it('Compares values with non-strict equality when strict flag is set to false', () => {
    const instance = swich<number, string>([
      ['1', 'This is one'],
      ['2', 'This is two'],
    ], { strict: false });

    expect(instance(1)).toEqual('This is one');
    expect(instance(2)).toEqual('This is two');
  });

  it('Accepts truthy return value from custom compare function by default', () => {
    const instance = swich<number, string>([
      [(value: number) => value, 'This is truthy'],
      [(value: number) => !value, 'This is falsy'],
    ]);

    expect(instance(1)).toEqual('This is truthy');
    expect(instance(0)).toEqual('This is falsy');
  });

  it('Does not accept truthy return value from custom compare function when acceptTruthyFunctionReturn flag is set to false', () => {
    let instance = swich<number | boolean, string>([
      [(value: number | boolean) => value, 'This is true'],
      ['Default'],
    ], { acceptTruthyFunctionReturn: false });

    expect(instance(1)).toEqual('Default');
    expect(instance(true)).toEqual('This is true');

    instance = swich<number | boolean, string>([
      [(value: number | boolean) => value, 'This is true'],
      ['Default'],
    ], { acceptTruthyFunctionReturn: false, catchFunctionErrors: false });

    expect(instance(1)).toEqual('Default');
    expect(instance(true)).toEqual('This is true');
  });

  it('Catches errors from custom compare function by default', () => {
    const obj = { foo: { isTrue: true } };
    const instance = swich<string, string>([
      [(value: string) => obj[value].isTrue, 'This is foo'],
      ['This is not foo'],
    ]);

    expect(instance('foo')).toEqual('This is foo');
    expect(instance('bar')).toEqual('This is not foo');
  });

  it('Does not catch errors from custom compare function when catchFunctionErrors flag is set to false', () => {
    const obj = { foo: { isTrue: true } };
    const instance = swich<string, string>([
      [(value: string) => obj[value].isTrue, 'This is foo'],
      ['This is not foo'],
    ], { catchFunctionErrors: false });

    expect(instance('foo')).toEqual('This is foo');
    expect(() => instance('bar')).toThrowError('Cannot read property \'isTrue\' of undefined');
  });

  it('Performs replace on regex when performReplaceOnRegex flag is set to true', () => {
    const instance = swich<string, string>([
      [/I am (.+)/, 'Their name is $1'],
      ['I don\'t know their name'],
    ], { performReplaceOnRegex: true });

    expect(instance('I am John')).toEqual('Their name is John');
    expect(instance('I am Will')).toEqual('Their name is Will');
    expect(instance('Uga buga')).toEqual('I don\'t know their name');
  });

  it('Runs result function by default', () => {
    const instance = swich<number, number>([
      [gt(50), (value: number) => value / 2],
      [lt(0), (value: number) => value + 10],
      [(value: number) => value],
    ]);

    expect(instance(120)).toEqual(60);
    expect(instance(-20)).toEqual(-10);
    expect(instance(20)).toEqual(20);
  });

  it('Does not run result function when runResultFunction flag is set to false', () => {
    const resultFunction = (value: number) => value / 2;
    const instance = swich<number, string | typeof resultFunction>([
      [50, resultFunction],
      ['default'],
    ], { runResultFunction: false });

    expect(instance(50)).toEqual(resultFunction);
    expect(instance(20)).toEqual('default');
  });

  it('Accepts custom matcher when creating custom swich instance', () => {
    const customSwich = createSwich<{ type: string } | string, string>({
      matcher: config => (valueToMatch, pattern) => (
          typeof pattern === 'object' && typeof valueToMatch === 'object'
            ? pattern?.type === valueToMatch?.type
            : defaultMatcher(config)(valueToMatch, pattern)
      ),
    });
    const instance = customSwich([
      [{ type: 'foo' }, 'Type is foo'],
      [{ type: 'bar' }, 'Type is bar'],
      ['Unknown type'],
    ]);

    expect(instance({ type: 'foo' })).toEqual('Type is foo');
    expect(instance({ type: 'bar' })).toEqual('Type is bar');
    expect(instance('Uga buga')).toEqual('Unknown type');
  });

  it('Accepts custom result getter when creating custom swich instance', () => {
    const customSwich = createSwich({
      resultGetter: (config) => (valueToMatch, pattern, result) =>
        defaultResultGetter(config)(valueToMatch, pattern, typeof result === 'object' ? result.value : result),
    });
    const instance = customSwich([
      ['foo', { value: 'Type is foo' }],
      ['bar', { value: 'Type is bar' }],
      ['Unknown type'],
    ]);

    expect(instance('foo')).toEqual('Type is foo');
    expect(instance('bar')).toEqual('Type is bar');
    expect(instance('Uga buga')).toEqual('Unknown type');
  });

  describe('with fallthrough flag', () => {
    it('Falls through to the next pattern', () => {
      const lowerThanTenCb = jest.fn(() => 'Lower than 10');
      const greaterThanFiveCb = jest.fn(() => 'Greater than 5');
      const defaultCb = jest.fn(() => 'Default');

      const instance = swich<number, string>([
        [lt(10), lowerThanTenCb, true],
        [gt(5), greaterThanFiveCb],
        [defaultCb],
      ]);

      expect(instance(6)).toEqual('Greater than 5');
      expect(lowerThanTenCb).toBeCalledTimes(1);
      expect(greaterThanFiveCb).toBeCalledTimes(1);
      expect(defaultCb).not.toBeCalled();
    });
    it('Falls through to the next pattern, not stop when Pattern doesn\'t match and returns default', () => {
      const lowerThanTenCb = jest.fn(() => 'Lower than 10');
      const greaterThanFiveCb = jest.fn(() => 'Greater than 5');
      const defaultCb = jest.fn(() => 'Default');

      const instance = swich<number, string>([
        [lt(10), lowerThanTenCb, true],
        [gt(5), greaterThanFiveCb, true],
        [defaultCb],
      ]);

      expect(instance(3)).toEqual('Default');
      expect(lowerThanTenCb).toBeCalledTimes(1);
      expect(greaterThanFiveCb).toBeCalledTimes(1);
      expect(defaultCb).toBeCalledTimes(1);
    });
    it('Falls through to the next pattern and return results for non-matching Patterns', () => {
      const lowerThanTenCb = jest.fn(() => 'Lower than 10');
      const greaterThanFiveCb = jest.fn(() => 'Greater than 5');

      const instance = swich<number, string>([
        [lt(10), lowerThanTenCb, true],
        [gt(5), greaterThanFiveCb, true],
      ]);

      expect(instance(3)).toEqual('Greater than 5');
      expect(lowerThanTenCb).toBeCalledTimes(1);
      expect(greaterThanFiveCb).toBeCalledTimes(1);
    });
    it('Falls through to the next patterns and returns all results including default when returnMany flag is set', () => {
      const lowerThanTenCb = jest.fn(() => 'Lower than 10');
      const greaterThanFiveCb = jest.fn(() => 'Greater than 5');
      const defaultCb = jest.fn(() => 'Default');

      const instance = swich<number, string>([
        [lt(10), lowerThanTenCb, true],
        [gt(5), greaterThanFiveCb, true],
        [defaultCb],
      ], { returnMany: true });

      expect(instance(3)).toEqual(['Lower than 10', 'Greater than 5', 'Default']);
      expect(lowerThanTenCb).toBeCalledTimes(1);
      expect(greaterThanFiveCb).toBeCalledTimes(1);
      expect(defaultCb).toBeCalledTimes(1);
    });

    describe('and with stopFallThrough flag', () => {
      it('Falls through to the next pattern and return last matching result', () => {
        const lowerThanTenCb = jest.fn(() => 'Lower than 10');
        const greaterThanFiveCb = jest.fn(() => 'Greater than 5');
        const defaultCb = jest.fn(() => 'Default');

        const instance = swich<number, string>([
          [lt(10), lowerThanTenCb, true],
          [gt(5), greaterThanFiveCb, true],
          [defaultCb],
        ], { stopFallThrough: true });

        expect(instance(4)).toEqual('Lower than 10');
        expect(lowerThanTenCb).toBeCalledTimes(1);
        expect(greaterThanFiveCb).not.toBeCalled();
        expect(defaultCb).not.toBeCalled();
      });
      it('Falls through to the next pattern and return default value', () => {
        const lowerThanTenCb = jest.fn(() => 'Lower than 10');
        const greaterThanFiveCb = jest.fn(() => 'Greater than 5');
        const defaultCb = jest.fn(() => 'Default');

        const instance = swich<number, string>([
          [lt(10), lowerThanTenCb, true],
          [gt(5), greaterThanFiveCb, true],
          [defaultCb],
        ], { stopFallThrough: true });

        expect(instance(6)).toEqual('Default');
        expect(lowerThanTenCb).toBeCalledTimes(1);
        expect(greaterThanFiveCb).toBeCalledTimes(1);
        expect(defaultCb).toBeCalledTimes(1);
      });
      it('Falls through to the next pattern and return all matching results with returnMany flag set', () => {
        const lowerThanTenCb = jest.fn(() => 'Lower than 10');
        const greaterThanFiveCb = jest.fn(() => 'Greater than 5');
        const greaterThanTwoCb = jest.fn(() => 'Greater than 2');
        const defaultCb = jest.fn(() => 'Default');

        const instance = swich<number, string>([
          [lt(10), lowerThanTenCb, true],
          [gt(5), greaterThanFiveCb, true],
          [gt(2), greaterThanTwoCb, true],
          [defaultCb],
        ], { stopFallThrough: true, returnMany: true });

        expect(instance(4)).toEqual(['Lower than 10', 'Greater than 2', 'Default']);
        expect(lowerThanTenCb).toBeCalledTimes(1);
        expect(greaterThanFiveCb).not.toBeCalled();
        expect(greaterThanTwoCb).toBeCalledTimes(1);
        expect(defaultCb).toBeCalledTimes(1);

        expect(swich([
          [lt(10), () => 'Less than 10', true],
          [gt(5), () => 'More than 5', true],
          [() => 'I am default'],
        ], { returnMany: true, stopFallThrough: true })(2)).toEqual(['Less than 10']);
      });
    });
  });
});

describe('comparator function', () => {
  describe('lt', () => {
    expect(lt(10)(15)).toEqual(false);
    expect(lt(10)(10)).toEqual(false);
    expect(lt(10)(5)).toEqual(true);
    expect(lt(10)(0)).toEqual(true);
    expect(lt(10)(-5)).toEqual(true);

    expect(lt(-5)(0)).toEqual(false);
    expect(lt(-5)(-5)).toEqual(false);
    expect(lt(-5)(-10)).toEqual(true);
  });
  describe('lte', () => {
    expect(lte(10)(15)).toEqual(false);
    expect(lte(10)(10)).toEqual(true);
    expect(lte(10)(5)).toEqual(true);
    expect(lte(10)(0)).toEqual(true);
    expect(lte(10)(-5)).toEqual(true);

    expect(lte(-5)(0)).toEqual(false);
    expect(lte(-5)(-5)).toEqual(true);
    expect(lte(-5)(-10)).toEqual(true);
  });

  describe('gt', () => {
    expect(gt(10)(15)).toEqual(true);
    expect(gt(10)(10)).toEqual(false);
    expect(gt(10)(5)).toEqual(false);
    expect(gt(10)(0)).toEqual(false);
    expect(gt(10)(-5)).toEqual(false);

    expect(gt(-5)(0)).toEqual(true);
    expect(gt(-5)(-5)).toEqual(false);
    expect(gt(-5)(-10)).toEqual(false);
  });
  describe('gte', () => {
    expect(gte(10)(15)).toEqual(true);
    expect(gte(10)(10)).toEqual(true);
    expect(gte(10)(5)).toEqual(false);
    expect(gte(10)(0)).toEqual(false);
    expect(gte(10)(-5)).toEqual(false);

    expect(gte(-5)(0)).toEqual(true);
    expect(gte(-5)(-5)).toEqual(true);
    expect(gte(-5)(-10)).toEqual(false);
    expect(gte(-5)(-10)).toEqual(false);
  });
});

it('lala', () => {
  const instance = swich<number, string>([
    [lt(10), () => 'Less than 10', true],
    [gt(5), () => 'More than 5', true],
    [gt(1), () => 'More than 1'],
    [() => 'I am default'],
  ], { returnMany: true });

  console.log(instance(2)); // ['Less than 10', 'More than 1', 'I am default']
})
