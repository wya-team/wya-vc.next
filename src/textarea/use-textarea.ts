import { nextTick, inject, ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { pick } from 'lodash';
import { getComputedHeight } from './utils';
import { Resize } from '../utils';
import { checkMaxlength } from '../input/utils';

export default (textarea) => {
	const instance = getCurrentInstance();
	const { props, emit } = instance;
	const formItem = inject('form-item', {});

	const currentValue = ref(null);
	const isOnComposition = ref(false);
	const isFocus = ref(false);
	const calcTextareaStyle = ref({});
	const contentStyle = ref({});

	/**
	 * for v-model
	 */
	const sync = (v, e) => {
		emit('update:modelValue', v, e);
		emit('input', v, e);
		emit('change', e);

		props.allowDispatch && formItem?.change?.(v);
	};

	const refresh = () => {
		if (!props.autosize) return;

		const { minRows, maxRows } = props.autosize;

		nextTick(() => {
			calcTextareaStyle.value = getComputedHeight({
				el: textarea.value,
				minRows, 
				maxRows
			});
		});
	};

	const handleKeydown = (e) => {
		emit('keydown', e);
	};

	const handleKeypress = (e) => {
		emit('keypress', e);
	};

	const handleKeyup = (e) => {
		if (e.keyCode == 13) {
			emit('enter', e);
		}
		emit('keyup', e);
	};

	const handleFocus = (e) => {
		isFocus.value = true;
		emit('focus', e);
	};

	const handleBlur = (e) => {
		isFocus.value = false;

		emit('blur', e);
		props.allowDispatch && formItem?.blur?.(currentValue.value);
	};

	const handleChange = (e) => {
		emit('change', e);
	};

	const handleInput = (e) => {
		let value = e.target.value;
		if (isOnComposition.value || value === currentValue.value) return;

		if (!checkMaxlength(value, props.maxlength)) {
			e.preventDefault();
			instance.ctx?.$forceUpdate?.(); // hack
			return;
		}

		currentValue.value = value;

		refresh();
		sync(value, e);
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

	/**
	 * TODO
	 */
	const handleResize = (e) => {
		contentStyle.value = {
			height: `${textarea.value ? textarea.value.offsetHeight : 0}px`
		};

		emit('resize', e);
	};

	const handlePaste = (e) => {
		emit('paste', e);
	};

	const focus = () => {
		textarea.value.focus();
	};

	const blur = () => {
		textarea.value.blur();
	};

	const classes = computed(() => {
		return {
			'is-focus': isFocus.value,
			'is-disabled': props.disabled
		};
	});

	const listeners = computed(() => {
		return {
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
	});

	const binds = computed(() => {
		return {
			id: props.elementId, // 此id用于input, 不能改为this.id
			autocomplete: props.autocomplete,
			spellcheck: props.spellcheck,
			placeholder: props.placeholder,
			disabled: props.disabled,
			maxlength: props.maxlength,
			readonly: props.readonly,
			name: props.name,
			rows: props.rows,
			wrap: props.wrap,
			// value: currentValue.value, // 频率高
			autofocus: props.autofocus
		};
	});

	watch(
		() => props.modelValue,
		(v) => {
			currentValue.value = v;
			refresh();
		},
		{ immediate: true }
	);

	onMounted(() => {
		Resize.on(textarea.value, handleResize);
		refresh();
	});

	onBeforeUnmount(() => {
		Resize.off(textarea.value, handleResize);
	});

	return {
		currentValue,
		isOnComposition,
		isFocus,
		calcTextareaStyle,
		contentStyle,
		classes,
		listeners,
		binds,
		focus,
		blur
	};
};