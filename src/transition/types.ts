// @file 含该组件内所有类型定义

import type { 
	ComponentInternalInstance, 
	ComputedRef, 
	UnwrapRef
} from 'vue';

// transition.props
export interface TransitionProps extends Options {
	duration: number | { enter: number, leave: number};
	delay: number | { enter: number, leave: number};
	group: boolean;
	tag: string;
	origin: string;
	styles: object;
	prefix: string;
}

export interface TransitionAttrs extends Options {
	onBeforeEnter: AnyFunction;
	onEnter: AnyFunction;
	onAfterEnter: AnyFunction;
	onBeforeLeave: AnyFunction;
	onLeave: AnyFunction;
	onAfterLeave: AnyFunction;
}

// use-transition.ts
export interface TransitionData {
	componentType: ComputedRef<any>;
	resetStyles: AnyFunction;
	resetAbsolute: AnyFunction;
	resetOrigin: AnyFunction;
	its: any;
	listeners: Options<AnyFunction>;
}


interface OverwriteTransition {
	props: TransitionProps;
	attrs: TransitionAttrs;
	proxy: UnwrapRef<TransitionData>
}

export type TransitionInstance = OverwriteTransition & ComponentInternalInstance
