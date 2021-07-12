<template>
	<div class="vc-month-table">
		<table 
			class="vc-month-table__wrapper" 
			cellspacing="0"
			cellpadding="0"
			@click="handleClick"
			@mousemove="handleMouseMove"
		>
			<tbody>
				<tr
					v-for="(row, key) in rows"
					:key="key"
					class="vc-month-table__row"
				>
					<td
						v-for="(cell, index) in row"
						:key="index"
						:class="getCellClasses(cell)"
						class="vc-month-table__cell"
					>
						<div>
							<span>
								{{ cell.month + 1 }}月
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

import { getDayCountOfMonth, getDateTimestamp } from '../helper/date-utils';
import { value2Array, isEmpty, getMonthEndDay } from '../utils';

export default defineComponent({
	name: 'vc-month-table',
	props: {
		value: Array,
		panelDate: Date,
		disabledDate: Function,
		cellClassName: Function,
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
		const getDisabledMonth = (year, month) => {
			const monthDay = getMonthEndDay(year, month);

			for (let i = 1; i <= monthDay; i++) { // 只要某一天被禁用了,就禁用该月份
				const startDate = new Date(year, month, i, 0, 0, 0);
				const endDate = new Date(year, month, i, 23, 59, 59);
				if (props.disabledDate(startDate) || props.disabledDate(endDate)) {
					return true;
				}
			}
			return false;
		};
		
		const rows = computed(() => {
			let $rows = [[], [], [], []];
			const year = props.panelDate.getFullYear();
			const selectedMonth = value2Array(props.value);
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 3; j++) {
					let cell = {};
					cell.month = i * 3 + j;
					cell.date = new Date(year, cell.month, 1);
					const time = getDateTimestamp(cell.date);
					cell.inRange = time > getDateTimestamp(props.rangeState.from) && time < getDateTimestamp(props.rangeState.to);
					cell.start = props.rangeState.from && time === getDateTimestamp(props.rangeState.from);
					cell.end = props.rangeState.to && time === getDateTimestamp(props.rangeState.to);
					cell.disabled = typeof props.disabledDate === 'function' && getDisabledMonth(year, cell.month);
					cell.customClass = typeof props.cellClassName === 'function' && props.cellClassName(cell.month);
					cell.selected = selectedMonth.some(month => {
						return month && (year === month.getFullYear()) && (cell.month === month.getMonth());
					});
					$rows[i][j] = cell;
				}
			}
			return $rows;
		});

		const getCell = (event) => {
			let target = event.target;
			if (target.tagName === 'SPAN') {
				target = target.parentNode.parentNode;
			}
			if (target.tagName === 'DIV') {
				target = target.parentNode;
			}
			if (target.tagName !== 'TD') return {};
			const row = target.parentNode.rowIndex;
			const column = target.cellIndex;
			return {
				cell: rows.value[row][column],
				row,
				column
			};
		};

		const getCellClasses = (cell) => {
			let classes = [];
			if (cell.selected || cell.start || cell.end) { classes.push('is-selected'); }
			if (cell.disabled) { classes.push('is-disabled'); }
			if (cell.empty) { classes.push('is-empty'); }
			if (cell.inRange) { classes.push('is-range'); }

			// TODO 其他情况的样式
			return classes.join(' ');
		};

		const handleClick = (event) => {
			let { cell, row, column } = getCell(event);
			if (!cell) return;
			if (cell.disabled) return;

			emit('pick', cell.date);
		};

		const handleMouseMove = (event) => {
			let { cell, row, column } = getCell(event);
			if (!cell) return;

			if (!props.rangeState.selecting || cell.disabled) return;

			emit('range-change', cell.date);
		};

		return {
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

$block: vc-month-table;

@include block($block) {
	overflow: auto;
	@include element(wrapper) {
		margin: 10px;
		white-space: normal;
	}
	@include element(cell) {
		div {
			position: relative;
			width: 40px;
			height: 28px;
			line-height: 28px;
			margin: 8px 9px;
			border-radius: 3px;
			cursor: pointer;
			span {
				display: inline-block;
				width: 40px;
				height: 28px;
				line-height: 28px;
				margin: 0;
				border-radius: 3px;
				text-align: center;
				transition: background .2s ease-in-out;
			}
			&:hover {
				background: #e1f0fe;
			}
		}
		@include when(selected) {
			div {
				background: #2d8cf0;
				color: #fff;
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
					left: -9px;
					right: -9px;
				}
				span {
					position: relative;
					z-index: 1;
				}
			}
		}
		@include when(disabled) {
			div {
				cursor: not-allowed;
				color: #c5c8ce;
				background: #f7f7f7;
				&:hover {
					background: #f7f7f7;
				}
			}
		}
	}
}
</style>
