import { provide, inject, getCurrentInstance, ref, watch, computed } from 'vue';
import { isEqualWith } from 'lodash';

export default () => {
	const instance = getCurrentInstance();
	const { props, emit } = instance;
	const formItem = inject('form-item', {});

	const currentValue = ref('');
	const classes = computed(() => {
		return {
			'is-vertical': props.vertical,
			'is-button': props.type === 'button'
		};
	});

	watch(
		() => props.modelValue,
		(v) => {
			if (isEqualWith(v, currentValue.value)) {
				return;
			}
			currentValue.value = v;
		},
		{ immediate: true }
	);

	const reset = (v) => {
		currentValue.value = v;
	};

	/**
	 * v-model 同步, 外部的数据改变时不会触发
	 */
	const sync = (e) => {
		emit('update:modelValue', currentValue.value, e, reset);
		emit('change', currentValue.value, e, reset);

		formItem?.change?.(currentValue.value);
	};

	provide('radio-group', {
		props,
		currentValue,
		reset,
		sync
	});
	
	return {
		currentValue,
		classes,
		sync,
		reset
	};
};