import { 
	getCurrentInstance, 
	h, 
	defineComponent, 
	ref, 
	reactive, 
	watch, 
	computed, 
	onBeforeMount, 
	onMounted, 
	onUnmounted, 
	onUpdated, 
	Fragment 
} from 'vue';
import { Utils } from '@wya/utils';
import { merge, isEmpty } from 'lodash';
import { compose, getUid } from '../utils/index';
import { cellStarts, cellForced, defaultRenderCell, treeCellPrefix } from './table-column-confg';
import { parseWidth, parseMinWidth } from './utils';
import { getInstance } from '../hooks';

export default defineComponent({
	name: 'vc-table-column',
	props: {
		type: {
			type: String,
			default: 'default'
		},
		label: String,
		className: String,
		labelClassName: String,
		prop: String,
		width: [Number, String],
		minWidth: [Number, String],
		renderHeader: Function,
		resizable: {
			type: Boolean,
			default: true
		},
		columnKey: String,
		align: String,
		headerAlign: String,
		showPopover: Boolean,
		fixed: [Boolean, String],
		formatter: Function,
		selectable: Function,
		reserveSelection: Boolean,
		index: [Number, Function],
		// 头部是否展示排序
		sortable: Boolean,
		// 数据过滤的选项
		filters: Array,
		// 是否支持多选
		filterMultiple: {
			type: Boolean,
			default: true
		},
		filterIcon: String,
		// 选中的数据过滤项
		filteredValue: Array,
		// 筛选弹层的样式
		filterPopupClassName: String,
		// 筛选的方法
		filter: Function
	},
	setup(props, context) {
		const { slots } = context;
		const instance = getCurrentInstance();
		const table = getInstance('table', 'tableId');
		const parent = getInstance('table-column', 'columnId') || table;

		const isSubColumn = table !== parent; // 用于多久表头

		const columnId = ref((parent.proxy.tableId || parent.proxy.columnId) + getUid('column', { prefix: '' }));

		const realWidth = computed(() => {
			return parseWidth(props.width);
		});

		const realMinWidth = computed(() => {
			return parseMinWidth(props.minWidth);
		});

		const realAlign = computed(() => {
			return props.align 
				? 'is-' + props.align 
				: null;
		});

		const realHeaderAlign = computed(() => {
			return props.headerAlign 
				? 'is-' + props.headerAlign 
				: realAlign.value;
		});

		let columnConfig = reactive({});
		/**
		 * 获取当前值情况，this[key]
		 */
		const getPropsData = (...args) => {
			let result = args.reduce((prev, cur) => {
				if (Array.isArray(cur)) {
					cur.forEach((key) => {
						prev[key] = props[key];
					});
				}
				return prev;
			}, {});

			return result;
		};

		/**
		 * compose 1
		 * 对于特定类型的 column，某些属性不允许设置
		 * 如 type: selection | index | expand
		 */
		const setColumnForcedProps = (column) => {
			const type = column.type;
			const source = cellForced[type] || {};
			Object.keys(source).forEach(prop => {
				let value = source[prop];
				if (value !== undefined) {
					column[prop] = prop === 'className' 
						? `${column[prop]} ${value}` 
						: value;
				}
			});
			return column;
		};

		/**
		 * compose 2
		 * column
		 * 	 -> width
		 * 	 -> minWidth
		 */
		const setColumnWidth = (column) => {
			if (realWidth.value) {
				column.width = realWidth.value;
			}
			if (realMinWidth.value) {
				column.minWidth = realMinWidth.value;
			}
			if (!column.minWidth) {
				column.minWidth = 80;
			}
			column.realWidth = column.width === undefined 
				? column.minWidth 
				: column.width;
			return column;
		};

		/**
		 * compose 3
		 * column
		 *   -> renderHeader: 渲染头部
		 *   -> renderCell: 渲染单元格
		 * owner
		 * 	 -> renderExpanded: 展开
		 */
		const setColumnRenders = (column) => {
			const specialTypes = Object.keys(cellForced);
			// renderHeader 属性不推荐使用。
			if (props.renderHeader) {
				column.renderHeader = props.renderHeader;
			} else if (specialTypes.indexOf(column.type) === -1) {
				column.renderHeader = (data) => {
					const renderHeader = slots.header;
					return renderHeader 
						? renderHeader(data) 
						: data?.column?.label;
				};
			}

			let originRenderCell = column.renderCell;
			// TODO: 这里的实现调整
			if (column.type === 'expand') {
				// 对于展开行，renderCell 不允许配置的。在上一步中已经设置过，这里需要简单封装一下。
				column.renderCell = (data) => (
					<div class="vc-table__cell">
						{ originRenderCell(data) }
					</div>
				);
				table.renderExpanded = (data) => {
					return slots.default
						? slots.default(data)
						: slots.default;
				};
			} else {
				originRenderCell = originRenderCell || defaultRenderCell;
				// 对 renderCell 进行包装
				column.renderCell = (data) => {
					let children = null;

					if (slots.default) {
						children = slots?.default?.(data);
					} else {
						children = originRenderCell(data);
					}

					let prefix = treeCellPrefix(data);
					const $props = {
						class: 'vc-table__cell',
						style: {}
					};
					// 存在树形数组，且当前行无箭头图标且处于当前展开列，表格对齐
					if (!isEmpty(table.proxy.store.states.treeData) && !prefix && data.isExpandColumn) {
						prefix = <span class="vc-table-un-expand__indent"/>;
					}	
					
					if (data.column.showPopover) {
						$props.class += ' vc-popover';
						$props.style = { 
							width: (data.column.realWidth || data.column.width) - 1 + 'px' 
						};
					}
					const { placeholder } = table.props;
					const contentPlaceholder = typeof tableplaceholder === 'function' ? placeholder() : placeholder;
					return (
						<div {...$props}>
							{prefix}
							{children === undefined || children === '' || children === null ? contentPlaceholder : children}
						</div>
					);
				};
			}
			return column;
		};

		const refreshColumnBasicConfig = () => {
			const defaults = {
				...cellStarts[props.type],
				type: props.type,
				id: columnId.value,
				align: realAlign.value,
				headerAlign: realHeaderAlign.value,
				prop: props.prop,
				showPopover: props.showPopover,
				// index 列
				index: props.index
			};

			const basicProps = ['columnKey', 'label', 'className', 'labelClassName', 'type', 'renderHeader', 'resizable', 'formatter', 'fixed', 'resizable']; // eslint-disable-line
			const selectProps = ['selectable', 'reserveSelection'];
			const sortProps = ['sortable'];
			const filterProps = ['filters', 'filteredValue', 'filterMultiple', 'filter', 'filterIcon', 'filterPopupClassName'];

			let column = getPropsData(basicProps, selectProps, sortProps, filterProps);

			column = merge(defaults, column);

			// 注意 compose 中函数执行的顺序是从右到左
			column = compose(
				setColumnRenders, 
				setColumnWidth, 
				setColumnForcedProps
			)(column);

			for (let key in column) {
				if (Utils.hasOwn(column, key)) {
					columnConfig[key] = column[key];
				}
			}
		};

		const registerComplexWatchers = () => {
			watch(() => props.fixed, (v) => {
				table.proxy.store.scheduleLayout(true);
			});
			watch(() => realWidth, (v) => {
				table.proxy.store.scheduleLayout(false);
				
			});
			watch(() => realMinWidth, (v) => {
				table.proxy.store.scheduleLayout(false);
			});
		};

		onBeforeMount(() => {
			refreshColumnBasicConfig();
			registerComplexWatchers();
		});

		onUpdated(refreshColumnBasicConfig);
		onMounted(() => {
			let children = isSubColumn 
				? parent.vnode.el.children 
				: parent.proxy.hiddenColumns.children;
			
			if (!isSubColumn 
				&& children.length === 1 
				&& /vc-table-item/.test(children[0].className)
			) {
				children = children[0].children;
			}
			// DOM上
			let columnIndex = [...children].indexOf(instance.vnode.el);

			table.proxy.store.commit(
				'insertColumn', 
				columnConfig, 
				columnIndex, 
				isSubColumn && parent.proxy.columnConfig
			);
		});

		onUnmounted(() => {
			if (!instance.parent) return;
			table.proxy.store.commit(
				'removeColumn', 
				columnConfig, 
				isSubColumn && parent.proxy.columnConfig
			);
		});

		if (instance && instance.proxy) {
			instance.proxy.columnId = columnId;
			instance.proxy.columnConfig = columnConfig;
		}

		/**
		 * 可以计算 columnIndex(外层需要标签元素), 即h('div')
		 * this.$slots?.default?.() 用于多级表头
		 */
		return () => {
			let children = [];

			try {
				let renderDefault = slots?.default?.({ row: {}, column: {}, $index: -1 });
				if (renderDefault instanceof Array) {
					for (const childNode of renderDefault) {
						if (/^vcm?-table-column$/.test(childNode.type?.name)) {
							children.push(childNode);
						} else if (childNode.type === Fragment && childNode.children instanceof Array) {
							renderDefault.push(...childNode.children);
						}
					}
				}
			} catch {
				children = [];
			}
			return h('div', children);
		};
	}
});
