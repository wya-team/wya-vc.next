<template>
	<div class="vc-quarter-table">
		<table 
			class="vc-quarter-table__wrapper" 
			cellspacing="0"
			cellpadding="0"
			@click="handleClick"
			@mousemove="handleMouseMove"
		>
			<tbody>
				<tr
					v-for="(row, index) in rows"
					:key="index"
					class="vc-quarter-table__row"
				>
					<td
						v-for="(cell, $index) in row"
						:key="$index"
						:class="getCellClasses(cell)"
						class="vc-quarter-table__cell"
					>
						<div>
							<span>
								第{{ quarterMap[cell.quarter + 1] }}季度
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
import { value2Array, isEmpty } from '../utils';
import { QUARTER_CN } from '../constants';

/**
 * 获取季度对应的月份范围
 */
const getMonthRange = (panelDate, quarter) => {
	let year = panelDate.getFullYear();
	let [startMonth, endMonth] = [quarter * 3, quarter * 3 + 2];
	let endDay = getDayCountOfMonth(year, endMonth);
	return [
		new Date(year, startMonth),
		new Date(year, endMonth, endDay)
	];
};

const getQuarterRangeByMonth = (value) => {
	let month = value.getMonth();
	switch (month) {
		case 0:
		case 2:
			return 0;
		case 3:
		case 5:
			return 1;
		case 6:
		case 8:
			return 2;
		case 9:
		case 11:
			return 3;
		default:
			return false;
	}
};

export default defineComponent({
	name: 'vc-quarter-table',
	components: {

	},
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
		const quarterMap = ref(QUARTER_CN);
		const rows = computed(() => {
			let $rows = [[], []];
			const year = props.panelDate.getFullYear();
			const selectedQuarter = value2Array(props.value);
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					let cell = {};
					cell.quarter = i * 2 + j; // 值为：0，1，2，3
					cell.dates = getMonthRange(props.panelDate, cell.quarter);
					const rangeFromTime = getDateTimestamp(props.rangeState.from);
					const rangeToTime = getDateTimestamp(props.rangeState.to);
					const time = [getDateTimestamp(cell.dates[0]), getDateTimestamp(cell.dates[1])];

					cell.inRange = time[0] > rangeFromTime && time[1] < rangeToTime;
					cell.start = props.rangeState.from && time[0] === rangeFromTime;
					cell.end = props.rangeState.to && time[1] === rangeToTime;
					cell.disabled = typeof props.disabledDate === 'function' && props.disabledDate(cell.quarter);
					cell.customClass = typeof props.cellClassName === 'function' && props.cellClassName(cell.quarter);
					cell.selected = !isEmpty(selectedQuarter) && selectedQuarter.some(quarter => {
						return (year === quarter.getFullYear()) && getQuarterRangeByMonth(quarter) === cell.quarter;
					});
					$rows[i][j] = cell;
				}
			}
			return $rows;
		});

		const getCellClasses = (cell) => {
			let classes = [];
			if (cell.selected || cell.start || cell.end) { classes.push('is-selected'); }
			if (cell.disabled) { classes.push('is-disabled'); }
			if (cell.empty) { classes.push('is-empty'); }
			if (cell.inRange) { classes.push('is-range'); }

			// TODO 其他情况的样式
			return classes.join(' ');
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
			const row = target.parentNode.rowIndex;
			const column = target.cellIndex;
			return {
				cell: rows.value[row][column],
				row,
				column
			};
		};

		const handleClick = (event) => {
			let { cell, row, column } = getCell(event);
			if (!cell) return;
			if (cell.disabled) return;

			emit('pick', cell.dates);
		};

		const handleMouseMove = (event) => {
			let { cell, row, column } = getCell(event);
			if (!cell) return;

			if (!props.rangeState.selecting || cell.disabled) return;

			emit('range-change', cell.dates);
		};

		return {
			quarterMap,
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

$block: vc-quarter-table;

@include block($block) {
	overflow: auto;
	@include element(wrapper) {
		margin: 10px;
		white-space: normal;
	}
	@include element(cell) {
		div {
			position: relative;
			width: 60px;
			height: 28px;
			line-height: 28px;
			margin: 8px 9px;
			border-radius: 3px;
			cursor: pointer;
			span {
				display: inline-block;
				width: 60px;
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
