// @file 含该组件内所有类型定义
export interface Action extends Options {
	/**
	 * 按钮
	 */
	name?: string,

	/**
	 * 按钮副标题
	 */
	subname?: string, 

	/**
	 * 样式
	 */
	className?: string,

	/**
	 * 样式
	 */
	style?: string, 

	/**
	 * 回调
	 */
	onClick?: AnyFunction<Promise<void | boolean>>
}