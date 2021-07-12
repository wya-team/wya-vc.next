<template>
	<div style="margin: 50px">
		<h2>快捷操作</h2>
		<h2>Date-shortcuts</h2>
		<vc-date-picker
			:model-value="valueRange2"
			:options="dateRangeOptions"
			type="datetimerange"
			clearable
			placeholder="Select date"
			style="width: 300px"
			@change="handleRangeChange2"
		/>
		<vc-date-picker
			v-model="value"
			:options="dateRange"
			:start-date="new Date('2019', '10', '11')"
			:type="type"
			clearable
			confirm
			format="YYYY-MM-DD"
			placeholder="Select date"
			@change="handleChange"
			@clear="handleClear"
		/>
		<br>
		<h2>Month-shortcuts</h2>
		<vc-date-picker
			v-model="monthRange"
			type="monthrange"
			clearable
			:options="monthOptions"
			confirm
			placeholder="Select date"
			style="width: 200px"
		/>
		<vc-date-picker
			v-model="month"
			type="month"
			clearable
			confirm
			:options="monthRangeOptions"
			placeholder="Select date"
			style="width: 200px"
		/>
		<h2>Quarter-shortcuts</h2>
		<vc-date-picker
			v-model="quarter"
			type="quarter"
			clearable
			confirm
			placeholder="Select date"
			:options="quarterOptions"
			style="width: 200px"
			@change="handleQuarterChange"
		/>
		<h2>QuarterRange-shortcuts</h2>
		{{ quarterrange }}
		<vc-date-picker
			v-model="quarterrange"
			type="quarterrange"
			:options="quarterRangeOptions"
			clearable
			placeholder="Select date"
			style="width: 250px"
			@change="handleQuarterChange"
		/>
	</div>
</template>
<script>
import { defineComponent, ref, computed } from 'vue';
import Message from '../../message';
import DatePicker from '..';

export default defineComponent({
	name: "vc-date-picker-basic",
	components: {
		'vc-date-picker': DatePicker
	},
	setup(props, context) {
		const form = ref(null);
		const value = ref('2010-10-10');
		const year = ref('');
		const month = ref('');
		const monthrange = ref('');
		const quarter = ref('');
		const quarterrange = ref('');
		const type = ref('date');
		const dateOpen = ref(false);
		const monthRange = ref('');
		const value2 = ref([new Date()]);

		const rangeStart = ref('');
		const rangeEnd = ref('');
		const rangeStart2 = ref('');
		const rangeEnd2 = ref('');

		const disableDate = ref({
			disabledDate(date) {
				return date && (date.valueOf() < Date.now() - 86400000 || date.valueOf() > Date.now() + 864000000);
			},
		});
		const timeOpts = ref({
			disabledHours: [],
			disabledMinutes: [],
			disabledTime(date) {
				// 大于当前时间
				return date && (date.valueOf() < Date.now());
			}
		});
		const options = ref({
			disabledDate: (date) => {
				return false;
			}
		});
		const monthOptions = ref({
			shortcuts: [
				{
					text: '一年前',
					value() {
						const startDate = new Date('2019-01-01');
						const endDate = new Date('2020-01-01');
						return [startDate, endDate];
					}
				},
				{
					text: '一年后',
					value() {
						const startDate = new Date('2020-01-01');
						const endDate = new Date('2021-01-01');
						return [startDate, endDate];
					}
				}
			]
		});
		const monthRangeOptions = ref({
			shortcuts: [
				{
					text: '一年前',
					value() {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 365);
						return date;
					}
				},
				{
					text: '一年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365);
						return date;
					}
				},
				{
					text: '二年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 2);
						return date;
					}
				},
				{
					text: '三年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 3);
						return date;
					}
				},
				{
					text: '五年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 5);
						return date;
					}
				}
			]
		});
		const dateRange = ref({
			shortcuts: [
				{
					text: '一年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 365);
						return date;
					}
				},
				{
					text: '二年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 365 * 2);
						return date;
					}
				},
				{
					text: '三年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 365 * 3);
						return date;
					}
				},
				{
					text: 'onClick方法',
					onClick: () => {
						const num = Math.random() * 10;
						const date = new Date();
						if (num > 5) {
							value.value = new Date(date.setTime(date.getTime() - 3600 * 1000 * 24 * 365));
						} else {
							value.value = new Date(date.setTime(date.getTime() - 3600 * 1000 * 24 * 365 * 2));
						}

						console.log(value.value);
					}
				}
			],
			// disabledDate(time) {
			// 	return time.getTime() > Date.now();
			// }
		});
		const dateRangeOptions = ref({
			shortcuts: [
				{
					text: '一年前',
					value() {
						const date = new Date();
						date.setTime(date.getTime() - 3600 * 1000 * 24 * 365);
						return [date, new Date()];
					}
				},
				{
					text: '一年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365);
						return [new Date(), date];
					}
				},
				{
					text: '二年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 2);
						return [new Date(), date];
					}
				},
				{
					text: '三年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 3);
						return [new Date(), date];
					}
				},
				{
					text: '五年',
					value() {
						const date = new Date();
						date.setTime(date.getTime() + 3600 * 1000 * 24 * 365 * 5);
						return [new Date(), date];
					}
				}
			],
			// disabledDate(time) {
			// 	return time.getTime() > Date.now();
			// }
		});
		const quarterOptions = ref({
			shortcuts: [
				{
					text: '19年3季度',
					value() {
						const startDate = new Date('2019-07-01');
						const endDate = new Date('2019-09-01');
						return [startDate, endDate];
					}
				},
				{
					text: '20年1季度',
					value() {
						const startDate = new Date('2020-01-01');
						const endDate = new Date('2020-03-01');
						return [startDate, endDate];
					}
				}
			],
			// disabledDate(time) {
			// 	console.log(time);
			// 	return time > 2 && time < 4;
			// }
		});
		const quarterRangeOptions = ref({
			shortcuts: [
				{
					text: '19/2季度～21/3季度',
					value() {
						const startDate = new Date('2019-04-01');
						const endDate = new Date('2021-09-30');
						return [startDate, endDate];
					}
				},
				{
					text: '21/2季度～24/4季度',
					value() {
						const startDate = new Date('2021-04-01');
						const endDate = new Date('2024-12-30');
						return [startDate, endDate];
					}
				}
			],
		});

		const valueRange = computed(() => {
			return [rangeStart.value, rangeEnd.value];
		});
		const valueRange2 = computed(() => {
			return [rangeStart2.value, rangeEnd2.value];
		});
		

		return {
			form,
			value,
			year,
			month,
			monthrange,
			quarter,
			quarterrange,
			type,
			dateOpen,
			monthRange,
			value2,
			rangeStart,
			rangeEnd,
			rangeStart2,
			rangeEnd2,
			valueRange2,
			valueRange,
			disableDate,
			timeOpts,
			options,
			monthOptions,
			monthRangeOptions,
			dateRange,
			dateRangeOptions,
			quarterOptions,
			quarterRangeOptions,

			handleChangeTime(val) {
				console.log('val :', val);
			},
			handleVisibleChange(v) {
				console.log('VisibleChange', v);
				dateOpen.value = v;
			},
			handleClear(v) {
				console.log('clear', v);
			},
			handleChange(v) {
				console.log('change', v);
			},
			handleRangeChange(v) {
				console.log(v);
				rangeStart.value = v[0];
				rangeEnd.value = v[1];
				console.log('range-change', v);
			},
			handleRangeChange2(v) {
				console.log(v);
				rangeStart2.value = v[0];
				rangeEnd2.value = v[1];
				console.log('range-change', v);
			},
			handleYearChange(v) {
				console.log('year-change', v);
			},
			handleSelectMonth() {
				dateOpen.value = !dateOpen.value;
			},
			handleMonthChange($month) {
				month.value = $month;
				dateOpen.value = false;
			},
			handleQuarterChange(v) {
				console.log('quarter-change', v);
			},
			async andleSubmit(name) {
				await form.value.validate();
				Message.success('Success!');
			}
		};
	}
});
</script>
