import { Object } from "ts-toolbelt";

type Pattern<TValue> =
  | RegExp
  | ((value: TValue) => boolean)
  | ((value: TValue) => any)
  | any;
type Result<TValue, TOutput> = TOutput | ((param: TValue) => TOutput);
type CaseElement<TValue, TOutput> = [Pattern<TValue>, Result<TValue, TOutput>];
type DefaultCaseElement<TValue, TOutput> = [Result<TValue, TOutput>];
type CaseElements<TValue, TOutput> = (
  | CaseElement<TValue, TOutput>
  | DefaultCaseElement<TValue, TOutput>
)[];

type Matcher<TValue, TOutput> = (
  config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">
) => (valueToMatch: TValue, pattern: Pattern<TValue>) => boolean;
type ResultGetter<TValue, TOutput> = (
  config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">
) => (valueToMatch: TValue, pattern: Pattern<TValue>, result: any) => TOutput;

type Config<TValue, TOutput> = {
  returnMany: boolean;
  strict: boolean;
  acceptTruthyFunctionReturn: boolean;
  catchFunctionErrors: boolean;
  performReplaceOnRegex: boolean;
  runResultFunction: boolean;
  matcher: Matcher<TValue, TOutput>;
  resultGetter: ResultGetter<TValue, TOutput>;
};

export const defaultMatcher =
  <TValue, TOutput>(
    config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">
  ) =>
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
  (valueToMatch: TValue, pattern: Pattern<TValue>, result: any): TOutput => {
    const getRegexResult = (
      valueToMatch: TValue,
      pattern: Pattern<TValue>,
      replacement: any
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

export const createSwich =
  <TValue, TOutput>({
    returnMany: defaultReturnMany = false,
    strict: defaultStrict = true,
    acceptTruthyFunctionReturn: defaultAcceptTruthyFunctionReturn = true,
    catchFunctionErrors: defaultCatchFunctionErrors = true,
    performReplaceOnRegex: defaultPerformReplaceOnRegex = false,
    runResultFunction: defaultRunResultFunction = true,
    matcher: defaultMatcherValue = defaultMatcher,
    resultGetter: defaultResultGetterValue = defaultResultGetter,
  }: Object.Optional<Config<TValue, TOutput>> = {}) =>
  (
    patterns: CaseElements<TValue, TOutput>,
    {
      returnMany = defaultReturnMany,
      strict = defaultStrict,
      acceptTruthyFunctionReturn = defaultAcceptTruthyFunctionReturn,
      catchFunctionErrors = defaultCatchFunctionErrors,
      performReplaceOnRegex = defaultPerformReplaceOnRegex,
      runResultFunction = defaultRunResultFunction,
      matcher = defaultMatcherValue,
      resultGetter = defaultResultGetterValue,
    }: Object.Optional<Config<TValue, TOutput>> = {}
  ) =>
  (valueToMatch: TValue | boolean = true) => {
    const config = {
      returnMany,
      strict,
      acceptTruthyFunctionReturn,
      catchFunctionErrors,
      performReplaceOnRegex,
      runResultFunction,
    };

    let found = false;
    let result: TOutput | TOutput[] = returnMany ? [] : null;

    const setResult = (value: TOutput, setFound = true) => {
      found = setFound ? true : found;

      if (returnMany) {
        (result as TOutput[]).push(value);
      } else {
        result = value;
      }
    };

    const verifyValue = matcher(config);
    const getResult = resultGetter(config);

    patterns.forEach((matchArr) => {
      const [pattern, result] = matchArr;
      if (found && !returnMany) {
        return;
      }
      if (matchArr.length === 1 && !found) {
        return setResult(
          getResult(valueToMatch as TValue, undefined, pattern),
          false
        );
      }
      if (verifyValue(valueToMatch as TValue, pattern)) {
        return setResult(getResult(valueToMatch as TValue, pattern, result));
      }
    });

    return result;
  };

export const gt = (compareValue: number) => (value: number) =>
  value > compareValue;
export const gte = (compareValue: number) => (value: number) =>
  value >= compareValue;
export const lt = (compareValue: number) => (value: number) =>
  value < compareValue;
export const lte = (compareValue: number) => (value: number) =>
  value <= compareValue;

const defaultSwich = <TValue, TOutput>(
  patterns: CaseElements<TValue, TOutput>,
  config: Object.Optional<Config<TValue, TOutput>> = {}
) => createSwich<TValue, TOutput>()(patterns, config);

export default defaultSwich;
