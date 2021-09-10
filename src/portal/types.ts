// @file 含该组件内所有类型定义
import type { Plugin, DefineComponent, VNodeNormalizedChildren } from 'vue';
import type PortalLeaf from './portal-leaf';

/**
 * Portal配置项
 */
export interface PortalOptions extends Options {
	/**
	 * 当前组件的名字
	 */
	cName: string;

	/**
	 * 外层节点
	 */
	tag: string;

	/**
	 * 插入的节点
	 */
	el: string | HTMLElement; 

	/**
	 * 再次调用，实例不销毁
	 */
	alive: boolean;

	/**
	 * 多个实例共存
	 */
	multiple: boolean;

	/**
	 * promise调用
	 */
	promise?: boolean;

	/**
	 * 点击当前节点不销毁
	 */
	aliveRegExp: { 
		className?: RegExp;
		id?: RegExp;
	};

	/**
	 * 控制实例显示和隐藏的key值
	 */
	aliveKey: string;

	/**
	 * 延迟销毁，单位s
	 */
	leaveDelay: number;

	/**
	 * 自动销毁
	 */
	autoDestroy: boolean;

	/**
	 * 注入组件
	 */
	components: Hash<DefineComponent>;

	/**
	 * 注入插件
	 */
	uses: Hash<Plugin>;

	/**
	 * before返回的数据或者传入组件的数据
	 */
	dataSource?: Nullable<object>;

	/**
	 * 是否使用片段，即组件没有根节点
	 */
	fragment: boolean;

	/**
	 * 使用插槽
	 */
	slots?: Nullable<VNodeNormalizedChildren>;

	/**
	 * 父层实例
	 */
	parent?: Nullable<object>;

	/**
	 * 获取实例
	 */
	getInstance?: (instance: PortalLeaf) => any; 

	/**
	 * 调用前
	 */
	onBefore?: (options: PortalOptions) => any;
	onFulfilled?: AnyFunction;
	onRejected?: AnyFunction;
}

export type PortalConfig = PortalOptions;

export interface RenderOptions {
	options: PortalOptions,
	response?: any;
	onRejected?: AnyFunction;
	onFulfilled?: AnyFunction;
}

/**
 * 用于fragment: false时，新增_children, 避免外层tag
 */
export type ContainerElement = Customized<HTMLElement, { 
	_children?: HTMLElement[] 
}>

export type Wrapper = Customized<DefineComponent, {
	update?: (options: PortalOptions) => void;
	loadData?: (options: PortalOptions) => void;
}>