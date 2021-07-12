import { provide, inject, getCurrentInstance, ref, watch, computed } from 'vue';
import { isEqualWith } from 'lodash';

export default () => {
	const instance = getCurrentInstance();
	const { props, emit } = instance;
	const formItem = inject('form-item', {});

	const currentValue = ref([]);

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
		let index = currentValue.value.findIndex(i => i == v);
		index == -1 
			? currentValue.value.push(v)
			: currentValue.value.splice(index, 1);
	};

	/**
	 * v-model 同步, 外部的数据改变时不会触发
	 */
	const sync = (e) => {
		emit('update:modelValue', currentValue.value, e, reset);
		emit('change', currentValue.value, e, reset);

		formItem?.change?.(currentValue.value);
	};

	provide('checkbox-group', {
		props,
		currentValue,
		reset,
		sync
	});
	
	return {
		currentValue,
		sync,
		reset
	};
};