import { computed, getCurrentInstance } from 'vue';
import type { InputInstance } from './types';

export default () => {
	const { props } = getCurrentInstance() as InputInstance;
	const binds = computed(() => {
		return {
			id: props.elementId, // 此id用于input, 不能改为this.id
			autocomplete: props.autocomplete,
			spellcheck: props.spellcheck,
			type: props.type,
			placeholder: props.placeholder,
			disabled: props.disabled,
			maxlength: props.maxlength, // 频率高
			readonly: props.readonly,
			name: props.name,
			// value: props.currentValue, // 频率高
			number: props.number,
			autofocus: props.autofocus,
			focusEnd: props.focusEnd
		};
	});

	return {
		binds,
	};
};