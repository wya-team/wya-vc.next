<template>
	<vcm-picker-view
		v-model="currentValue"
		:data-source="rebuildData"
		:cols="cols"
		:cascade="false"
		@picker-change="handleChange"
	/>
</template>

<script lang="ts">
import { defineComponent, watch, inject, ref, onUnmounted, onMounted, computed, getCurrentInstance } from 'vue';
import { Utils } from '@wya/utils';
import MPicker from '../../picker/index.m';
import { VcError } from '../../vc/index';
import { getSelectedData } from '../../utils/index';
import { value2date, date2value, parseMode, getMonthEndDay } from '../utils';
import { QUARTER_CN } from '../constants';

const getQuarterMonth = (value) => {
	let month = value.getMonth();
	switch (month) {
		case 0:
		case 2:
			return '1';
		case 3:
		case 5:
			return '2';
		case 6:
		case 8:
			return '3';
		case 9:
		case 11:
			return '4';
		default:
			return '';
	}
};
/**
 * 设置默认值，格式化值 -> ['2020-01', '2020-03'] -> ['2020', '1']
 */
const getQuarterValue = (val) => {
	let year = new Date().getFullYear();
	let quarter = '1';
	if (val.length) {
		year = new Date(val[0]).getFullYear();
		quarter = getQuarterMonth(val[0]);
	}
	return [year + '', quarter];
};

const compareWithBoundary = (arg1 = [], arg2 = [], len = 0) => {
	return arg1.slice(0, len).join('') == arg2.slice(0, len).join('');
};

export default defineComponent({
	name: "vcm-date-picker-view",
	components: { 
		'vcm-picker-view': MPicker.View 
	},
	props: {
		modelValue: {
			type: [Date, Array, String],
			// default: () => new Date()
		},
		mode: {
			type: String,
			default: 'datetime',
		},
		// iOS时间不要使用xxxx-xx -> xxxx/xx
		minDate: {
			type: Date,
			default: () => new Date('1940/01/01 00:00')
		},
		maxDate: {
			type: Date,
			default: () => {
				// 默认 50 年后
				const now = new Date();
				return new Date(now.setFullYear(now.getFullYear() + 50));
			}
		},
		startHour: {
			type: Number,
			default: 0
		},
		endHour: {
			type: Number,
			default: 23
		},
		allowDispatch: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'change', 'picker-change'],
	setup(props, { emit }) {
		const currentValue = ref([]);
		const rebuildData = ref([]);
		const formItem = inject('form-item', {});
		const modeArr = computed(() => {
			return parseMode(props.mode).split('');
		});
		const cols = computed(() => {
			return modeArr.value.length;
		});
		/**
		 * TODO: 最优算法
		 */
		const ranges = computed(() => {
			let current = currentValue.value;
			let min = date2value(props.minDate);
			let max = date2value(props.maxDate);

			// year
			let minYear = Number(min[0]);
			let maxYear = Number(max[0]);
			let year = [minYear, maxYear];

			// month
			let minMonth = compareWithBoundary(min, current, 1) 
				? Number(min[1])
				: 1;
			let maxMonth = compareWithBoundary(max, current, 1) 
				? Number(max[1])
				: 12;
			let month = [minMonth, maxMonth];

			// date
			let minDate = compareWithBoundary(min, current, 2)
				? Number(min[2])
				: 1;
			let maxDate = compareWithBoundary(max, current, 2)
				? Number(max[2])
				: getMonthEndDay(current[0], current[1]);
			let date = [minDate, maxDate];

			// hour
			let minHour = compareWithBoundary(min, current, 3)
				? Number(min[3])
				: 0;

			let maxHour = compareWithBoundary(max, current, 3)
				? Number(max[3])
				: 23;
			let hour = [minHour, maxHour];

			// minute
			let minMinute = compareWithBoundary(min, current, 4)
				? Number(min[4])
				: 0;

			let maxMinute = compareWithBoundary(max, current, 4)
				? Number(max[4])
				: 59;
			let minute = [minMinute, maxMinute];

			switch (props.mode) {
				case 'date':
					return {
						year,
						month,
						date,
					};
				case 'time':
					return {
						hour: [props.startHour, props.endHour],
						min: [0, 59]
					};
				case 'quarter':
					return {
						year,
						quarter: [1, 4]
					};
				default:
					return {
						year,
						month,
						date,
						hour,
						min: minute
					};
			}
		});

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			let v = currentValue.value;
			let formaterValue = props.mode === 'quarter' ? v : value2date(v);
			props.allowDispatch && formItem.change?.(formaterValue);
			emit('update:modelValue', formaterValue);
			emit('change', formaterValue);
		};

		const makeData = (type, start, end) => {
			const INTERVAL_MAP = {
				Y: '年',
				M: '月',
				D: '日',
				H: '时',
				m: '分',
				Q: '季度'
			};
			let arr = Array.from({ length: end - start + 1 }, (no, x) => {
				let afterNum = x + start;
				let finallyStr = type === 'Q' ? `第${QUARTER_CN[afterNum]}` : String(Utils.preZero(afterNum));

				return {
					value: type === 'Q' ? String(afterNum) : finallyStr,
					label: finallyStr + INTERVAL_MAP[type]
				};
			});
			return arr;
		};

		const makeRebuildData = () => {
			let result = [];
			const INTERVAL_MAP = {
				Y: ranges.value.year,
				M: ranges.value.month,
				D: ranges.value.date,
				H: ranges.value.hour,
				m: ranges.value.min,
				Q: ranges.value.quarter
			};
			modeArr.value.forEach(type => {
				if (INTERVAL_MAP[type]) {
					result.push(makeData(type, ...INTERVAL_MAP[type]));
				}
			});

			return result;
		};


		const checkValue = () => {
			let data = rebuildData.value;
			for (let i = 0; i < data.length; i++) {
				let eq = data[i].find(item => item.value === currentValue.value[i]);
				if (!eq) {
					currentValue.value.splice(i, 1, data[i][0].value);
				}
			}
		};

		const handleChange = (v, index) => {
			/**
			 * 重新计算值
			 */
			currentValue.value.splice(index, 1, v);
			rebuildData.value = makeRebuildData();

			// 检查数值
			checkValue();

			emit('picker-change', v, index);

			sync();
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
				if (currentValue.value.length === 0 
					|| (+new Date(v) !== +value2date(currentValue.value) && props.mode !== 'quarter') 
					|| (props.mode === 'quarter' && currentValue.value !== v)) {
					currentValue.value = props.mode === 'quarter' ? getQuarterValue(v) : date2value(v, modeArr.value);
					rebuildData.value = makeRebuildData();
				}
			},
			{ immediate: true }
		);

		return {
			currentValue,
			rebuildData,
			modeArr,
			cols,
			ranges,
			handleChange
		};
	}
});
</script>
