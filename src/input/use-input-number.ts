import { ref, watch, computed, getCurrentInstance } from 'vue';
import type { Ref } from 'vue';
import { VcError } from '../vc/index';
import type { InputInstance, InputValue, CompareValue } from './types';

export default () => {
	const instance = getCurrentInstance() as InputInstance;
	const { emit, props } = instance;
	const currentValue: Ref<InputValue> = ref('');
	const isInput = ref(false);
	
	let hookValue: InputValue;
	let timer: Nullable<TimeoutHandle>;

	watch(
		() => props.modelValue,
		(v) => {
			// hookValue有值后将不再在此处赋值
			if (!timer && !hookValue && !isInput.value) {
				hookValue = v;
			}
			currentValue.value = v;
		},
		{ immediate: true }
	);

	const plusDisabled = computed(() => {
		return props.disabled || currentValue.value >= props.max;
	});

	const minusDisabled = computed(() => {
		return props.disabled || currentValue.value <= props.min;
	});

	const formatterValue = computed(() => {
		return isInput.value
			? currentValue.value
			: props.formatter(currentValue.value, props.precision);
	});

	const afterHook = async (value: InputValue) => {
		let { onAfter: after } = instance.vnode.props;
		if (!after) return true;
		let state = await after?.(value);
		if (state) {
			hookValue = value;
		} else {
			emit('input', hookValue);
			emit('update:modelValue', hookValue);
		}
		return state;
	};

	const compareWithBoundary = ({ value, tag }: CompareValue) => {
		if (value > props.max) {
			value = props.max;

			emit('tip', {
				type: 'max',
				msg: `数值不能超过${value}`,
				value,
				tag
			});
		}

		if (value < props.min) {
			value = props.min;

			emit('tip', {
				type: 'min',
				msg: `数值不能低于${value}`,
				value,
				tag
			});
		}
		return value;
	};

	/**
	 * 得到一个正确展示的value
	 */
	const composeValue = ({ value, tag }: CompareValue) => {
		// 失焦时，只留一个'-'或为''
		value = /^(-|)$/.test(value as string)
			? '' 
			: compareWithBoundary({ value, tag });
		value = props.required && !value
			? String(props.min)
			: value;

		return typeof props.output === 'function' 
			? props.output(value) 
			: props.output === 'number'
				? Number(value)
				: value;
	};

	const handleKeyup = async (e: KeyboardEvent) => {
		// 数字键盘
		if (e.key === 'Enter') {
			let value = composeValue({
				value: currentValue.value as string,
				tag: 'input'
			});

			try {
				let state = await afterHook(value);
				state && (emit('input', value), emit('update:modelValue', value));
				emit('enter', e);
			} catch (error) {
				throw new VcError('vc-input-number', error);
			}

		}
		emit('keyup', e);
	};

	const handleInput = (value: string) => {
		isInput.value = true;

		value = value.trim();

		if (/[^-]/.test(value) && Number.isNaN(Number(value))) { // `[A-Za-z]` -> ''
			value = currentValue.value as string;
		} else if (/[-]{2,}/.test(value)) { // `--` -> `-`
			value = '-';
		} else if (value !== '') {
			let regex = props.precision
				? new RegExp(`(.*\\.[\\d]{${props.precision}})[\\d]+`)
				: new RegExp(`(.*)\\.`);

			value = value.replace(regex, '$1');
			// 0002 -> 2, 0.2 -> .2
			value = value === '0' ? '0' : value.replace(/^[0]{1,}/, '');
			// '0.' -> '.' -> '0.'
			value = value.charAt(0) === '.' ? `0${value}` : value;
		}

		// TODO: 实时边界值计算, 矛盾点考虑加入最小值是100, 无法删除到最小值以下
		// if (this.min <= 1 && value !== '') {
		// 	value = this.compareWithBoundary({ value, tag: 'input' });
		// }

		emit('input', value);
		emit('update:modelValue', value);
	};

	const handleBlur = async (e: InputEvent) => {
		isInput.value = false;
		let value = composeValue({
			value: currentValue.value as string, 
			tag: 'input' 
		});

		try {
			let state = await afterHook(value);
			state && (emit('input', value), emit('update:modelValue', value));
			emit('blur', e, Number((e.target as any).value));
		} catch (error) {
			throw new VcError('vc-input-number', error);
		}
	};

	/**
	 * 为防止在有after的时候多次触发input事件，返回state
	 * 没有after时，返回true，有外面自己发射input
	 * 有after时，根据after的返回值，如果是false，则由内部发射input事件，重新赋值value；
	 * 如果是true，也由外部发射
	 */
	const afterDebounce = (value: InputValue) => {
		timer && clearTimeout(timer);
		timer = setTimeout(() => {
			afterHook(value);
			timer = null;
		}, 500);
	};

	const handleStepper = async (base: number) => {
		let { onPlus: plus, onMinus: minus, onBefore: before } = instance.vnode.props;
		if (base === 1 && plusDisabled.value) {
			emit('tip', {
				type: 'max',
				msg: '不能再多了',
				tag: 'button'
			});
			return;
		} else if (base === -1 && minusDisabled.value) {
			emit('tip', {
				type: 'min',
				msg: '不能再少了',
				tag: 'button'
			});
			return;
		}

		if (base === 1 && plus) { return plus?.(); }
		if (base === -1 && minus) { return minus?.(); }

		let value: string | number = +currentValue.value + props.step * base;
		value = compareWithBoundary({ value, tag: 'button' });

		let state = true;
		try {
			if (before) {
				state = await before?.(value);
			}

			state && (emit('input', value), emit('update:modelValue', value));
			afterDebounce(value);
		} catch (e) {
			throw new VcError('vc-input-number', e);
		}
	};

	const listeners = {
		keypress: (e: any) => emit('keypress', e),
		keydown: (e: any) => emit('keydown', e),
		change: (e: any) => emit('keyup', e),
		focus: (e: any) => emit('focus', e),
		keyup: handleKeyup,
		blur: handleBlur,
		input: handleInput,
	};

	return {
		currentValue,
		listeners,
		plusDisabled,
		minusDisabled,
		formatterValue,
		handleStepper
	};
};