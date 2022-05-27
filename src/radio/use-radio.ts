import { inject, getCurrentInstance, ref, watch, computed } from 'vue';

export default () => {
	const instance = getCurrentInstance();
	const group = inject('radio-group', {});
	const formItem = inject('form-item', {});

	const { props, emit } = instance;

	const currentValue = ref(undefined);
	const isFocus = ref(false);

	// 优先找value和label都有值，value用于选择，label用于展示
	const computedValue = computed(() => {
		return typeof props.value === 'undefined' || props.value === ''
			? props.label
			: props.value;
	});

	const computedLabel = computed(() => {
		return typeof props.label === 'undefined' || props.label === ''
			? props.value
			: props.label;
	});

	const hasGroup = computed(() => {
		return !!group.props;
	});

	const checked = computed(() => {
		return hasGroup.value 
			? group.currentValue.value === computedValue.value
			: currentValue.value === props.trueValue;
	});

	const radioName = computed(() => {
		return hasGroup.value 
			? group.props.name
			: props.name;
	});

	const isDisabled = computed(() => {
		return hasGroup.value 
			? (group.props.disabled || props.disabled)
			: props.disabled;
	});

	const classes = computed(() => {
		return { 
			'is-checked': checked.value, 
			'is-disabled': isDisabled.value,
			'is-focus': isFocus.value,
		};
	});

	watch(
		() => props.modelValue,
		(v) => {
			currentValue.value = v;
		},
		{ immediate: true }
	);

	const reset = ($checked) => {
		currentValue.value = $checked ? props.trueValue : props.falseValue;
	};

	/**
	 * v-model 同步, 外部的数据改变时不会触发
	 */
	const sync = (e) => {
		emit('update:modelValue', currentValue.value, e, reset);
		emit('change', currentValue.value, e, reset);
		formItem?.change?.(currentValue.value);
	};

	const handleChange = (e) => {
		if (props.disabled) {
			return false;
		}
		let $checked = e.target.checked;

		if (hasGroup.value) {
			group.reset(computedValue.value);
			group.sync(e);
		} else {
			reset($checked);
			sync(e);
		}
	};

	const handleBlur = () => {
		isFocus.value = false;
	};

	const handleFocus = () => {
		isFocus.value = true;
	};

	return {
		currentValue,
		isFocus,
		isDisabled,
		radioName,
		classes,
		hasGroup,
		checked,
		handleChange,
		handleBlur,
		handleFocus,
		sync,
		reset,
		computedValue,
		computedLabel
	};
};