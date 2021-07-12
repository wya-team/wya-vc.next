import { provide, inject, ref, computed, watch, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';

import { cloneDeep } from 'lodash';
import AsyncValidator from 'async-validator';
import { RegEx } from '@wya/utils';
import { getPropByPath } from '../utils';
import { IS_DEV } from '../utils/constant';
import { VcError } from '../vc';

const filterEmpty = (val) => {
	if (val instanceof Array) {
		val = val.filter(i => i !== '');
	}
	return val;
};

export default () => {
	const form = inject('form', {});
	const instance = getCurrentInstance();
	const { props } = instance;
	
	if (IS_DEV && !form.props) {
		throw new VcError('form-item', 'form-item需要在form内使用');
	}

	const formItem = inject('form-item', {});// 嵌套

	const isRequired = ref(false);
	const validateState = ref('');
	const validateMessage = ref('');
	const validateDisabled = ref(false);
	const validator = ref({});

	let initialValue;

	const classes = computed(() => {
		return {
			'is-require': props.required || isRequired.value,
			'is-error': validateState.value === 'error',
			'is-validating': validateState.value === 'validating',
			'is-inline': form.props.inline,
			[`is-${form.props.labelPosition}`]: true,
		};
	});

	const labelStyle = computed(() => {
		const labelWidth = props.labelWidth === 0 || props.labelWidth ? props.labelWidth : form.props.labelWidth;
		return {
			width: labelWidth > 0 ? `${labelWidth}px` : 'auto',
			textAlign: form.props.labelPosition
		};
	});

	const contentStyle = computed(() => {
		const labelWidth = props.labelWidth === 0 || props.labelWidth ? props.labelWidth : form.props.labelWidth;
		return {
			marginLeft: labelWidth > 0 ? `${labelWidth}px` : 'unset'
		};
	});

	const fieldValue = computed({
		cache: false,
		get: () => {
			const model = form.props.model;
			if (!model || !props.prop) { return; }

			let path = props.prop;
			if (path.includes(':')) {
				path = path.replace(/:/, '.');
			}

			return getPropByPath(model, path).value;
		}
	});

	const showError = computed(() => {
		return validateState.value === 'error' && props.showMessage && form.props.showMessage;
	});

	watch(
		() => props.error, 
		(v) => {
			validateMessage.value = v;
			validateState.value = v === '' ? '' : 'error';
		}
	);

	const getRules = () => {
		let formRules = form.props.rules;
		const selfRules = props.rules;
		
		// getPropByPath(formRules, this.prop.replace(/\.[0-9]+\./g, '.'));
		formRules = formRules ? formRules[props.prop] : [];
		return cloneDeep([].concat(selfRules || formRules || []));
	};

	const getFilteredRule = (trigger) => {
		const rules = getRules();
		return rules.filter(rule => !rule.trigger || rule.trigger.includes(trigger));
	};

	const setRules = () => {
		let rules = getRules();
		if (rules.length && props.required) {
			// return;
		} else if (rules.length) {
			isRequired.value = rules.some(rule => {
				return typeof rule.required === 'function' 
					? rule.required(() => {}) // 避免报错 契合业务的一种设计（@wya/utils - RegEx: validator）
					: rule.required;
			});
		} else if (props.required) {
			isRequired.value = props.required;
		}
	};


	const resetField = () => {
		validateState.value = '';
		validateMessage.value = '';

		let model = form.props.model;
		let path = props.prop;
		if (path.includes(':')) {
			path = path.replace(/:/, '.');
		}

		let prop = getPropByPath(model, path);

		if (Array.isArray(fieldValue.value)) {
			validateDisabled.value = true;
			prop.target[prop.key] = [].concat(initialValue);
		} else {
			validateDisabled.value = true;
			prop.target[prop.key] = initialValue;
		}
	};

	const validate = (trigger, callback = () => {}) => {
		let rules = getFilteredRule(trigger);

		/**
		 * hack for AsyncValidator
		 * 默认不传校正string
		 */
		rules = rules.map((i) => {
			if (!i.validator && !i.type && i.required) {
				return {
					...i,
					validator: RegEx.validator
				};
			} else {
				return i;
			}
		});
		if (!rules || rules.length === 0) {
			if (!props.required) {
				callback();
				return true;
			} else {
				rules = [{ required: true }];
			}
		}

		validateState.value = 'validating';
		let descriptor = {};

		descriptor[props.prop] = rules;
		let $validator = new AsyncValidator(descriptor);
		let model = {};
		model[props.prop] = filterEmpty(fieldValue.value);

		$validator.validate(model, { firstFields: false }, (errors, fields) => {
			validateState.value = !errors ? 'success' : 'error';
			validateMessage.value = errors ? errors[0].message : '';

			callback({
				prop: props.prop,
				message: validateMessage.value
			});
		});
		validateDisabled.value = false;
	};

	const handleFieldBlur = () => {
		if (!props.prop) {
			formItem.blur?.();
			return;
		}
		validate('blur');
	};
	const handleFieldChange = () => {
		if (!props.prop) {
			formItem.change?.();
			return;
		}
		if (validateDisabled.value) {
			validateDisabled.value = false;
			return;
		}
		validate('change');
	};

	provide('form-item', {
		blur: handleFieldBlur,
		change: handleFieldChange
	});

	onMounted(() => {
		if (props.prop) {
			form.add?.(instance);
			initialValue = cloneDeep(fieldValue.value);
			setRules();
		}
	});

	onBeforeUnmount(() => {
		form.remove?.(instance);
	});

	return {
		isRequired,
		validateState,
		validateMessage,
		validateDisabled,
		validator,
		classes,
		labelStyle,
		contentStyle,
		fieldValue,
		showError,

		validate,
		resetField
	};
	
};