import { Object } from "ts-toolbelt";
declare type Pattern<TValue> = RegExp | ((value: TValue) => boolean) | ((value: TValue) => any) | any;
declare type Result<TValue, TOutput> = TOutput | ((param: TValue) => TOutput);
declare type CaseElement<TValue, TOutput> = [
    Pattern<TValue>,
    Result<TValue, TOutput>,
    true?
];
declare type DefaultCaseElement<TValue, TOutput> = [Result<TValue, TOutput>];
declare type CaseElements<TValue, TOutput> = (CaseElement<TValue, TOutput> | DefaultCaseElement<TValue, TOutput>)[];
declare type Matcher<TValue, TOutput> = (config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: Pattern<TValue>) => boolean;
declare type ResultGetter<TValue, TOutput> = (config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: Pattern<TValue>, result: any) => TOutput;
declare type Config<TValue, TOutput> = {
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
declare type BasicConfig<TValue, TOutput> = Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">;
export declare const defaultMatcher: <TValue, TOutput>(config: import("ts-toolbelt/out/Object/Omit")._Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: any) => boolean;
export declare const defaultResultGetter: <TValue, TOutput>(config: import("ts-toolbelt/out/Object/Omit")._Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: any, result: any) => TOutput;
export declare const createSwich: <TValue, TOutput>({ returnMany: defaultReturnMany, strict: defaultStrict, acceptTruthyFunctionReturn: defaultAcceptTruthyFunctionReturn, catchFunctionErrors: defaultCatchFunctionErrors, performReplaceOnRegex: defaultPerformReplaceOnRegex, runResultFunction: defaultRunResultFunction, stopFallThrough: defaultStopFallThrough, matcher: defaultMatcherValue, resultGetter: defaultResultGetterValue, }?: {
    returnMany?: boolean;
    strict?: boolean;
    acceptTruthyFunctionReturn?: boolean;
    catchFunctionErrors?: boolean;
    performReplaceOnRegex?: boolean;
    runResultFunction?: boolean;
    stopFallThrough?: boolean;
    matcher?: Matcher<TValue, TOutput>;
    resultGetter?: ResultGetter<TValue, TOutput>;
}) => (patterns: CaseElements<TValue, TOutput>, { returnMany, strict, acceptTruthyFunctionReturn, catchFunctionErrors, performReplaceOnRegex, runResultFunction, stopFallThrough, matcher, resultGetter, }?: {
    returnMany?: boolean;
    strict?: boolean;
    acceptTruthyFunctionReturn?: boolean;
    catchFunctionErrors?: boolean;
    performReplaceOnRegex?: boolean;
    runResultFunction?: boolean;
    stopFallThrough?: boolean;
    matcher?: Matcher<TValue, TOutput>;
    resultGetter?: ResultGetter<TValue, TOutput>;
}) => (valueToMatch?: boolean | TValue) => TOutput[];
export declare const gt: (compareValue: number) => (value: number) => boolean;
export declare const gte: (compareValue: number) => (value: number) => boolean;
export declare const lt: (compareValue: number) => (value: number) => boolean;
export declare const lte: (compareValue: number) => (value: number) => boolean;
declare const defaultSwich: <TValue, TOutput>(patterns: CaseElements<TValue, TOutput>, config?: {
    returnMany?: boolean;
    strict?: boolean;
    acceptTruthyFunctionReturn?: boolean;
    catchFunctionErrors?: boolean;
    performReplaceOnRegex?: boolean;
    runResultFunction?: boolean;
    stopFallThrough?: boolean;
    matcher?: Matcher<TValue, TOutput>;
    resultGetter?: ResultGetter<TValue, TOutput>;
}) => (valueToMatch?: boolean | TValue) => TOutput[];
export default defaultSwich;
