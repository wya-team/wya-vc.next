import { ref, watch, getCurrentInstance } from 'vue';
import type { InputInstance, InputValue } from './types';

export default () => {
	const { emit, props } = getCurrentInstance() as InputInstance;
	const currentValue = ref(props.modelValue);
	const isFocus = ref(false);
	/**
	 * 强制必须使用v-model，所以不需要判断一次
	 */
	watch(
		() => props.modelValue,
		(v) => {
			currentValue.value = v;
		},
		{ immediate: false }
	);

	const handleInput = (value: InputValue, e: InputEvent) => {
		emit('input', value, e);
		emit('update:modelValue', value, e);
	};

	const handleFocus = (e: any) => {
		isFocus.value = true;
		if (props.focusEnd) {
			let length = String(currentValue.value).length;
			// hack chrome浏览器的BUG：setSelectionRange() for input/textarea during onFocus fails when mouse clicks
			setTimeout(() => {
				// @ts-ignore
				e.srcElement?.setSelectionRange(length, length);
			}, 0);
		}
		emit('focus', e);
	};

	const handleBlur = (e: InputEvent) => {
		isFocus.value = false;
		emit('blur', e);
	};

	const listeners = {
		keyup: (e: any) => emit('keyup', e),
		keypress: (e: any) => emit('keypress', e),
		keydown: (e: any) => emit('keydown', e),
		focus: handleFocus,
		blur: handleBlur,
		input: handleInput,
		change: (e: any) => emit('keyup', e)
	};

	return {
		isFocus,
		currentValue,
		listeners
	};
};