<template>
	<div class="vc-daterange-panel">
		<div v-if="shortcuts && shortcuts.length > 0" style="width: 100px">
			<vc-shortcuts-select
				:config="shortcuts"
				@pick="handleShortcutPick"
			/>
		</div>
		<div :class="{'is-with-seconds': showSeconds}" class="vc-daterange-panel__body">
			<div class="vc-daterange-panel__table">
				<div class="vc-daterange-panel__content is-left">
					<vc-date-header
						:current-view="leftCurrentView"
						:panel-date="leftPanelDate"
						:show-next="splitPanels"
						title="开始时间"
						@change="(...args) => handlePanelChange(...args, 'left')"
						@change-current-view="handleChangeLeftCurrentView"
					/>
					<vc-date-table
						v-if="leftCurrentView === 'daterange'"
						:value="dates"
						:panel-date="leftPanelDate"
						:disabled-date="disabledDate"
						:focused-date="focusedDate"
						:range-state="rangeState"
						@pick="(...args) => handlePick(...args, 'left')"
						@range-change="handleRangeChange"
					/>
					<!-- 年 -->
					<vc-year-table
						v-if="leftCurrentView === 'year'"
						:value="[dates[0]]"
						:panel-date="leftPanelDate"
						@pick="handleLeftYearPick"
					/>
					<!-- 月 -->
					<vc-month-table
						v-if="leftCurrentView === 'month'"
						:value="[dates[0]]"
						:panel-date="leftPanelDate"
						@pick="handleLeftMonthPick"
					/>
					<!-- time -->
					<vc-time-select
						v-show="leftCurrentView === 'timerange'"
						:hours="timeSlots.left.hours"
						:minutes="timeSlots.left.minutes"
						:seconds="timeSlots.left.seconds"
						:show-seconds="showSeconds"
						v-bind="timePickerOptions"
						:panel-date="dates[0]"
						@pick="handleTimePick('left')"
					/>
				</div>
				<div class="vc-daterange-panel__content is-right">
					<vc-date-header
						:current-view="rightCurrentView"
						:panel-date="rightPanelDate"
						:show-prev="splitPanels"
						title="结束时间"
						@change="(...args) => handlePanelChange(...args, 'right')"
						@change-current-view="handleChangeRightCurrentView"
					/>
					<vc-date-table
						v-if="rightCurrentView === 'daterange'"
						:value="dates"
						:panel-date="rightPanelDate"
						:disabled-date="disabledDate"
						:focused-date="focusedDate"
						:range-state="rangeState"
						@pick="(...args) => handlePick(...args, 'right')"
						@range-change="handleRangeChange"
					/>
					<!-- 年 -->
					<vc-year-table
						v-if="rightCurrentView === 'year'"
						:value="[dates[1]]"
						:panel-date="rightPanelDate"
						@pick="handleRightYearPick"
					/>
					<!-- 月 -->
					<vc-month-table
						v-if="rightCurrentView === 'month'"
						:value="[dates[1]]"
						:panel-date="rightPanelDate"
						@pick="handleRightMonthPick"
					/>
					<!-- time -->
					<vc-time-select
						v-show="rightCurrentView === 'timerange'"
						:hours="timeSlots.right.hours"
						:minutes="timeSlots.right.minutes"
						:seconds="timeSlots.right.seconds"
						:show-seconds="showSeconds"
						v-bind="timePickerOptions"
						:panel-date="dates[1]"
						@pick="handleTimePick('right')"
					/>
				</div>
			</div>
			<vc-date-confrim
				v-if="confirm"
				:show-time="canSelectTime"
				:current-view="[leftCurrentView, rightCurrentView]"
				@clear="handleClear"
				@ok="handleOK"
				@toggle-time="handleToggleTime"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed } from 'vue';
import { clearTime, nextMonth, prevMonth, nextYear, prevYear, getDateOfTime, changeYearMonthAndClampDate } from '../helper/date-utils';
import DateMixin from '../mixins/date';
import YearTable from '../basic/year-table';
import MonthTable from '../basic/month-table';
import DateTable from '../basic/date-table';
import DateHeader from '../basic/date-header';
import Confirm from '../basic/confirm';
import TimeSelect from '../basic/time-select';
import ShortcutsSelect from '../basic/shortcuts-select';

const isEqualYearAndMonth = (value) => {
	if (!value[0] || !value[1]) { return false; }
	let startYear = value[0].getFullYear();
	let startMonth = value[0].getMonth();
	let endYear = value[1].getFullYear();
	let endMonth = value[1].getMonth();
	return startYear === endYear && startMonth === endMonth;
};

const isOverRightPanel = (panelDate, rightPanelDate) => {
	let panelYear = panelDate.getFullYear();
	let panelMonth = panelDate.getMonth();
	let rightPanelYear = rightPanelDate.getFullYear();
	let rightPanelMonth = rightPanelDate.getMonth();
	return panelYear > rightPanelYear || (panelYear === rightPanelYear && panelMonth >= rightPanelMonth);
};

const isOverLeftPanel = (panelDate, leftPanelDate) => {
	let panelYear = panelDate.getFullYear();
	let panelMonth = panelDate.getMonth();
	let leftPanelYear = leftPanelDate.getFullYear();
	let leftPanelMonth = leftPanelDate.getMonth();
	return panelYear < leftPanelYear || (panelYear === leftPanelYear && panelMonth <= leftPanelMonth);
};

// 判断当前点击的cell是否在当前面板内
const getDateIsInRange = (value, type, leftPanelDate, rightPanelDate) => {
	let month = value.getMonth();
	let year = value.getFullYear();
	let $leftMonth = leftPanelDate.getMonth();
	let $leftYear = leftPanelDate.getFullYear();
	let $rightMonth = rightPanelDate.getMonth();
	let $rightYear = rightPanelDate.getFullYear();
	if (type === 'right' && (year > $rightYear || (year === $rightYear && month > $rightMonth))) {
		return false;
	} else if (type === 'right' && (year < $leftYear || (year === $leftYear && month < $leftMonth))) {
		return false;
	} else if (type === 'left' && (year < $leftYear || (year === $leftYear && month < $leftMonth))) {
		return false;
	} else if (type === 'left' && (year > $rightYear || (year === $rightYear && month > $rightMonth))) {
		return false;
	}
	return true;
};


export default {
	name: 'vc-date-range-panel',
	components: {
		'vc-date-header': DateHeader,
		'vc-year-table': YearTable,
		'vc-month-table': MonthTable,
		'vc-date-table': DateTable,
		'vc-date-confrim': Confirm,
		'vc-time-select': TimeSelect,
		'vc-shortcuts-select': ShortcutsSelect
	},
	mixins: [DateMixin],
	props: {
		confirm: {
			type: Boolean,
			default: false
		},
		splitPanels: {
			type: Boolean,
			default: false
		},
	},
	emits: [
		'pick',
		'clear',
		'ok'
	],
	setup(props, { emit }) {
		const instance = getCurrentInstance();

		const dates = ref(props.value);
		const leftPanelDate = ref(props.value[0] || props.startDate || new Date());
		const rightPanelDate = ref(
			props.splitPanels && !isEqualYearAndMonth(props.value) 
				? props.value[1] || nextMonth(leftPanelDate.value) 
				: nextMonth(leftPanelDate.value)
		);
		const rangeState = ref({
			from: props.value[0] || '',
			to: props.value[1] || '',
			selecting: false,
			marker: null, // 第一次点下的日期
		});
		const rightCurrentView = ref('daterange');
		const leftCurrentView = ref('daterange');


		const canSelectTime = computed(() => {
			let { from, to, selecting } = rangeState.value;
			return props.showTime && !!from && !!to && !selecting;
		});
		const showSeconds = computed(() => {
			return !(props.format || '').match(/mm$/);
		});

		const timeSlots = computed(() => {
			let leftDate = dates.value[0];
			let rightDate = dates.value[1];
			if (!leftDate || !rightDate || (rightCurrentView.value !== 'timerange' && leftCurrentView.value !== 'timerange')) {
				return {
					left: {},
					right: {}
				};
			}
			return {
				left: {
					hours: leftDate.getHours(),
					minutes: leftDate.getMinutes(),
					seconds: leftDate.getSeconds()
				},
				right: {
					hours: rightDate.getHours(),
					minutes: rightDate.getMinutes(),
					seconds: rightDate.getSeconds()
				},
			};
		});
		const leftMonth = computed(() => {
			return leftPanelDate.value.getMonth();
		});
		const leftYear = computed(() => {
			return leftPanelDate.value.getFullYear();
		});
		const rightMonth = computed(() => {
			return rightPanelDate.value.getMonth();
		});
		const rightYear = computed(() => {
			return rightPanelDate.value.getFullYear();
		});

		const handleChangeLeftCurrentView = (currentView) => {
			if (leftCurrentView.value === currentView) {
				leftCurrentView.value = 'daterange';
			} else {
				leftCurrentView.value = currentView;
			}
		};

		const handleLeftYearPick = (value) => {
			const leftDate = changeYearMonthAndClampDate(dates.value[0] || leftPanelDate.value, value.getFullYear(), leftMonth.value);
			leftPanelDate.value = leftDate;
			leftCurrentView.value = 'month';
			if (!props.splitPanels) {
				const rightDate = changeYearMonthAndClampDate(dates.value[1] || rightPanelDate.value, value.getFullYear(), rightMonth.value);
				rightPanelDate.value = rightDate;
			}
		};

		const handleLeftMonthPick = (value) => {
			const leftDate = changeYearMonthAndClampDate(dates.value[0] || leftPanelDate.value, leftYear.value, value.getMonth());
			leftPanelDate.value = leftDate;
			leftCurrentView.value = 'daterange';
			if (!props.splitPanels) {
				const rightDate = changeYearMonthAndClampDate(dates.value[1] || rightPanelDate.value, leftYear.value, leftMonth.value + 1);
				rightPanelDate.value = rightDate;
			}
		};

		const handleChangeRightCurrentView = (currentView) => {
			if (rightCurrentView.value === currentView) {
				rightCurrentView.value = 'daterange';
			} else {
				rightCurrentView.value = currentView;
			}
		};

		const handleRightYearPick = (value) => {
			const rightDate = changeYearMonthAndClampDate(dates.value[1] || rightPanelDate.value, value.getFullYear(), rightMonth.value);
			rightPanelDate.value = rightDate;
			rightCurrentView.value = 'month';
			if (!props.splitPanels) {
				const leftDate = changeYearMonthAndClampDate(dates.value[0] || leftPanelDate.value, value.getFullYear(), leftMonth.value);
				leftPanelDate.value = leftDate;
			}
		};

		const handleRightMonthPick = (value) => {
			const newDate = changeYearMonthAndClampDate(dates.value[1] || rightPanelDate.value, rightYear.value, value.getMonth());
			rightPanelDate.value = newDate;
			rightCurrentView.value = 'daterange';
			if (!props.splitPanels) {
				const leftDate = changeYearMonthAndClampDate(dates.value[1] || leftPanelDate.value, rightYear.value, rightMonth.value - 1);
				leftPanelDate.value = leftDate;
			}
		};

		const handlePanelChange = (panelDate, type, position) => {
			position === 'left' 
				? (leftPanelDate.value = panelDate)
				: (rightPanelDate.value = panelDate);
				
			if (props.splitPanels) { // 左右面板不联动

				let $isOverRightPanel = isOverRightPanel(panelDate, rightPanelDate.value);
				let $isOverLeftPanel = isOverLeftPanel(panelDate, leftPanelDate.value);

				switch (type) {
					case 'prev-month':
					case 'next-month':
						if (position === 'left' && $isOverRightPanel) {
							// 判断如果右边下个月的日期还是小于左边的日期，则将右边日期改成比左边日期大一个月
							const $rightPanelDate = nextMonth(rightPanelDate.value);
							if ($rightPanelDate < leftPanelDate.value) {
								rightPanelDate.value = changeYearMonthAndClampDate(leftPanelDate.value, leftYear.value, leftMonth.value + 1);
							} else {
								rightPanelDate.value = nextMonth(rightPanelDate.value);
							}
						} else if (position === 'right' && $isOverLeftPanel) {
							// 判断如果左边上个月的日期还是大于右边的日期，则将左边日期改成比右边日期小一个月
							const $leftPanelDate = prevMonth(leftPanelDate.value);
							if ($leftPanelDate < leftPanelDate.value) {
								leftPanelDate.value = changeYearMonthAndClampDate(rightPanelDate.value, rightYear.value, rightMonth.value - 1);
							} else {
								leftPanelDate.value = prevMonth(leftPanelDate.value);
							}
						}
						break;
					case 'prev-year':
					case 'next-year':
						if (position === 'left' && isOverRightPanel && leftCurrentView.value !== 'year') {
							// 判断如果右边下年的日期还是小于左边的日期，则将右边日期改成比左边日期大一月
							const $rightPanelDate = nextYear(rightPanelDate.value);
							if ($rightPanelDate < leftPanelDate.value) {
								rightPanelDate.value = changeYearMonthAndClampDate(leftPanelDate.value, leftYear.value, leftMonth.value + 1);
							} else {
								rightPanelDate.value = nextYear(rightPanelDate.value);
							}
						} else if (position === 'right' && isOverLeftPanel && rightCurrentView.value !== 'year') {
							// 判断如果左边上个月的日期还是大于右边的日期，则将左边日期改成比右边日期小一个月
							const $leftPanelDate = prevYear(leftPanelDate.value);
							if ($leftPanelDate < leftPanelDate.value) {
								leftPanelDate.value = changeYearMonthAndClampDate(rightPanelDate.value, rightYear.value, rightMonth.value - 1);
							} else {
								leftPanelDate.value = prevYear(leftPanelDate.value);
							}
						}
						break;
					default:
						break;
				}
			} else {
				switch (type) {
					case 'prev-month':
						rightPanelDate.value = prevMonth(rightPanelDate.value);
						break;
					case 'prev-year':
						rightPanelDate.value = prevYear(rightPanelDate.value);
						break;
					case 'next-month':
						leftPanelDate.value = nextMonth(leftPanelDate.value);
						break;
					case 'next-year':
						leftPanelDate.value = nextYear(leftPanelDate.value);
						break;
					default:
						break;
				}
			}
		};
		/**
		 * 重新选择日期范围后需要重新选择时间范围
		 */
		const handlePick = (value, cell, type) => {
			let { selecting, from, to, marker } = rangeState.value;
			let isInRange = getDateIsInRange(value, type, leftPanelDate.value, rightPanelDate.value);
			if (!selecting) {
				dates.value = [];
				rangeState.value = {
					from: value,
					to: '',
					selecting: true,
					marker: value
				};
			} else {
				rangeState.value = {
					from: value < marker ? value : from,
					to: value < marker ? marker : value,
					selecting: cell.type !== 'normal',
					marker: cell.type !== 'normal' ? marker : null
				};
			}
			if (!isInRange) {
				let changeType = type === 'left' ? 'prev-month' : 'next-month';
				let panelDate = type === 'left' ? prevMonth(leftPanelDate.value) : nextMonth(rightPanelDate.value);
				handlePanelChange(panelDate, changeType, type);
			} else if (rangeState.value.from && rangeState.value.to) {
				// from && to 都已选择，对外发送事件
				let leftDate = rangeState.value.from;
				let rightDate = rangeState.value.to;
				dates.value = [leftDate, rightDate];
				emit('pick', dates.value);
			}
		};

		const handleRangeChange = (value, cell) => {
			let { selecting, from, to, marker } = rangeState.value;
			if (rangeState.value.selecting && value.getTime() != from.getTime()) {
				rangeState.value = {
					from: value < marker ? value : marker,
					to: value < marker ? marker : value,
					selecting: true,
					marker
				};
			}
		};

		const handleTimePick = type => value => {
			let date = type === 'left' ? dates.value[0] : dates.value[1];
			let leftNewDate = dates.value[0];
			let rightNewDate = dates.value[1];
			if (type === 'left') {
				leftNewDate = getDateOfTime(date, value);
				leftPanelDate.value = leftNewDate;
			} else if (type === 'right') {
				rightNewDate = getDateOfTime(date, value);
				rightPanelDate.value = rightNewDate;
			}
			if (leftNewDate && rightNewDate) {
				dates.value = [leftNewDate, rightNewDate];
				emit('pick', dates.value);
			}
		};

		const handleToggleTime = (view) => {
			leftCurrentView.value = view[0];
			rightCurrentView.value = view[1];
		};

		const handleClear = () => {
			emit('clear');
		};
		const handleOK = () => {
			emit('ok', dates.value);
		};
		const handleShortcutPick = (value) => {
			// if (type === 'disabled') {
			// 	return;
			// }
			if (props.disabledDate(value[0]) || props.disabledDate(value[1])) {
				return;
			}
			handlePick(value[0], { type: props.disabledDate(value[0]) ? 'disabled' : 'normal' }, 'left');
			handlePick(value[1], { type: props.disabledDate(value[1]) ? 'disabled' : 'normal' }, 'right');
			leftPanelDate.value = value[0];
			rightPanelDate.value = value[1];
			dates.value = value;
			// emit('pick', dates.value);
		};

		return {
			dates,
			leftPanelDate,
			rightPanelDate,
			rangeState,
			rightCurrentView,
			leftCurrentView,
			canSelectTime,
			showSeconds,
			timeSlots,
			leftMonth,
			leftYear,
			rightMonth,
			rightYear,
			handlePanelChange,
			handlePick,
			handleTimePick,
			handleClear,
			handleOK,
			handleToggleTime,
			handleRangeChange,
			handleRightYearPick,
			handleRightMonthPick,
			handleChangeRightCurrentView,
			handleLeftMonthPick,
			handleLeftYearPick,
			handleChangeLeftCurrentView,
			handleShortcutPick,
		};
	}
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-daterange-panel;

@include block($block) {
	display: flex;
	@include element(body) {
		@include when(with-seconds) {
			.vc-time-select__list {
				width: 72px;
				ul li {
					padding: 0 0 0 28px;
				}
			}
		}
	}
	@include element(content) {
		// position: relative;
		.vc-time-select {
			position: relative;
			&:after {
				content: "";
				display: block;
				width: 2px;
				position: absolute;
				top: 0;
				bottom: 0;
				right: -2px;
				background: #e8eaec;
				z-index: 1;
			}
		}
		@include when(left) {
			.vc-time-select:after {
				left: auto;
				right: -2px;
			}
		}
		@include when(right) {
			.vc-time-select:after {
				right: auto;
				left: -2px
			}
		}
	}
	@include element(table) {
		display: flex;
	}
	.vc-time-select__list {
		width: 108px;
		max-height: 224px;
		ul li {
			padding: 0 0 0 46px;
		}
	}
}
</style>
