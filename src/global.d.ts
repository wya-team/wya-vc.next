declare type Indexable<T = any> = {
	[key: string]: T
}

declare type Hash<T> = Indexable<T>

// 默认值any
declare type Options<T = {}> = Indexable & T

declare interface AnyFunction<T = void> {
	(...args: any[]): T;
}

declare type Nullable<T> = T | null;
declare type Customized<Origin = any, Extend = any> = Origin & Extend
declare type TimeoutHandle = ReturnType<typeof global.setTimeout>
