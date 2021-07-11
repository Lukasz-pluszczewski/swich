import { Object } from "ts-toolbelt";

export type Pattern<TValue> =
  | RegExp
  | ((value: TValue) => boolean)
  | ((value: TValue) => any)
  | any;
export type Result<TValue, TOutput> = TOutput | ((param: TValue) => TOutput);
export type CaseElement<TValue, TOutput> = [
  Pattern<TValue>,
  Result<TValue, TOutput>,
  true?
];
export type DefaultCaseElement<TValue, TOutput> = [Result<TValue, TOutput>];
export type CaseElements<TValue, TOutput> = (
  | CaseElement<TValue, TOutput>
  | DefaultCaseElement<TValue, TOutput>
)[];

export type Matcher<TValue, TOutput> = (
  config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">
) => (valueToMatch: TValue, pattern: Pattern<TValue>) => boolean;
export type ResultGetter<TValue, TOutput> = (
  config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">
) => (valueToMatch: TValue, pattern: Pattern<TValue>, result: any) => TOutput;

export type Config<TValue, TOutput> = {
  returnMany: boolean;
  strict: boolean;
  acceptTruthyFunctionReturn: boolean;
  catchFunctionErrors: boolean;
  performReplaceOnRegex: boolean;
  runResultFunction: boolean;
  stopFallThrough: boolean;
  matcher: Matcher<TValue, TOutput>;
  resultGetter: ResultGetter<TValue, TOutput>;
};
export type BasicConfig<TValue, TOutput> = Object.Omit<
  Config<TValue, TOutput>,
  "matcher" | "resultGetter"
>;

export const defaultMatcher =
  <TValue, TOutput>(config: BasicConfig<TValue, TOutput>) =>
  (valueToMatch: TValue, pattern: Pattern<TValue>): boolean => {
    if (pattern instanceof RegExp) {
      return typeof valueToMatch === "string"
        ? pattern.test(valueToMatch)
        : false;
    }
    if (typeof pattern === "function") {
      if (config.catchFunctionErrors) {
        try {
          if (!config.acceptTruthyFunctionReturn) {
            return pattern(valueToMatch) === true;
          } else {
            return !!pattern(valueToMatch);
          }
        } catch (error) {
          return false;
        }
      } else {
        if (!config.acceptTruthyFunctionReturn) {
          return pattern(valueToMatch) === true;
        } else {
          return !!pattern(valueToMatch);
        }
      }
    }

    if (config.strict) {
      return pattern === valueToMatch;
    }
    return pattern == valueToMatch;
  };

export const defaultResultGetter =
  <TValue, TOutput>(
    config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">
  ) =>
  (
    valueToMatch: TValue,
    pattern: Pattern<TValue>,
    result: TOutput
  ): TOutput => {
    const getRegexResult = (
      valueToMatch: TValue,
      pattern: Pattern<TValue>,
      replacement: TOutput
    ) => {
      if (
        typeof valueToMatch === "string" &&
        typeof replacement === "string" &&
        config.performReplaceOnRegex
      ) {
        return valueToMatch.replace(pattern, replacement);
      }
      return replacement;
    };

    const resultToBeSet =
      config.runResultFunction && typeof result === "function"
        ? result(valueToMatch)
        : result;

    return pattern instanceof RegExp
      ? getRegexResult(valueToMatch, pattern, resultToBeSet)
      : resultToBeSet;
  };

type SwichReturnMany<TValue, TOutput> = (
  valueToMatch?: TValue | true
) => TOutput[];
type SwichReturnOne<TValue, TOutput> = (
  valueToMatch?: TValue | true
) => TOutput;

function swich<TValue, TOutput>(
  patterns: CaseElements<TValue, TOutput>,
  config: Object.Optional<Config<TValue, TOutput>> & { returnMany: true }
): SwichReturnMany<TValue, TOutput>;

function swich<TValue, TOutput>(
  patterns: CaseElements<TValue, TOutput>,
  config?: Object.Optional<Config<TValue, TOutput>> & { returnMany?: false }
): SwichReturnOne<TValue, TOutput>;

function swich<TValue, TOutput>(
  patterns: CaseElements<TValue, TOutput>,
  {
    returnMany = false,
    strict = true,
    acceptTruthyFunctionReturn = true,
    catchFunctionErrors = true,
    performReplaceOnRegex = false,
    runResultFunction = true,
    stopFallThrough = false,
    matcher = defaultMatcher,
    resultGetter = defaultResultGetter,
  }: Object.Optional<Config<TValue, TOutput>> = {}
) {
  return (valueToMatch: TValue | true = true) => {
    const config: BasicConfig<TValue, TOutput> = {
      returnMany,
      strict,
      acceptTruthyFunctionReturn,
      catchFunctionErrors,
      performReplaceOnRegex,
      runResultFunction,
      stopFallThrough,
    };

    let found = false;
    let result = (returnMany ? [] : null) as TOutput[] | TOutput;

    const setResult = (value: any, setFound = true) => {
      found = setFound ? true : found;

      if (returnMany) {
        (result as TOutput[]).push(value);
      } else {
        (result as TOutput) = value;
      }
    };

    const verifyValue = matcher(config);
    const getResult = resultGetter(config);

    let fallingThrough = false;
    patterns.forEach((matchArr, index) => {
      const [pattern, result, fallthrough] = matchArr;
      if (found && !returnMany && !fallingThrough) {
        return;
      }
      if (matchArr.length === 1 && (!found || fallingThrough)) {
        return setResult(
          getResult(valueToMatch as TValue, undefined, pattern),
          false
        );
      }

      if (
        matchArr.length !== 1 &&
        ((fallingThrough && !stopFallThrough) ||
          verifyValue(valueToMatch as TValue, pattern))
      ) {
        fallingThrough = !!fallthrough;
        return setResult(getResult(valueToMatch as TValue, pattern, result));
      }

      fallingThrough = stopFallThrough ? false : !!fallthrough;
    });

    return result;
  };
}

export const gt = (compareValue: number) => (value: number) =>
  value > compareValue;
export const gte = (compareValue: number) => (value: number) =>
  value >= compareValue;
export const lt = (compareValue: number) => (value: number) =>
  value < compareValue;
export const lte = (compareValue: number) => (value: number) =>
  value <= compareValue;

type CreateSwichReturnMany<TValue, TOutput> = <TValue, TOutput>(
  patterns: CaseElements<TValue, TOutput>,
  config?: Object.Optional<Config<TValue, TOutput>>
) => SwichReturnMany<TValue, TOutput>;

type CreateSwichReturnOne<TValue, TOutput> = <TValue, TOutput>(
  patterns: CaseElements<TValue, TOutput>,
  config?: Object.Optional<Config<TValue, TOutput>>
) => SwichReturnOne<TValue, TOutput>;

export function createSwich<TValue, TOutput>(
  defaultConfig: Object.Optional<Config<TValue, TOutput>> & { returnMany: true }
): CreateSwichReturnMany<TValue, TOutput>;
// @ts-ignore
export function createSwich<TValue, TOutput>(
  defaultConfig: Object.Optional<Config<TValue, TOutput>> & {
    returnMany?: false;
  }
): CreateSwichReturnOne<TValue, TOutput>;

export function createSwich<TDefaultValue, TDefaultOutput>(
  defaultConfig: Object.Optional<Config<TDefaultValue, TDefaultOutput>>
) {
  return <TValue = TDefaultValue, TOutput = TDefaultOutput>(
    patterns: CaseElements<TValue, TOutput>,
    config: Object.Optional<Config<TValue, TOutput>> = {}
    // @ts-ignore
  ) => swich(patterns, { ...defaultConfig, ...config });
}

export default swich;
