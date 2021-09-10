// @file 含该组件内所有类型定义

/**
 * Icon允许的全局配置项
 */
export interface IconConfig {
	urls?: string[];
}

export type IconHash = Options<{ viewBox: string, path: string}>

export type IconEvent = Options<AnyFunction[]>

export type IconUrlStatus = Promise<void>