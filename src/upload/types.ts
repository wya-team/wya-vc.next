// @file 含该组件内所有类型定义

export interface UploadConfig {
	url?: string | object;
	name?: string;
	onPostBefore?: () => any;
	onPostAfter?: () => any;
}