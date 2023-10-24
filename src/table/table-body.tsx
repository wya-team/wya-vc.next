import { defineComponent, computed, getCurrentInstance, inject, onBeforeMount, onUnmounted, onMounted, onUpdated, watch } from 'vue';

import { debounce } from 'lodash';
import { $ } from '@wya/utils';
import Popover from '../popover';
import { getCell, getColumnByCell, getRowIdentity } from './utils';
import { useLayoutObserver } from './layout/index';

import { useStates } from './store';
import { VcError } from '../vc/index';
import { IS_SERVER, raf } from '../utils/index';
import { getInstance } from '../hooks';

export default defineComponent({
	name: 'vc-table-body',
	props: {
		store: {
			type: Object,
			required: true
		},
		stripe: Boolean,
		context: {
			type: Object,
			default: () => ({})
		},
		rowClassName: [String, Function],
		rowStyle: [Object, Function],
		fixed: String,
		highlight: Boolean
	},
	setup(props, context) {
		const instance = getCurrentInstance();
		const table = getInstance('table', 'tableId');

		const states = useStates({
			data: 'data',
			columns: 'columns',
			treeIndent: 'indent',
			leftFixedLeafCount: 'fixedLeafColumnsLength',
			rightFixedLeafCount: 'rightFixedLeafColumnsLength',
			columnsCount: $states => $states.columns.length,
			leftFixedCount: $states => $states.fixedColumns.length,
			rightFixedCount: $states => $states.rightFixedColumns.length,
			hasExpandColumn: $states => $states.columns.some(({ type }) => type === 'expand'),
			firstDefaultColumnIndex: $states => $states.columns.findIndex(({ type }) => type === 'default')
		});

		watch(
			() => props.store.states.hoverRow,
			(v, oldV) => {
				if (!props.store.states.isComplex || IS_SERVER) return;
				raf(() => {
					const rows = instance.vnode.el.querySelectorAll('.vc-table__row');
					const oldRow = rows[oldV];
					const newRow = rows[v];
					oldRow && $(oldRow).removeClass('hover-row');
					newRow && $(newRow).addClass('hover-row');
				});
			}
		);

		let timer;
		let popperInstance;

		const getKeyOfRow = (row, index) => {
			const { rowKey } = table.props;
			if (rowKey) {
				return getRowIdentity(row, rowKey);
			}
			return index;
		};

		const isColumnHidden = (index) => {
			if (props.fixed === true || props.fixed === 'left') {
				return index >= states.leftFixedLeafCount;
			} else if (props.fixed === 'right') {
				return index < states.columnsCount - states.rightFixedLeafCount;
			} else {
				return (index < states.leftFixedLeafCount) || (index >= states.columnsCount - states.rightFixedLeafCount);
			}
		};

		const getSpan = (row, column, rowIndex, columnIndex) => {
			let rowspan = 1;
			let colspan = 1;
			const { getSpan: $getSpan } = table.props;
			if (typeof $getSpan === 'function') {
				const result = $getSpan({
					row,
					column,
					rowIndex,
					columnIndex
				});
				if (Array.isArray(result)) {
					rowspan = result[0];
					colspan = result[1];
				} else if (typeof result === 'object') {
					rowspan = result.rowspan;
					colspan = result.colspan;
				}
			}
			return { rowspan, colspan };
		};

		const getRowStyle = (row, rowIndex) => {
			const { rowStyle } = table.props;
			if (typeof rowStyle === 'function') {
				return rowStyle.call(null, {
					row,
					rowIndex
				});
			}
			return rowStyle || null;
		};

		const getRowClass = (row, rowIndex) => {
			const classes = ['vc-table__row'];
			if (table.proxy.highlightCurrentRow && row === props.store.states.currentRow) {
				classes.push('current-row');
			}

			if (props.stripe && rowIndex % 2 === 1) {
				classes.push('vc-table__row--striped');
			}
			const rowClassName = table.props.rowClassName;
			if (typeof rowClassName === 'string') {
				classes.push(rowClassName);
			} else if (typeof rowClassName === 'function') {
				classes.push(rowClassName.call(null, {
					row,
					rowIndex
				}));
			}

			if (props.store.states.expandRows.indexOf(row) > -1) {
				classes.push('expanded');
			}

			return classes;
		};

		const getCellStyle = (rowIndex, columnIndex, row, column) => {
			const { cellStyle } = table.props;
			if (typeof cellStyle === 'function') {
				return cellStyle.call(null, {
					rowIndex,
					columnIndex,
					row,
					column
				});
			}
			return cellStyle;
		};

		const getCellClass = (rowIndex, columnIndex, row, column) => {
			const classes = [column.id, column.align, column.className];

			if (isColumnHidden(columnIndex)) {
				classes.push('is-hidden');
			}

			const cellClassName = table.props.cellClassName;
			if (typeof cellClassName === 'string') {
				classes.push(cellClassName);
			} else if (typeof cellClassName === 'function') {
				classes.push(cellClassName.call(null, {
					rowIndex,
					columnIndex,
					row,
					column
				}));
			}

			return classes.join(' ');
		};

		const getColspanRealWidth = (columns, colspan, index) => {
			if (colspan < 1) {
				return columns[index].realWidth;
			}
			const widthArr = columns.map(({ realWidth }) => realWidth).slice(index, index + colspan);
			return widthArr.reduce((acc, width) => acc + width, -1);
		};

		const handleCellMouseEnter = (e, row) => {
			const cell = getCell(e);

			if (cell) {
				const column = getColumnByCell(states.columns, cell);
				const hoverState = { cell, column, row };
				table.proxy.hoverState = hoverState;

				table.emit('cell-mouse-enter', hoverState.row, hoverState.column, hoverState.cell, e);
			}

			// 判断是否text-overflow, 如果是就显示tooltip
			const cellChild = e.target.querySelector('.vc-table__cell');

			if (!($(cellChild).hasClass('vc-popover') && cellChild.childNodes.length)) {
				return;
			}
			// 使用范围宽度而不是滚动宽度来确定文本是否溢出，以解决潜在的FireFox bug
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1074543#c3
			const range = document.createRange();
			range.setStart(cellChild, 0);
			range.setEnd(cellChild, cellChild.childNodes.length);
			const rangeWidth = range.getBoundingClientRect().width;
			const padding = (parseInt(cellChild.style.paddingLeft, 10) || 0) + (parseInt(cellChild.style.paddingRight, 10) || 0);
			if ((rangeWidth + padding > cellChild.offsetWidth || cellChild.scrollWidth > cellChild.offsetWidth)) {
				popperInstance = null;
				popperInstance = Popover.open({
					el: document.body,
					cName: 'vc-table-popover', // 确保不重复创建
					triggerEl: cell,
					hover: true,
					theme: 'dark',
					placement: "top",
					content: cell.innerText || cell.textContent,
					alone: true
				});
			}
		};

		const handleCellMouseLeave = (e) => {
			const cell = getCell(e);
			if (!cell) return;

			const oldHoverState = table.proxy.hoverState || {};
			table.emit('cell-mouse-leave', oldHoverState.row, oldHoverState.column, oldHoverState.cell, event);
		};

		const handleMouseEnter = debounce((index) => {
			props.store.commit('setHoverRow', index);
		}, 30);

		const handleMouseLeave = debounce(() => {
			props.store.commit('setHoverRow', null);
		}, 30);

		const handleEvent = (e, row, name) => {
			const cell = getCell(e);
			let column;
			if (cell) {
				column = getColumnByCell(states.columns, cell);
				if (column) {
					table.emit(`cell-${name}`, row, column, cell, e);
				}
			}
			table.emit(`row-${name}`, row, column, e);
		};

		const handleContextMenu = (e, row) => {
			handleEvent(e, row, 'contextmenu');
		};

		const handleDoubleClick = (e, row) => {
			handleEvent(e, row, 'dblclick');
		};

		const handleClick = (e, row) => {
			props.store.commit('setCurrentRow', row);
			handleEvent(e, row, 'click');
		};

		const renderRow = (row, $index, treeRowData) => {
			let { treeIndent, columns } = states;
			const columnsHidden = columns.map((column, index) => isColumnHidden(index));
			const rowClasses = getRowClass(row, $index);
			const style = getRowStyle(row, $index);
			const expandIndex = columns.length > 1 && columns[0].type === 'selection' ? 1 : 0;
			let key = getKeyOfRow(row, $index);

			let display = true;
			if (treeRowData) {
				rowClasses.push('vc-table__row--level-' + treeRowData.level);
				display = treeRowData.display;

				// key = `${key}___${treeRowData.level}`;
			}
			return (
				<tr
					v-show={display}
					style={style}
					class={rowClasses}
					key={key}
					onDblclick={($event) => handleDoubleClick($event, row)}
					onClick={($event) => handleClick($event, row)}
					onContextmenu={($event) => handleContextMenu($event, row)}
					onMouseenter={_ => handleMouseEnter($index)}
					onMouseleave={handleMouseLeave}
				>
					{
						columns.map((column, cellIndex) => {
							const { rowspan, colspan } = getSpan(row, column, $index, cellIndex);
							if (!rowspan || !colspan) {
								return null;
							}
							const columnData = { ...column };
							columnData.realWidth = getColspanRealWidth(columns, colspan, cellIndex);
							const data = {
								store: props.store,
								_self: instance,
								column: columnData,
								level: (treeRowData && treeRowData.level) || 0, // 用于expandSelectable
								row,
								$index,
							};

							if (cellIndex === states.firstDefaultColumnIndex && treeRowData) {
								data.treeNode = {
									indent: treeRowData.level * treeIndent,
									level: treeRowData.level
								};

								if (typeof treeRowData.expanded === 'boolean') {
									data.treeNode.expanded = treeRowData.expanded;
									// 表明是懒加载
									if ('loading' in treeRowData) {
										data.treeNode.loading = treeRowData.loading;
									}
									if ('noLazyChildren' in treeRowData) {
										data.treeNode.noLazyChildren = treeRowData.noLazyChildren;
									}
								}
							}
							return (
								<td
									style={getCellStyle($index, cellIndex, row, column)}
									class={getCellClass($index, cellIndex, row, column)}
									rowspan={rowspan}
									colspan={colspan}
									onMouseenter={(e) => handleCellMouseEnter(e, row)}
									onMouseleave={handleCellMouseLeave}
								>
									{
										column.renderCell.call(
											instance,
											{
												...data,
												isExpandColumn: expandIndex === cellIndex
											},
											columnsHidden[cellIndex]
										)
									}
								</td>
							);
						})
					}
				</tr>
			);
		};

		const renderRowWrapper = (row, $index) => {
			const { treeData, lazyTreeNodeMap, childrenColumnName, rowKey } = props.store.states;
			if (states.hasExpandColumn && props.store.isRowExpanded(row)) {
				const renderExpanded = table.proxy.renderExpanded;
				const tr = renderRow(row, $index);
				if (!renderExpanded) {
					console.error('[vc-table]: renderExpanded必填');
					return tr;
				}
				// 使用二维数组，避免修改 $index
				return [
					[
						tr,
						<tr key={'expanded-row__' + tr.key}>
							<td colspan={ states.columnsCount } class="vc-table__expanded-cell">
								{ renderExpanded({ row, $index, store: props.store }) }
							</td>
						</tr>
					]
				];
			} else if (Object.keys(treeData).length) {
				props.store.assertRowKey();
				/**
				 * TreeTable 时，rowKey 必须由用户设定，不使用 getKeyOfRow 计算
				 * 在调用 renderRow 函数时，仍然会计算 rowKey，不太好的操作
				 */
				const key = getRowIdentity(row, rowKey);
				
				let cur = treeData[key];
				let treeRowData = null;
				if (cur) {
					treeRowData = {
						expanded: cur.expanded,
						level: cur.level,
						display: true,
					};
					
					if (typeof cur.lazy === 'boolean') {
						if (typeof cur.loaded === 'boolean' && cur.loaded) {
							treeRowData.noLazyChildren = !(cur.children && cur.children.length);
						}
						treeRowData.loading = cur.loading;
					}
				}
				const tmp = [renderRow(row, $index, treeRowData)];
				// 渲染嵌套数据
				if (cur) {
					// currentRow 记录的是 index，所以还需主动增加 TreeTable 的 index
					let i = 0;
					const traverse = (children, parent) => {
						if (!(children && children.length && parent)) return;
						children.forEach(node => {
							// 父节点的 display 状态影响子节点的显示状态
							const innerTreeRowData = {
								display: parent.display && parent.expanded,
								level: parent.level + 1
							};

							const childKey = getRowIdentity(node, rowKey);
							if (childKey === undefined || childKey === null) {
								throw new VcError('table', '子节点，rowKey是必须的');
							}
							// 浅拷贝，level修改有助于treeData判断当前最大的level,计算宽度
							cur = treeData[childKey]; 
							/**
							 * 对于当前节点，分成有无子节点两种情况。
							 * 如果包含子节点的，设置 expanded 属性。
							 * 对于它子节点的 display 属性由它本身的 expanded 与 display 共同决定。
							 */
							if (cur) {
								innerTreeRowData.expanded = cur.expanded;
								// 懒加载的某些节点，level 未知
								cur.level = cur.level || innerTreeRowData.level;

								cur.display = !!(cur.expanded && innerTreeRowData.display);
								if (typeof cur.lazy === 'boolean') {
									if (typeof cur.loaded === 'boolean' && cur.loaded) {
										innerTreeRowData.noLazyChildren = !(cur.children && cur.children.length);
									}
									innerTreeRowData.loading = cur.loading;
								}
							}
							i++;
							tmp.push(renderRow(node, $index + i, innerTreeRowData));
							if (cur) {
								const nodes = lazyTreeNodeMap[childKey] || node[childrenColumnName];
								traverse(nodes, cur);
							}
						});
					};
					// 对于 root 节点，display 一定为 true
					cur.display = true;
					const nodes = lazyTreeNodeMap[key] || row[childrenColumnName];
					traverse(nodes, cur);
				}
				return tmp;
			} else {
				return renderRow(row, $index);
			}
		};

		return () => {
			return (
				<table
					class="vc-table__body"
					cellspacing="0"
					cellpadding="0"
					border="0"
				>
					<colgroup>
						{
							states.columns.map(column => <col name={column.id} key={column.id} />)
						}
					</colgroup>
					<tbody>
						{
							states.data.reduce((acc, row) => {
								return acc.concat(renderRowWrapper(row, acc.length));
							}, [])
						}
					</tbody>
				</table>
			);
		};
	}
});
