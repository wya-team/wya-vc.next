<template>
	<div class="vcm-date-picker" @click="handleClick">
		<slot 
			v-if="$slots.default" 
			:label="formatterValue" 
		/>
		<vcm-list-item 
			v-else 
			:label="label" 
			:label-width="labelWidth" 
			:extra="formatterValue" 
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, watch, inject, ref, onUnmounted, onMounted, computed, getCurrentInstance } from 'vue';
import { pick } from 'lodash';
import Core, { Func } from './core';
import List from '../../list/index.m';
import { VcError } from '../../vc/index';
import { getSelectedData } from '../../utils/index';
import { value2date, date2value, parseMode, TYPE_VALUE_RESOLVER_MAP } from '../utils';
import { getDayCountOfMonth } from '../helper/date-utils';

/**
 * 获取季度对应的月份范围
 */
const getMonthRange = (year, quarter) => {
	let [startMonth, endMonth] = [quarter * 3, quarter * 3 + 2];
	let endDay = getDayCountOfMonth(year, endMonth);
	return [
		new Date(year, startMonth),
		new Date(year, endMonth, endDay)
	];
};

export default {
	name: "vcm-date-picker",
	components: {
		'vcm-list-item': List.Item
	},
	props: {
		...pick(List.Item.props, [
			'label',
			'labelWidth'
		]),
		...pick(Core.props, [
			'mode',
			'minDate',
			'maxDate',
			'startHour',
			'endHour',
			'format',
			'modelValue',
			'title',
			'cancelText',
			'okText',
			'showToolbar'
		]),
		loadData: Function,
		extra: {
			type: String,
			default: '请选择'
		},
		// 只能是String, 函数使用formatter
		format: {
			type: String,
			default: 'YYYY-MM-DD HH:mm'
		},
		formatter: {
			type: Function,
			default: (v, format) => {
				if (!v) return v;
				let arr = date2value(v);
				/**
				 * TODO
				 */
				return format
					.replace('YYYY', arr[0])
					.replace('MM', arr[1])
					.replace('DD', arr[2])
					.replace('HH', arr[3])
					.replace('mm', arr[4]);
			}
		},
		title: String
	},
	emits: ['update:modelValue', 'ok', 'cancel', 'change', 'close'],
	setup(props, { emit }) {
		const currentValue = ref(undefined);
		const formItem = inject('form-item', {});

		const formatterValue = computed(() => {
			if (props.mode === 'quarter') {
				const { formatterText } = (TYPE_VALUE_RESOLVER_MAP[props.mode] || TYPE_VALUE_RESOLVER_MAP.default);
				return formatterText(currentValue.value);
			} else {
				return props.formatter(currentValue.value, props.format) || props.extra;
			}
		});

		let pickerInstance;

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			emit('update:modelValue', currentValue.value);
			emit('change', currentValue.value);
			// form表单
			formItem.change?.(currentValue.value);
		};

		/**
		 * 格式化季度数据，季度数据在picker-view是['2020', '2'] -> [‘2020-03-31’， ‘2020-06-29’]
		 * val是date数据则不进行转换
		 */
		const getCurrentValue = (val) => {
			if (props.mode !== 'quarter' || !val.length || (val[0] instanceof Date && val[1] instanceof Date)) return val;
			return getMonthRange(val[0], val[1] - 1);
		};

		const handleClick = () => {
			let { mode, minDate, maxDate, format, modelValue, title, cancelText, okText, showToolbar, show } = props;
			Func.popup({
				mode,
				minDate,
				maxDate,
				format,
				modelValue,
				title,
				cancelText,
				showToolbar,
				show,
				okText,
				onClose: () => {
					emit('close');
				},
				onOk: res => {
					currentValue.value = getCurrentValue(res);
					emit('ok', currentValue.value);

					sync();
				},
				onCancel: res => {
					emit('cancel');
				},
				getInstance: vm => pickerInstance = vm
			});
		};


		watch(
			() => props.modelValue,
			(v) => {
				if (
					(v && new Date(v) == 'Invalid Date' && props.mode !== 'quarter') 
					|| (!Array.isArray(v) && props.mode === 'quarter')
				) {
					throw new VcError('m-data-picker', 'Invalid Date');
				}

				/**
				 * 事件对象情况下同值会重新set
				 * 如果v为undefined，currentValue.value也undefined
				 * NaN !== NaN true -> currentValue.value = undefined;
				 */
				if (+new Date(v) !== +currentValue.value) {
					currentValue.value = getCurrentValue(v);
				}
			},
			{ immediate: true }
		);

		onUnmounted(() => {
			pickerInstance && pickerInstance.destroy();
		});
		return {
			currentValue,
			formatterValue,
			handleClick
		};
	}
};

</script>

