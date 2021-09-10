// @file 含该组件内所有类型定义
import type { ComponentInternalInstance, ComputedRef, Ref, UnwrapRef } from 'vue';

export type InputValue = string | number | any[];
export interface IndicatorOptions {
	inline: boolean;
	inverted: boolean;
}

// input.props
export interface InputProps {
	type: string;
	modelValue: InputValue;
	placeholder: string;
	maxlength: number;
	disabled: boolean;
	readonly: boolean;
	name: string;
	autofocus: boolean;
	spellcheck: false;
	autocomplete: string;
	clearable: string;
	elementId: string;
	prepend: string;
	append: string;
	afloat: boolean;
	inputStyle: object | any[];
	allowDispatch: boolean;
	focusEnd: boolean;
	bytes: boolean;

	// input-number
	max: number;
	min: number;
	step: number;
	precision: number;
	formatter: (value: InputValue, precision: number) => InputValue;
	onAfter: (value: InputValue) => Promise<boolean> | boolean;
}

// use-input.ts
export interface InputData {
	currentValue: Ref<InputValue>;
	isFocus: Ref<boolean>;
	isOnComposition: Ref<boolean>; 
	classes: ComputedRef<string | object>;
	listeners: Options;
	handleClear: AnyFunction;
}

interface OverwriteInput {
	props: InputProps;
	proxy: UnwrapRef<InputData>
	vnode: {
		props: InputProps
	},
	ctx: any;
}

export interface CompareValue {
	value: string | number;
	tag: string;
}

export type InputInstance = OverwriteInput & ComponentInternalInstance;
