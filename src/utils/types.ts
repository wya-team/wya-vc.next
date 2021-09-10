// @file 含该组件内所有类型定义

export type ResizableElement = Customized<HTMLElement, {
	__resizeListeners__?: Array<(...args: unknown[]) => unknown>
	__ro__?: ResizeObserver
}> | Options;

export interface UidOptions extends Options {
	/**
	 * 使用前缀
	 */
	prefix?: string;

	/**
	 * 是否使用时间戳
	 */
	timestamp: boolean;
}

export interface FlattenDataOptions {
	/**
	 * 扁平化后是否含自己本身
	 */
	parent?: boolean;

	/**
	 * 扁平化后是否含children
	 */
	cascader?: boolean;
}
/**
 * 树形label
 */
export type TreeLabel = string;

/**
 * 树形value
 */
export type TreeValue = string | number;

/**
 * 树形数据
 */
export interface TreeData extends Options {
	label?: TreeLabel;
	value?: TreeValue;
	children?: TreeData[];
	hasChildren?: boolean;
}


export interface Exceptions {
	id?: RegExp;
	className?: RegExp;
	tagName?: RegExp;
}

export interface CompressOptions extends Options {
	/**
	 * 文件，必传
	 */
	file: File;

	/**
	 * 图片缩放最大宽度，不传默认源图片宽度
	 */
	width?: number; 

	/**
	 * 图片缩放最大高度，不传默认源图片高度
	 */
	height?: number; 

	/**
	 * 文件类型
	 */
	filetype?: string;

	/**
	 * 在指定图片格式为 image/jpeg 或 image/webp的情况下
	 * 可以从 0 到 1 的区间内选择图片的质量。
	 * 如果超出取值范围，使用默认值 0.92
	 */
	encoderOptions?: any;
}

export type Raf = (callback: FrameRequestCallback) => number

export interface WheelOptions extends Options {
	/**
	 * 滚动回调
	 */
	onWheel: AnyFunction; 

	/**
	 * 是否允许X轴方向滚动
	 */
	shouldWheelX?: AnyFunction | boolean;

	/**
	 * 是否允许Y轴方向滚动
	 */ 
	shouldWheelY?: AnyFunction | boolean; 

	/**
	 * 是否阻止冒泡
	 */
	stopPropagation?: AnyFunction;

	/**
	 * 滚动行为
	 */
	behavior?: string; 
}