import { ref, inject, watch, computed, getCurrentInstance } from 'vue';
import { checkMaxlength } from './utils';

export default (input) => {
	const { emit, props } = getCurrentInstance();
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

	const handleInput = (value, e) => {
		emit('input', value, e);
		emit('update:modelValue', value, e);
	};

	const handleFocus = (e) => {
		isFocus.value = true;
		if (props.focusEnd) {
			let length = currentValue.value.length;
			// hack chrome浏览器的BUG：setSelectionRange() for input/textarea during onFocus fails when mouse clicks
			setTimeout(() => {
				e.srcElement.setSelectionRange(length, length);
			}, 0);
		}
		emit('focus', e);
	};

	const handleBlur = (e) => {
		isFocus.value = false;
		emit('blur', e);
	};

	const listeners = {
		keyup: (e) => emit('keyup', e),
		keypress: (e) => emit('keypress', e),
		keydown: (e) => emit('keydown', e),
		focus: handleFocus,
		blur: handleBlur,
		input: handleInput,
		change: (e) => emit('keyup', e)
	};

	return {
		isFocus,
		currentValue,
		listeners
	};
};