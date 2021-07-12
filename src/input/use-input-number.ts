import { ref, inject, watch, computed, getCurrentInstance } from 'vue';
import { checkMaxlength } from './utils';
import { VcError } from '../vc/index';

export default (input) => {
	const instance = getCurrentInstance();
	const { emit, props } = instance;
	const currentValue = ref('');
	const isInput = ref(false);
	const isNumber = ref(false);
	
	let hookValue;
	let timer;

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

	const afterHook = async (value) => {
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

	/**
	 * @param  {String}  options.value
	 * @param  {Boolean} options.tag 类型（input | button）
	 * @return {String} 输入的值
	 */
	const compareWithBoundary = ({ value, tag }) => {

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
	const composeValue = ({ value, tag }) => {
		// 失焦时，只留一个'-'或为''
		value = /^(-|)$/.test(value)
			? '' 
			: compareWithBoundary({ value, tag });
		value = props.required && !value
			? props.min
			: value;

		return typeof props.output === 'function' 
			? props.output(value) 
			: props.output === 'number'
				? Number(value)
				: value;
	};

	const handleKeyup = async (e) => {
		// 数字键盘
		if (e.keyCode == 13 || e.keyCode == 108) {

			let value = composeValue({
				value: currentValue.value,
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

	const handleInput = (value, e) => {
		isInput.value = true;

		value = value.trim();

		if (/[^-]/.test(value) && Number.isNaN(Number(value))) { // `[A-Za-z]` -> ''
			value = currentValue.value;
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

	const handleBlur = async (e) => {
		isInput.value = false;
		let value = composeValue({
			value: currentValue.value, 
			tag: 'input' 
		});

		try {
			let state = await afterHook(value);
			state && (emit('input', value), emit('update:modelValue', value));
			emit('blur', e, Number(e.target.value));
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
	const afterDebounce = (value) => {
		timer && clearTimeout(timer);
		timer = setTimeout(() => {
			afterHook(value);
			timer = null;
		}, 500);
	};

	const handleStepper = async (base) => {
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

		let value = +currentValue.value + props.step * base;
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
		keypress: (e) => emit('keypress', e),
		keydown: (e) => emit('keydown', e),
		change: (e) => emit('keyup', e),
		focus: (e) => emit('focus', e),
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