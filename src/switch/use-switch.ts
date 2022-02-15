import { inject, getCurrentInstance, ref, watch, computed } from 'vue';
import { useAttrs } from '../hooks/index';

export default () => {
	const instance = getCurrentInstance();
	const formItem = inject('form-item', {});

	const { props, emit, attrs } = instance;

	const currentValue = ref('');
	const isLoading = ref(false);

	const checked = computed(() => {
		return currentValue.value === props.trueValue;
	});

	const classes = computed(() => {
		return { 
			'is-loading': isLoading.value,
			'is-checked': checked.value
		};
	});

	watch(
		() => props.modelValue,
		(v) => {
			currentValue.value = v;
		},
		{ immediate: true }
	);

	const reset = (value) => {
		console.log(value);
		currentValue.value = value === props.trueValue 
			? props.trueValue
			: props.falseValue;
	};

	/**
	 * v-model 同步, 外部的数据改变时不会触发
	 */
	const sync = (e) => {
		emit('update:modelValue', currentValue.value, e, reset);
		emit('change', currentValue.value, e, reset);
		formItem?.change?.(currentValue.value);
	};

	const handleToggle = (e) => {
		console.log(e);
		e.preventDefault();

		if (props.disabled || isLoading.value) {
			return false;
		}

		let callback = () => {
			let value = currentValue.value === props.trueValue 
				? props.falseValue 
				: props.trueValue;

			reset(value);
			sync(e);
		};

		let { onClick } = instance.vnode.props;
		let fn = onClick && onClick(e, reset);

		if (fn && fn.then) {
			isLoading.value = true;
			fn.then(res => {
				callback();
				return res;
			}).finally(() => {
				isLoading.value = false;
			});
		} else if (!fn) {
			callback();
		}
	};
	return {
		currentValue,
		isLoading,
		classes,
		checked,
		handleToggle,
		sync,
		reset
	};
};