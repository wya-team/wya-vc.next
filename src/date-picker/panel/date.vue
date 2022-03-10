<template>
	<div class="vc-date-panel">
		<div v-if="shortcuts && shortcuts.length > 0" style="width: 100px">
			<vc-shortcuts-select
				:panel-date="panelDate"
				:config="shortcuts"
				@pick="handleShortcutPick"
			/>
		</div>
		<div :class="{'is-with-seconds': showSeconds}" class="vc-date-panel__body">
			<vc-date-header
				v-if="currentView !== 'time'"
				:panel-date="panelDate"
				:current-view="currentView"
				@change-current-view="handleChangeCurrentView"
				@change="(v) => panelDate = v"
			/>
			<!-- 日历 -->
			<vc-date-table
				v-if="currentView === 'date'"
				:value="dates"
				:panel-date="panelDate"
				:disabled-date="disabledDate"
				:focused-date="focusedDate"
				@pick="handlePick"
			/>
			<!-- 年 -->
			<vc-year-table
				v-if="currentView === 'year'"
				:value="dates"
				:panel-date="panelDate"
				@pick="handleYearPick"
			/>
			<!-- 月 -->
			<vc-month-table
				v-if="currentView === 'month'"
				:value="dates"
				:panel-date="panelDate"
				:disabled-date="disabledDate"
				@pick="handleMonthPick"
			/>
			<!-- 季度 -->
			<vc-quarter-table
				v-if="currentView === 'quarter'"
				:value="dates"
				:panel-date="panelDate"
				:disabled-date="disabledDate"
				@pick="handleQuarterPick"
			/>
			<!-- time -->
			<vc-time-select
				v-show="currentView === 'time'"
				:hours="timeSlots[0]"
				:minutes="timeSlots[1]"
				:seconds="timeSlots[2]"
				:show-seconds="showSeconds"
				v-bind="timePickerOptions"
				:panel-date="panelDate"
				@pick="handleTimePick"
			/>
			<vc-date-confirm
				v-if="confirm"
				:show-time="showTime && !multiple"
				:current-view="currentView"
				@clear="handleClear"
				@ok="handleOK"
				@toggle-time="handleToggleTime"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed } from 'vue';
import { getDateOfTime, changeYearMonthAndClampDate } from '../helper/date-utils';
import DateMixin from '../mixins/date';
import YearTable from '../basic/year-table';
import MonthTable from '../basic/month-table';
import QuarterTable from '../basic/quarter-table';
import DateTable from '../basic/date-table';
import DateHeader from '../basic/date-header';
import Confirm from '../basic/confirm';
import TimeSelect from '../basic/time-select';
import ShortcutsSelect from '../basic/shortcuts-select';


export default {
	name: 'vc-date-panel',
	components: {
		'vc-date-header': DateHeader,
		'vc-year-table': YearTable,
		'vc-month-table': MonthTable,
		'vc-quarter-table': QuarterTable,
		'vc-date-table': DateTable,
		'vc-date-confirm': Confirm,
		'vc-time-select': TimeSelect,
		'vc-shortcuts-select': ShortcutsSelect
	},
	mixins: [DateMixin],
	props: {
		type: String,
		confirm: {
			type: Boolean,
			default: false
		},
		// 在type === 'date' 下才有效
		multiple: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		'pick',
		'clear',
		'ok'
	],
	setup(props, { emit }) {
		const dates = ref(props.value);
		const panelDate = ref((() => {
			let value = props.value[0];
			if (props.type === 'quarter' && value) {
				value = value[0];
			}
			return value || props.startDate || new Date();
		})());
		const currentView = ref((() => {
			if (props.type === 'year') {
				return 'year';
			} else if (props.type === 'month') {
				return 'month';
			} else if (props.type === 'quarter') {
				return 'quarter';
			}
			return 'date';
		})());

		const showSeconds = computed(() => {
			return !(props.format || '').match(/mm$/);
		});

		const timeSlots = computed(() => {
			/**
			 * currentView.value !== 'time' 由于time-select是用v-show控制显示隐藏，
			 * 所以在面板为time时，才去更改timeSlots, time-select才会触发watch
			 */
			let date = dates.value[0];
			if (!date || currentView.value !== 'time') return [];
			return [date.getHours(), date.getMinutes(), date.getSeconds()];
		});

		const month = computed(() => {
			return panelDate.value.getMonth();
		});
		const year = computed(() => {
			return panelDate.value.getFullYear();
		});

		const handlePick = (value, cell) => {
			if (!props.multiple) {
				let date = dates.value[0];
				let time = {
					hours: (date || value).getHours(),
					minutes: (date || value).getMinutes(),
					seconds: (date || value).getSeconds(),
				};
				let newDate = getDateOfTime(value, time);
				panelDate.value = newDate;
				dates.value = [newDate];
				emit('pick', dates.value);
			} else {
				let index = dates.value.findIndex((date) => date.getTime() === value.getTime());
				panelDate.value = value;
				if (cell.type === 'normal') {
					let prevDate = []; // 不要的date
					index > -1 ? (prevDate = dates.value.splice(index, 1)) : (dates.value = [...dates.value, value]);
					emit('pick', dates.value, prevDate[0]);
				}
			}
		};

		const handleTimePick = (value) => {
			console.log('value', value);
			let newDate = getDateOfTime(dates.value[0] || panelDate.value, value);
			panelDate.value = newDate;
			dates.value = [newDate];
			emit('pick', dates.value);
		};

		const handleChangeCurrentView = ($currentView) => {
			if (currentView.value === $currentView) {
				currentView.value = 'date';
			} else {
				currentView.value = $currentView;
			}
		};

		const handleYearPick = (value) => {
			if (props.type === 'year') {
				let newYear = [value];
				dates.value = newYear;
				emit('pick', newYear);
			} else {
				const newDate = changeYearMonthAndClampDate(dates.value[0] || panelDate.value, value.getFullYear(), month.value);
				panelDate.value = newDate;
				currentView.value = 'month';
			}
		};

		const handleMonthPick = (value) => {
			if (props.type === 'month') {
				let newMonth = [value];
				dates.value = newMonth;
				emit('pick', newMonth);
			} else {
				const newDate = changeYearMonthAndClampDate(dates.value[0] || panelDate.value, year.value, value.getMonth());
				panelDate.value = newDate;
				currentView.value = 'date';
			}
		};
		// 季度选择value => 月份的范围
		const handleQuarterPick = (value) => {
			let newQuarter = value;
			dates.value = newQuarter;
			emit('pick', newQuarter);
		};

		const handleToggleTime = (view) => {
			currentView.value = view;
		};

		const handleClear = () => {
			emit('clear');
		};

		const handleOK = () => {
			emit('ok', dates.value);
		};

		const handleShortcutPick = (date) => {
			// 判断时候在禁用
			let type = props.disabledDate(date) ? 'disabled' : 'normal';
			if (type === 'disabled') {
				return;
			}
			if (currentView.value === 'quarter') {
				panelDate.value = date[0];
				handleQuarterPick(date);
			} else {
				handlePick(date, { type });
			}
		};

		return {
			dates,
			panelDate,
			currentView,
			showSeconds,
			timeSlots,
			month,
			year,

			handleShortcutPick,
			handleChangeCurrentView,
			handlePick,
			handleYearPick,
			handleMonthPick,
			handleQuarterPick,
			handleTimePick,
			handleClear,
			handleOK,
			handleToggleTime,
		};
	}
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-date-panel;

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
	.vc-time-select__list {
		width: 108px;
		max-height: 224px;
		ul li {
			padding: 0 0 0 46px;
		}
	}
}
</style>
