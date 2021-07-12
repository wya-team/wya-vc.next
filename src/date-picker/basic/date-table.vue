<template>
	<div class="vc-date-table">
		<table
			cellspacing="0"
			cellpadding="0"
			class="vc-date-table__wrapper"
			@click="handleClick"
			@mousemove="handleMouseMove"
		>
			<tbody>
				<tr class="vc-date-table__header">
					<th v-for="(week, index) in weeks" :key="index">
						{{ week }}
					</th>
				</tr>
				<tr
					v-for="(row, key) in rows"
					:key="key"
					class="vc-date-table__row"
				>
					<td
						v-for="(cell, index) in row"
						:key="index"
						:class="getCellClasses(cell)"
						class="vc-date-table__cell"
					>
						<div>
							<span>
								{{ cell.text }}
							</span>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed } from 'vue';
import { 
	getFirstDayOfMonth, getStartDateOfMonth, getDayCountOfMonth, 
	getDateTimestamp, nextDate, clearTime 
} from '../helper/date-utils';
import { value2Array } from '../utils';
import { WEEKS } from '../constants';

export default defineComponent({
	name: 'vc-date-table',
	props: {
		value: Array,
		firstDayOfWeek: {
			default: 7,
			type: Number,
			validator: val => val >= 1 && val <= 7
		},
		disabledDate: Function,
		cellClassName: Function,
		panelDate: {
			type: Date,
			required: true,
		},
		focusedDate: {
			type: Date,
			required: true,
		},
		rangeState: {
			type: Object,
			default: () => ({
				from: null,
				to: null,
				selecting: false,
				marker: null
			})
		},
	},
	emits: [
		'pick',
		'range-change'
	],
	setup(props, { emit }) {
		const tableRows = ref([[], [], [], [], [], []]);
		const offsetDay = computed(() => {
			const week = props.firstDayOfWeek;
			// 周日为界限，左右偏移的天数，3217654 例如周一就是 -1，目的是调整前两行日期的位置
			return week > 3 ? 7 - week : -week;
		});
		const weeks = computed(() => {
			const week = props.firstDayOfWeek;
			return WEEKS.concat(WEEKS).slice(week, week + 7);
		});
		const year = computed(() => {
			return props.panelDate.getFullYear();
		});
		const month = computed(() => {
			return props.panelDate.getMonth();
		});
		const startDate = computed(() => {
			return getStartDateOfMonth(year.value, month.value);
		});
		// 生成日期数据
		const rows = computed(() => {
			const date = new Date(year.value, month.value, 1);
			let day = getFirstDayOfMonth(date); // 一个月的第一天
			const dateCountOfMonth = getDayCountOfMonth(year.value, month.value);
			const dateCountOfLastMonth = getDayCountOfMonth(
				month.value === 0 
					? year.value - 1 
					: year.value,
				month.value === 0 
					? 11 
					: month.value - 1
			);

			let count = 1;
		
			const $rows = tableRows.value;
			// const selectedDate = this.selectionMode === 'dates' ? value2Array(props.value) : [];
			const selectedDate = value2Array(props.value);
			const focusedDate = value2Array(clearTime(props.focusedDate));
			const now = getDateTimestamp(new Date());

			for (let i = 0; i < 6; i++) {
				const row = tableRows.value[i];
				for (let j = 0; j < 7; j++) {
					let cell = row[j];
					if (!cell) {
						cell = { row: i, column: j, type: 'normal', inRange: false, start: false, end: false };
					}
					cell.type = 'normal';
					const index = i * 7 + j;
					const time = nextDate(startDate.value, index - offsetDay.value).getTime();
					cell.inRange = time > getDateTimestamp(props.rangeState.from) && time < getDateTimestamp(props.rangeState.to);
					cell.start = props.rangeState.from && time === getDateTimestamp(props.rangeState.from);
					cell.end = props.rangeState.to && time === getDateTimestamp(props.rangeState.to);
					cell.today = time === now;

					if (i >= 0 && i <= 1) {
						const prevDay = day + offsetDay.value < 0 ? 7 + day + offsetDay.value : day + offsetDay.value;
						if (j + i * 7 >= prevDay) {
							cell.text = count++;
						} else {
							cell.text = dateCountOfLastMonth - (prevDay - (j % 7)) + 1 + i * 7;
							cell.type = 'prev-month';
						}
					} else if (count <= dateCountOfMonth) {
						cell.text = count++;
					} else {
						cell.text = count++ - dateCountOfMonth;
						cell.type = 'next-month';
					}

					let cellDate = new Date(time);
					cell.disabled = typeof props.disabledDate === 'function' && props.disabledDate(cellDate);
					cell.customClass = typeof props.cellClassName === 'function' && props.cellClassName(cellDate);
					// 选中的date在进行比较时需要清除 时分秒
					cell.selected = selectedDate.some($date => {
						if (cell.type === 'normal') {
							return $date && clearTime($date).getTime() === cellDate.getTime();
						}
						return false;
					});
					cell.focused = focusedDate.some($date => $date.getTime() === cellDate.getTime());

					$rows[i][j] = cell;
				}
			}
			return $rows;
		});
		const getDateOfCell = (row, column) => {
			const offsetFromStart = row * 7 + column - offsetDay.value;
			return nextDate(startDate.value, offsetFromStart);
		};

		const getCell = (event) => {
			let target = event.target;
			if (target.tagName === 'SPAN') {
				target = target.parentNode.parentNode;
			}
			if (target.tagName === 'DIV') {
				target = target.parentNode;
			}
			if (target.tagName !== 'TD') return {};
			const row = target.parentNode.rowIndex - 1;
			const column = target.cellIndex;
			return {
				cell: rows.value[row][column],
				row,
				column
			};
		};

		const getCellClasses = (cell) => {
			let classes = [];

			classes.push(`is-${cell.type}`);
			if (cell.today) classes.push('is-today');
			if ((cell.selected || cell.start || cell.end) && cell.type === 'normal') {
				classes.push('is-selected');
			}
			if (cell.disabled) { classes.push('is-disabled'); }
			if (cell.focused) { classes.push('is-focused'); }
			if (cell.inRange && cell.type === 'normal') {
				classes.push('is-range');
			}


			// TODO 其他情况的样式
			return classes.join(' ');
		};

		const handleClick = (event) => {
			let { cell, row, column } = getCell(event);
			if (!cell) return;

			if (cell.disabled || cell.type === 'week') return;

			const newDate = getDateOfCell(row, column);
			emit('pick', newDate, cell);
		};

		const handleMouseMove = (event) => {
			let { cell, row, column } = getCell(event);
			if (!cell) return;

			if (!props.rangeState.selecting || cell.disabled) return;

			const newDate = getDateOfCell(row, column);
			emit('range-change', newDate, cell);
		};

		return {
			tableRows,
			offsetDay,
			weeks,
			year,
			month,
			startDate,
			rows,
			getCellClasses,
			handleClick,
			handleMouseMove
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-date-table;

@include block($block) {
	overflow: auto;
	@include element(wrapper) {
		width: 196px;
		margin: 10px;
		white-space: normal;
		font-size: 12px;
		user-select: none;
	}
	@include element(header) {
		line-height: 24px;
		text-align: center;
		margin: 2px;
		color: #c5c8ce;
	}
	@include element(cell) {
		width: 28px;
		height: 28px;
		cursor: pointer;
		div {
			position: relative;
			line-height: 24px;
			margin: 2px;
			font-style: normal;
			border-radius: 3px;
			text-align: center;
			transition: all .2s ease-in-out;
			&:hover {
				background: #e1f0fe;
			}
			span {
				display: inline-block;
				width: 24px;
				height: 24px;
			}
		}
		@include when(today) {
			span:after {
				content: "";
				display: block;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: #2d8cf0;
				position: absolute;
				top: 1px;
				right: 1px;
				z-index: 1
			}
		}
		@include when(range) {
			div {
				&:before {
					content: "";
					display: block;
					background: #e1f0fe;
					border-radius: 0;
					border: 0;
					position: absolute;
					top: 0px;
					bottom: 0px;
					left: -2px;
					right: -2px;
				}
				span {
					position: relative;
					z-index: 1;
				}
			}
		}
		@include when(focused) {
			div { box-shadow: inset 0 0 0 1px #2d8cf0; }
		}
		@include when(selected) {
			div {
				background: #2d8cf0;
				color: #fff;
			}
		}
		@include when(disabled) {
			cursor: not-allowed;
			color: #c5c8ce;
			background: #f7f7f7;
			div:hover {
				background: #f7f7f7;
			}
		}
		@include when(next-month) {
			div { color: #c5c8ce; }
		}
		@include when(prev-month) {
			div { color: #c5c8ce; }
		}
	}
}
</style>
