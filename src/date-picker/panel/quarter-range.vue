<template>
	<div class="vc-quarterrange-panel">
		<div v-if="shortcuts && shortcuts.length > 0" style="width: 100px">
			<vc-shortcuts-select
				:panel-date="leftPanelDate"
				:config="shortcuts"
				@pick="handleShortcutPick"
			/>
		</div>
		<div class="vc-quarterrange-panel__body">
			<div class="vc-quarterrange-panel__table">
				<div class="vc-quarterrange-panel__content is-left">
					<vc-date-header
						:current-view="currentView"
						:panel-date="leftPanelDate"
						:show-next="splitPanels"
						@change="(...args) => handlePanelChange(...args, 'left')"
					/>
					<!-- 季度 -->
					<vc-quarter-table
						:value="dates"
						:panel-date="leftPanelDate"
						:disabled-date="disabledDate"
						:range-state="rangeState"
						@pick="(...args) => handlePick(...args, 'left')"
						@range-change="handleRangeChange"
					/>
				</div>
				<div class="vc-quarterrange-panel__content is-right">
					<vc-date-header
						:current-view="currentView"
						:panel-date="rightPanelDate"
						:show-prev="splitPanels"
						@change="(...args) => handlePanelChange(...args, 'right')"
					/>
					<!-- 季度 -->
					<vc-quarter-table
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
import QuarterTable from '../basic/quarter-table';
import Confirm from '../basic/confirm';
import ShortcutsSelect from '../basic/shortcuts-select';

const isEqualYear = (value) => {
	if (!value[0] || !value[1]) { return false; }
	let startYear = value[0].getFullYear();
	let endYear = value[1].getFullYear();
	return startYear === endYear;
};

export default {
	name: 'vc-quarter-range-panel',
	components: {
		'vc-date-header': DateHeader,
		'vc-quarter-table': QuarterTable,
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
		const currentView = ref('quarterrange');

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
					from: value[0],
					to: '',
					selecting: true,
					marker: value
				};
			} else {
				rangeState.value = {
					from: value[0] < marker[0] ? value[0] : from,
					to: value[1] < marker[1] ? marker[1] : value[1],
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
			if (rangeState.value.selecting && value[0].getTime() != from.getTime()) {
				rangeState.value = {
					from: value[0] < marker[0] ? value[0] : marker[0],
					to: value[1] < marker[1] ? marker[1] : value[1],
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
			leftPanelDate.value = value[0];
			rightPanelDate.value = value[1];
			handlePick(value[0], 'left');
			handlePick(value[1], 'right');
			dates.value = value;
			rangeState.value = {
				from: value[0],
				marker: value,
				selecting: true,
				to: value[1]
			};
			handleRangeChange(value);
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
			handleOK,
		};
	}
	
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-quarterrange-panel;

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
