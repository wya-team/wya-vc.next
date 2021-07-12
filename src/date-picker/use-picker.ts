import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed, inject } from 'vue';
import { isEqualWith } from 'lodash';
import { DEFAULT_FORMATS } from './constants';
import { TYPE_VALUE_RESOLVER_MAP, isEmpty, value2Array } from './utils';
import { VcError } from '../vc/index';
import { useAttrs } from '../hooks';

export default () => {
	const instance = getCurrentInstance();
	const { props, emit } = instance;
	
	const isHover = ref(false);
	const isActive = ref(false);
	const currentValue = ref('');
	const focusedDate = ref(null);
	const formItem = inject('form-item', {});
	const its = useAttrs({ standard: false });
	const formatDateText = (value) => {
		const format = DEFAULT_FORMATS[props.type];
		if (props.multiple) {
			const formatterText = TYPE_VALUE_RESOLVER_MAP.multiple.formatterText;
			return formatterText(value, props.format || format, props.separator);
		} else {
			const { formatter, formatterText } = (TYPE_VALUE_RESOLVER_MAP[props.type] || TYPE_VALUE_RESOLVER_MAP.default);
			let fn = formatterText || formatter;
			return fn(value, props.format || format, props.separator);
		}
	};

	const showClear = computed(() => {
		let value = !props.multiple ? !isEmpty(currentValue.value) : currentValue.value.length > 0;
		let basic = props.clearable && !props.disabled && isHover.value;
		return value && basic;
	});
	const classes = computed(() => {
		return {
			'is-disabled': props.disabled
		};
	});
	const isConfirm = computed(() => {
		return props.confirm || props.type === 'datetime' || props.type === 'datetimerange' || props.multiple;
	});
	// 展示的value
	const visibleValue = computed(() => {
		return formatDateText(currentValue.value);
	});
	const showTime = computed(() => {
		return ['datetime', 'datetimerange'].includes(props.type);
	});
	const isRange = computed(() => {
		return props.type.includes('range');
	});
	const isQuarter = computed(() => {
		return ['quarter'].includes(props.type);
	});
	const isTime = computed(() => {
		return ['time', 'timerange'].includes(props.type);
	});

	const formatDate = (value) => {
		const format = DEFAULT_FORMATS[props.type];
		if (props.multiple) {
			const formatter = TYPE_VALUE_RESOLVER_MAP.multiple.formatter;
			return formatter(value, props.format || format, props.separator);
		} else {
			const { formatter } = (TYPE_VALUE_RESOLVER_MAP[props.type] || TYPE_VALUE_RESOLVER_MAP.default);
			return formatter(value, props.format || format, props.separator);
		}
	};

	const parserDate = (value) => {
		const format = DEFAULT_FORMATS[props.type];
		if (props.multiple) {
			const parser = TYPE_VALUE_RESOLVER_MAP.multiple.parser;
			return parser(value, props.format || format, props.separator);
		} else {
			const { parser } = (TYPE_VALUE_RESOLVER_MAP[props.type] || TYPE_VALUE_RESOLVER_MAP.default);
			return parser(value, props.format || format, props.separator);
		}
	};

	const parseValue = (val) => {
		if (isEmpty(val)) {
			return isRange.value ? [null, null] : [];
		}
		return parserDate(val);
	};

	const rest = (date) => {
		currentValue.value = date;
	};

	const sync = (eventName, value) => {
		const date = isRange.value || isQuarter.value ? value : value[0];
		const dateString = formatDate(value);

		emit('input', date);
		emit('update:modelValue', date);
		eventName = typeof eventName === 'string' ? [eventName] : eventName;
		eventName.forEach(name => {
			emit(name, dateString, rest);
		});
		formItem.change?.(date);
	};

	const executePromise = (promiseFn, cb, param) => {
		try {
			const promise = promiseFn && promiseFn(param);
			if (promise && promise.then()) {
				promise.then(() => {
					cb();
				}).catch(() => {
					return;
				});
			} else {
				cb();
			}
		} catch (error) {
			emit('error', error);
		}
	};

	const handlePick = (value, prevDate) => {
		// 在panel上点击时，同步focusedDate
		focusedDate.value = value[0] || prevDate || new Date();

		if ((!isConfirm.value && !isTime.value) || props.changeOnSelect) { 
			setTimeout(() => { isActive.value = false; }, 100); // 添加延迟，可以让使用者看到选中效果后再关闭弹层
		}
		
		currentValue.value = value;
		(!isConfirm.value || props.changeOnSelect) && sync('change', value);
	};


	const handleClear = () => {
		const clear = () => {
			const date = isRange.value ? [] : '';
			isActive.value = false;
			currentValue.value = date;
			sync('change', date);
			emit('clear', date);
		};
		executePromise(instance.vnode.props.onBeforeClear, clear);
	};

	const handleIconClick = (e) => {
		if (!showClear.value) return;
		e.stopPropagation();
		handleClear();
	};


	const handleOK = (value) => {
		const ok = () => {
			isActive.value = false;
			sync(['change', 'ok'], value);
		};
		executePromise(instance.vnode.props.onBeforeOk, ok, value);
	};


	const handleClose = () => {
		let val = parseValue(props.modelValue);
		// 是否有传value值，如果没传currentValue不回滚
		let isSetValueProp = instance.props.modelValue;
		if (!isEqualWith(currentValue.value, val) && isSetValueProp) {
			currentValue.value = value2Array(val);
		}
		emit('close');
	};

	watch(
		() => props.modelValue,
		(v) => {
			v = parseValue(v);
			focusedDate.value = v[0] || props.startDate || new Date();
			currentValue.value = value2Array(v);
		},
		{ immediate: true }
	);

	watch(
		() => props.open,
		(v) => {
			isActive.value = v;
		},
		{ immediate: true }
	);

	return {
		its,
		isHover,
		isActive,
		currentValue,
		focusedDate,
		showClear,
		classes,
		isConfirm,
		visibleValue,
		showTime,
		isRange,
		isQuarter,
		isTime,

		handleIconClick,
		handlePick,
		handleClear,
		handleOK,
		handleClose
	};
};