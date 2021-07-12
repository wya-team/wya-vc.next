<template>
	<div class="vc-monthrange-panel">
		<div v-if="shortcuts && shortcuts.length > 0" style="width: 100px">
			<vc-shortcuts-select
				:config="shortcuts"
				@pick="handleShortcutPick"
			/>
		</div>
		<div class="vc-monthrange-panel__body">
			<div class="vc-monthrange-panel__table">
				<div class="vc-monthrange-panel__content is-left">
					<vc-date-header
						:current-view="currentView"
						:panel-date="leftPanelDate"
						:show-next="splitPanels"
						@change="(...args) => handlePanelChange(...args, 'left')"
					/>
					<!-- 月份 -->
					<vc-month-table
						:value="dates"
						:panel-date="leftPanelDate"
						:disabled-date="disabledDate"
						:range-state="rangeState"
						@pick="(...args) => handlePick(...args, 'left')"
						@range-change="handleRangeChange"
					/>
				</div>
				<div class="vc-monthrange-panel__content is-right">
					<vc-date-header
						:current-view="currentView"
						:panel-date="rightPanelDate"
						:show-prev="splitPanels"
						@change="(...args) => handlePanelChange(...args, 'right')"
					/>
					<!-- 月份 -->
					<vc-month-table
						:value="dates"
						:panel-date="rightPanelDate"
						:disabled-date="disabledDate"
						:range-state="rangeState"
						@pick="(...args) => handlePick(...args, 'right')"
						@range-change="handleRangeChange"
					/>
				</div>
			</div>
			<vc-date-confrim
				v-if="confirm"
				:show-time="false"
				:current-view="currentView"
				@clear="handleClear"
				@ok="handleOK"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed } from 'vue';
import { clearTime, nextMonth, prevMonth, nextYear, prevYear, getDateOfTime } from '../helper/date-utils';
import DateMixin from '../mixins/date';
import DateHeader from '../basic/date-header';
import MonthTable from '../basic/month-table';
import Confirm from '../basic/confirm';
import ShortcutsSelect from '../basic/shortcuts-select';

const isEqualYear = (value) => {
	if (!value[0] || !value[1]) { return false; }
	let startYear = value[0].getFullYear();
	let endYear = value[1].getFullYear();
	return startYear === endYear;
};

export default {
	name: 'vc-month-range-panel',
	components: {
		'vc-date-header': DateHeader,
		'vc-month-table': MonthTable,
		'vc-date-confrim': Confirm,
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
			default: true
		},
	},
	emits: [
		'pick',
		'clear',
		'ok'
	],
	setup(props, { emit }) {
		const dates = ref(props.value);
		const leftPanelDate = ref(props.value[0] || props.startDate || new Date());
		const rightPanelDate = ref(
			props.splitPanels && !isEqualYear(props.value) 
				? props.value[1] || nextYear(leftPanelDate.value) 
				: nextYear(leftPanelDate.value)
		);
		const rangeState = ref({
			from: props.value[0] || '',
			to: props.value[1] || '',
			selecting: false,
			marker: null, // 第一次点下的季度
		});
		const currentView = ref('monthrange');

		const handlePanelChange = (panelDate, type, position) => {
			position === 'left' 
				? (leftPanelDate.value = panelDate)
				: (rightPanelDate.value = panelDate);

			if (props.splitPanels) { // 左右面板不联动
				let panelYear = panelDate.getFullYear();
				let leftPanelYear = leftPanelDate.value.getFullYear();
				let rightPanelYear = rightPanelDate.value.getFullYear();
				switch (type) {
					case 'prev-year':
					case 'next-year':
						if (position === 'left' && panelYear >= rightPanelYear) {
							rightPanelDate.value = nextYear(rightPanelDate.value);
						} else if (position === 'right' && panelYear <= leftPanelYear) {
							leftPanelDate.value = prevYear(leftPanelDate.value);
						}
						break;
					default:
						break;
				}
			} else {
				switch (type) {
					case 'prev-year':
						rightPanelDate.value = prevYear(rightPanelDate.value);
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
		const handlePick = (value, type) => {
			let { selecting, from, to, marker } = rangeState.value;
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
					selecting: false,
					marker
				};
			}

			if (rangeState.value.from && rangeState.value.to) {
				// from && to 都已选择，对外发送事件
				let leftDate = rangeState.value.from;
				let rightDate = rangeState.value.to;
				dates.value = [leftDate, rightDate];
				emit('pick', dates.value);
			}
		};

		const handleRangeChange = (value) => {
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

		const handleClear = () => {
			emit('clear');
		};

		const handleOK = () => {
			emit('ok', dates.value);
		};

		const handleShortcutPick = (value) => {
			if (props.disabledDate(value[0]) || props.disabledDate(value[1])) {
				return;
			}
			leftPanelDate.value = value[0];
			rightPanelDate.value = value[1];
			handlePick(value[0], 'left');
			handlePick(value[1], 'right');
			dates.value = value;
		};

		return {
			dates,
			leftPanelDate,
			rightPanelDate,
			rangeState,
			currentView,
			handleShortcutPick,
			handlePanelChange,
			handlePick,
			handleRangeChange,
			handleClear,
			handleOK
		};
	}
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-monthrange-panel;

@include block($block) {
	display: flex;
	@include element(body) {
	}
	@include element(content) {
	}
	@include element(table) {
		display: flex;
	}
}
</style>
