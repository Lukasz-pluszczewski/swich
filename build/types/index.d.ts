import { Object } from "ts-toolbelt";
export declare type Pattern<TValue> = RegExp | ((value: TValue) => boolean) | ((value: TValue) => any) | any;
export declare type Result<TValue, TOutput> = TOutput | ((param: TValue) => TOutput);
export declare type CaseElement<TValue, TOutput> = [
    Pattern<TValue>,
    Result<TValue, TOutput>,
    true?
];
export declare type DefaultCaseElement<TValue, TOutput> = [Result<TValue, TOutput>];
export declare type CaseElements<TValue, TOutput> = (CaseElement<TValue, TOutput> | DefaultCaseElement<TValue, TOutput>)[];
export declare type Matcher<TValue, TOutput> = (config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: Pattern<TValue>) => boolean;
export declare type ResultGetter<TValue, TOutput> = (config: Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: Pattern<TValue>, result: any) => TOutput;
export declare type Config<TValue, TOutput> = {
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
export declare type BasicConfig<TValue, TOutput> = Object.Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">;
export declare const defaultMatcher: <TValue, TOutput>(config: import("ts-toolbelt/out/Object/Omit")._Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: any) => boolean;
export declare const defaultResultGetter: <TValue, TOutput>(config: import("ts-toolbelt/out/Object/Omit")._Omit<Config<TValue, TOutput>, "matcher" | "resultGetter">) => (valueToMatch: TValue, pattern: any, result: TOutput) => TOutput;
declare type SwichReturnMany<TValue, TOutput> = (valueToMatch?: TValue | true) => TOutput[];
declare type SwichReturnOne<TValue, TOutput> = (valueToMatch?: TValue | true) => TOutput;
declare function swich<TValue, TOutput>(patterns: CaseElements<TValue, TOutput>, config: Object.Optional<Config<TValue, TOutput>> & {
    returnMany: true;
}): SwichReturnMany<TValue, TOutput>;
declare function swich<TValue, TOutput>(patterns: CaseElements<TValue, TOutput>, config?: Object.Optional<Config<TValue, TOutput>> & {
    returnMany?: false;
}): SwichReturnOne<TValue, TOutput>;
export declare const gt: (compareValue: number) => (value: number) => boolean;
export declare const gte: (compareValue: number) => (value: number) => boolean;
export declare const lt: (compareValue: number) => (value: number) => boolean;
export declare const lte: (compareValue: number) => (value: number) => boolean;
declare type CreateSwichReturnMany<TValue, TOutput> = <TValue, TOutput>(patterns: CaseElements<TValue, TOutput>, config?: Object.Optional<Config<TValue, TOutput>>) => SwichReturnMany<TValue, TOutput>;
declare type CreateSwichReturnOne<TValue, TOutput> = <TValue, TOutput>(patterns: CaseElements<TValue, TOutput>, config?: Object.Optional<Config<TValue, TOutput>>) => SwichReturnOne<TValue, TOutput>;
export declare function createSwich<TValue, TOutput>(defaultConfig: Object.Optional<Config<TValue, TOutput>> & {
    returnMany: true;
}): CreateSwichReturnMany<TValue, TOutput>;
export declare function createSwich<TValue, TOutput>(defaultConfig: Object.Optional<Config<TValue, TOutput>> & {
    returnMany?: false;
}): CreateSwichReturnOne<TValue, TOutput>;
export default swich;
