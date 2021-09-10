// @file 含该组件内所有类型定义

import type { ComponentInternalInstance, ComputedRef, Ref, UnwrapRef } from 'vue';

export interface FormRule extends Options {
	trigger: string | string[];
	required: boolean | AnyFunction;
	message?: string;
}

export interface FormError extends Options {
	prop?: string;
	message?: string;
}

// form-item.props
export interface FormItemProps {
	label: string;
	labelWidth: number;
	prop: string;
	required: boolean;
	error: string;
	rules: FormRule[];
	showMessage: boolean;
	labelFor: string;
}

// use-form-item.ts
export interface FormItemData {
	isRequired: Ref<boolean>;
	validateState: Ref<string>;
	validateMessage: Ref<string>;
	validateDisabled: Ref<boolean>;
	validator: Ref<object>;
	classes: ComputedRef<Options<boolean>>;
	labelStyle: ComputedRef<Options>;
	contentStyle: ComputedRef<Options>;
	fieldValue: ComputedRef<any>;
	showError: ComputedRef<boolean>;
	validate: AnyFunction;
	resetField: AnyFunction;
}

interface OverwriteFormItem {
	props: FormItemProps;
	proxy: UnwrapRef<FormItemData>
}

export type FormItemInstance = OverwriteFormItem & ComponentInternalInstance;

// form.props
export interface FormProps extends Options {
	model: object;
	rules: object;
	labelWidth: number;
	showMessage: boolean;
	inline: boolean;
	labelPosition: string;
	autocomplete: string;
}

// use-form.ts
export interface FormData {
	getField: AnyFunction;
	resetField: AnyFunction;
	valideate: AnyFunction;
}

export interface FormOptions extends Options {
	throwToast?: AnyFunction;
}

export interface FormValidateOptions extends Options {
	scroll?: boolean;
}

export interface FormValidateResponse extends Options {
	msg?: string;
	message?: string;
}


interface OverwriteForm {
	props: FormProps;
	proxy: UnwrapRef<FormData>
}

export type FormInstance = OverwriteForm & ComponentInternalInstance

export interface FormItemInject extends Options {
	blur: (...args: any[]) => void;
	change: (...args: any[]) => void;
}

export interface FormInject extends Options {
	props: FormProps;
	add: (instance: ComponentInternalInstance) => void;
	remove: (instance: ComponentInternalInstance) => void;
}

