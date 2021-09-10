import { ref, watch, getCurrentInstance } from 'vue';
import type { Ref } from 'vue';
import { checkMaxlength, getBytesLength } from './utils';
import type { InputInstance } from './types';

export default (currentValue: Ref<string | number>) => {
	const { props, emit } = getCurrentInstance() as InputInstance;
	const currentMaxlength = ref(props.maxlength);

	// 输入框内容允许输入的长度
	const getMaxLength = (value: number | string) => {
		if (!props.bytes) return props.maxlength;
		let extraLength = getBytesLength(value);
		return props.maxlength + extraLength;
	};

	const handlePaste = (e: ClipboardEvent) => {
		// 只有在bytes下,会需要重新计算maxlength
		if (props.bytes) {
			let content = currentValue.value + (e.clipboardData as DataTransfer).getData('text');
			if (!checkMaxlength(content, props.maxlength)) { e.preventDefault(); }
			currentMaxlength.value = getMaxLength(content);
		}

		emit('paste', e);
	};

	watch(
		() => props.modelValue,
		(v) => {
			if (Array.isArray(v)) return;
			currentMaxlength.value = getMaxLength(v);
		},
		{ immediate: false }
	);

	watch(
		() => props.maxlength,
		(v) => {
			if (!props.bytes) {
				currentMaxlength.value = v;
			} else {
				let extraLength = getBytesLength(currentValue.value);
				currentMaxlength.value = v + extraLength;
			}
		},
		{ immediate: false }
	);

	return {
		currentMaxlength,
		handlePaste
	};
};