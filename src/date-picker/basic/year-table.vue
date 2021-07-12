<template>
	<div class="vc-year-table">
		<table 
			class="vc-year-table__wrapper" 
			cellspacing="0"
			cellpadding="0"
		>
			<tbody>
				<tr
					v-for="(row, index) in rows"
					:key="index"
					class="vc-year-table__row"
				>
					<td
						v-for="(cell, $index) in row"
						:key="$index"
						:class="getCellClasses(cell)"
						class="vc-year-table__cell"
						@click="handleYearTableClick(cell)"
					>
						<div>
							<span>
								{{ cell.year }}
							</span>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed, reactive } from 'vue';

import { value2Array } from '../utils';

export default defineComponent({
	name: 'vc-year-table',
	props: {
		value: Array,
		panelDate: Date,
		disabledDate: Function,
		cellClassName: Function,
	},
	emits: ['pick'],
	setup(props, { emit }) {
		const startYear = computed(() => {
			return Math.floor(props.panelDate.getFullYear() / 10) * 10;
		});

		const rows = computed(() => {
			let $rows = [[], [], [], []];
			const selectedYear = value2Array(props.value);
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 3; j++) {
					let cell = {};
					if (i < 3 || j === 0) {
						cell.year = startYear.value + i * 3 + j;
					}
					cell.date = new Date(cell.year, 0, 1);
					cell.disabled = typeof props.disabledDate === 'function' && props.disabledDate(cell.year);
					cell.customClass = typeof props.cellClassName === 'function' && props.cellClassName(cell.year);
					cell.selected = selectedYear.some(year => {
						return year && cell.year === year.getFullYear();
					});
					cell.empty = !cell.year;
					$rows[i][j] = cell;
				}
			}
			return $rows;
		});

		const getCellClasses = (cell) => {
			let classes = [];
			if (cell.selected) { classes.push('is-selected'); }
			if (cell.disabled) { classes.push('is-disabled'); }
			if (cell.empty) { classes.push('is-empty'); }

			// TODO 其他情况的样式
			return classes.join(' ');
		};

		const handleYearTableClick = (cell) => {
			if (cell.disabled || cell.empty) return;

			emit('pick', cell.date);
		};

		return {
			startYear,
			rows,
			getCellClasses,
			handleYearTableClick
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-year-table;

@include block($block) {
	overflow: auto;
	@include element(wrapper) {
		margin: 10px;
		white-space: normal;
	}
	@include element(cell) {
		div {
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
		@include when(empty) {
			div {
				cursor: default;
				&:hover {
					background: unset;
				}
			}
		}
		@include when(selected) {
			div {
				background: #2d8cf0;
				color: #fff;
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
