import { ref, inject, watch, getCurrentInstance } from 'vue';
import { checkMaxlength, getBytesLength } from './utils';

export default (input, currentValue) => {
	const { props, emit } = getCurrentInstance();
	const currentMaxlength = ref(props.maxlength);

	// 输入框内容允许输入的长度
	const getMaxLength = (value) => {
		if (!props.bytes) return props.maxlength;
		let extraLength = getBytesLength(value);
		return props.maxlength + extraLength;
	};

	const handlePaste = (e) => {
		// 只有在bytes下,会需要重新计算maxlength
		if (props.bytes) {
			let content = currentValue.value + e.clipboardData.getData('text');
			if (!checkMaxlength(content)) { e.preventDefault(); }
			currentMaxlength.value = getMaxLength(content);
		}

		emit('paste', e);
	};

	watch(
		() => props.modelValue,
		(v) => {
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