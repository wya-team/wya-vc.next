// @file 含该组件内所有类型定义

export interface ToastOptions extends Options {
	content?: string; 
	duration?: number; 
	onClose?: AnyFunction; 
	maskClosable?: boolean; 
}