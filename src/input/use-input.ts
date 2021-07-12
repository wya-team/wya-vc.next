import { ref, inject, watch, computed, getCurrentInstance } from 'vue';
import { checkMaxlength } from './utils';

export default (input) => {
	const { emit, props, ctx } = getCurrentInstance();

	const currentValue = ref(props.modelValue);
	const isFocus = ref(false);
	const isOnComposition = ref(false);
	const formItem = inject('form-item', {});
	/**
	 * 强制必须使用v-model，所以不需要判断一次
	 */
	watch(
		() => props.modelValue,
		(v) => {
			currentValue.value = v;
			props.allowDispatch && formItem.change?.(v);
		},
		{ immediate: false }
	);

	const classes = computed(() => {
		return {
			'is-focus': isFocus.value,
			'is-disabled': props.disabled
		};
	});

	const handleKeydown = (e) => {
		emit('keydown', e);
	};

	const handleKeypress = (e) => {
		emit('keypress', e);
	};

	const handleKeyup = (e) => {
		// 数字键盘
		if (e.keyCode == 13 || e.keyCode == 108) {
			emit('enter', e);
		}
		emit('keyup', e);
	};

	const handleFocus = (e) => {
		isFocus.value = true;
		
		if (props.focusEnd) {
			let length = currentValue.value.length;
			/**
			 * hack chrome浏览器的BUG：
			 * setSelectionRange() for input/textarea during onFocus fails 
			 * when mouse clicks
			 */
			setTimeout(() => {
				e.srcElement.setSelectionRange(length, length);
			}, 0);
		}
		emit('focus', e);
	};

	const handleBlur = (e) => {
		isFocus.value = false;

		emit('blur', e);
		formItem.change?.(currentValue.value);
	};

	const handleInput = (e) => {
		if (isOnComposition.value) return;
		let value = e.target.value;
		// 撤销/重做
		if (
			e.inputType !== 'deleteContentBackward'
			&& !checkMaxlength(value) 
		) {
			e.preventDefault();
			ctx.$forceUpdate();
			return;
		}
		emit('input', value, e);
		emit('update:modelValue', value, e);

		emit('change', e);
		ctx.$forceUpdate();
	};

	const handleComposition = (e) => {
		if (e.type === 'compositionstart') {
			isOnComposition.value = true;
		}

		if (e.type === 'compositionend') {
			isOnComposition.value = false;
			handleInput(e);
		}
	};

	const handleChange = (e) => {
		emit('change', e);
	};

	const handlePaste = (e) => {
		emit('paste', e);
	};

	const handleClear = () => {
		const e = { target: { value: '' } };
		
		emit('input', '');
		emit('update:modelValue', '');

		emit('change', e);

		input.value?.focus?.();
	};

	// 非响应式
	const listeners = {
		keyup: handleKeyup,
		keypress: handleKeypress,
		keydown: handleKeydown,
		focus: handleFocus,
		blur: handleBlur,
		compositionstart: handleComposition,
		compositionupdate: handleComposition,
		compositionend: handleComposition,
		input: handleInput,
		change: handleChange,
		paste: handlePaste
	};

	return {
		currentValue,
		isFocus,
		isOnComposition,
		classes,
		listeners,
		handleClear
	};
};