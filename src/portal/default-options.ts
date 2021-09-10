import type { PortalOptions } from './types';

const DEFAULT_OPTIONS: PortalOptions = {
	tag: 'div', 
	el: 'body', 
	cName: '',
	alive: false, // 再次调用，实例不销毁
	multiple: false, // 多个实例共存
	promise: true,
	aliveRegExp: { className: /(vc-hack-alive|vc-hack-cp)/ },
	aliveKey: 'isVisible',
	leaveDelay: 0.3,
	autoDestroy: true,
	getInstance: undefined, 
	onBefore: undefined, 
	components: {}, // 可以动态注入组件
	uses: {}, // 可以动态注入plugin
	dataSource: null,

	fragment: false, // 是否使用片段

	slots: null,
	parent: null
};

export default DEFAULT_OPTIONS;