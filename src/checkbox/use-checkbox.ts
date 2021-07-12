import { inject, getCurrentInstance, ref, watch, computed } from 'vue';

export default () => {
	const instance = getCurrentInstance();
	const group = inject('checkbox-group', {});
	const formItem = inject('form-item', {});

	const { props, emit } = instance;

	const currentValue = ref(undefined);
	const isFocus = ref(false);

	const hasGroup = computed(() => {
		return !!group.props;
	});

	const checked = computed(() => {
		return hasGroup.value 
			? group.currentValue.value.includes(props.label)
			: currentValue.value === props.trueValue;
	});

	const classes = computed(() => {
		return { 
			'is-indeterminate': props.indeterminate, 
			'is-checked': checked.value, 
			'is-disabled': props.disabled,
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
			group.reset(props.label);
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
		classes,
		hasGroup,
		checked,
		handleChange,
		handleBlur,
		handleFocus,
		sync,
		reset
	};
};