// @file 含该组件内所有类型定义

// 这里我们确保都为number类型，非string
export type Day = number;
export type Year = number;
export type Month = number;

export interface DayOptions {
	day?: Day;
	date?: string;
	type?: string;
}