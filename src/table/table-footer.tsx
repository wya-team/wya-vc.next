import { defineComponent, computed } from 'vue';
import { useLayoutObserver } from './layout/index';
import { useStates } from './store';
import { getInstance } from '../hooks';

export default defineComponent({
	name: 'vc-table-footer',
	props: {
		fixed: String,
		store: {
			type: Object,
			required: true
		},
		getSummary: Function,
		sumText: String,
		border: Boolean,
	},
	setup(props, context) {
		const table = getInstance('table', 'tableId');
		const states = useStates({
			data: 'data',
			columns: 'columns',
			isAllSelected: 'isAllSelected',
			leftFixedLeafCount: 'fixedLeafColumnsLength',
			rightFixedLeafCount: 'rightFixedLeafColumnsLength',
			columnsCount: $states => $states.columns.length,
			leftFixedCount: $states => $states.fixedColumns.length,
			rightFixedCount: $states => $states.rightFixedColumns.length
		});

		const isCellHidden = (index, columns, column) => {
			if (props.fixed === true || props.fixed === 'left') {
				return index >= states.leftFixedLeafCount;
			} else if (props.fixed === 'right') {
				let before = 0;
				for (let i = 0; i < index; i++) {
					before += columns[i].colSpan;
				}
				return before < states.columnsCount - states.rightFixedLeafCount;
			} else if (!props.fixed && column.fixed) { // hide cell when footer instance is not fixed and column is fixed
				return true;
			} else {
				return (index < states.leftFixedCount) || (index >= states.columnsCount - states.rightFixedCount);
			}
		};

		const getRowClasses = (column, cellIndex) => {
			const classes = [column.id, column.align, column.labelClassName];
			if (column.className) {
				classes.push(column.className);
			}
			if (isCellHidden(cellIndex, states.columns, column)) {
				classes.push('is-hidden');
			}
			if (!column.children) {
				classes.push('is-leaf');
			}
			return classes;
		};

		return () => {

			let sums = [];
			if (props.getSummary) {
				sums = props.getSummary({ columns: states.columns, data: states.data });
			} else {
				states.columns.forEach((column, index) => {
					if (index === 0) {
						sums[index] = props.sumText;
						return;
					}
					const values = states.data.map(item => Number(item[column.prop]));
					const precisions = [];
					let notNumber = true;
					values.forEach(value => {
						if (!isNaN(value)) {
							notNumber = false;
							let decimal = ('' + value).split('.')[1];
							precisions.push(decimal ? decimal.length : 0);
						}
					});
					const precision = Math.max.apply(null, precisions);
					if (!notNumber) {
						sums[index] = values.reduce((prev, curr) => {
							const value = Number(curr);
							if (!isNaN(value)) {
								return parseFloat((prev + curr).toFixed(Math.min(precision, 20)));
							} else {
								return prev;
							}
						}, 0);
					} else {
						sums[index] = '';
					}
				});
			}

			return (
				<table
					class="vc-table__footer"
					cellspacing="0"
					cellpadding="0"
					border="0"
				>
					<colgroup>
						{
							states.columns.map(column => <col name={ column.id } key={column.id} />)
						}
					</colgroup>
					<tbody>
						<tr>
							{
								states.columns.map((column, cellIndex) => (
									<td
										key={cellIndex}
										colspan={column.colSpan}
										rowspan={column.rowSpan}
										class={ getRowClasses(column, cellIndex) }
									>
										<div class={ ['vc-table__cell', column.labelClassName] }>
											{
												sums[cellIndex]
											}
										</div>
									</td>
								))
							}
						</tr>
					</tbody>
				</table>
			);
		};
	},

});
