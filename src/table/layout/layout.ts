import { reactive, nextTick, ref, computed, getCurrentInstance, inject, onBeforeMount, onUnmounted, onMounted, onUpdated } from 'vue';
import { Utils } from '@wya/utils';
import { parseHeight } from '../utils';
import { IS_SERVER } from '../../utils/constant';
import { VcError } from '../../vc';

class TableLayout {
	constructor(options) {
		this.table = options.table;
		this.store = options.store;

		if (!this.table) {
			throw new VcError('table', 'Table Layout 必须包含table实例');
		}
		if (!this.store) {
			throw new VcError('table', 'Table Layout 必须包含store实例');
		}

		const { props } = this.table;

		this.states = reactive({
			fit: props.fit,
			showHeader: props.showHeader,
			height: null,
			scrollX: false,
			scrollY: false,
			bodyWidth: null,
			fixedWidth: null,
			rightFixedWidth: null,
			tableHeight: null,
			headerHeight: 44, // Table Header Height
			appendHeight: 0, // Append Slot Height
			footerHeight: 44, // Table Footer Height
			viewportHeight: null, // Table Height - Scroll Bar Height
			bodyHeight: null, // Table Height - Table Header Height
			fixedBodyHeight: null, // Table Height - Table Header Height - Scroll Bar Heigh
		});

		this.updateScroller = this.updateScroller.bind(this);
		this.updateColumns = this.updateColumns.bind(this);

		// TODO: remove
		onMounted(() => {
			this.updateColumns();
			this.updateScroller();
		});

		let __updated__;
		onUpdated(() => {
			if (__updated__) return;
			this.updateColumns();
			this.updateScroller();
			__updated__ = true;
		});
	}

	updateScrollY() {
		const { height, bodyHeight } = this.states;
		if (height === null) return;
		const scroller = this.table.proxy.scroller;
		if (this.table.vnode.el && scroller) {
			const body = scroller.$el.querySelector('.vc-table__body');
			this.states.scrollY = body.offsetHeight > bodyHeight;
		}
	}

	setHeight(value, prop = 'height') {
		if (IS_SERVER) return;
		const el = this.table.vnode.el;
		value = parseHeight(value);
		this.states.height = value;

		if (!el && (value || value === 0)) return nextTick(() => this.setHeight(value, prop));

		if (value) {
			el.style[prop] = `${value}px`;
			this.updateElsHeight();
		}
	}

	setMaxHeight(value) {
		this.setHeight(value, 'max-height');
	}

	getFlattenColumns() {
		const flattenColumns = [];
		const columns = this.store.states.columns;
		columns.forEach((column) => {
			if (column.isColumnGroup) {
				flattenColumns.push(...column.columns);
			} else {
				flattenColumns.push(column);
			}
		});

		return flattenColumns;
	}

	updateElsHeight() {
		if (!this.table.proxy.isReady) return nextTick(() => this.updateElsHeight());
		const { headerWrapper, appendWrapper, footerWrapper, } = this.table.proxy;
		const { showHeader, scrollX } = this.states; 
		this.states.appendHeight = appendWrapper ? appendWrapper.offsetHeight : 0;

		if (showHeader && !headerWrapper) return;
		const headerHeight = !showHeader ? 0 : headerWrapper.offsetHeight;
		this.states.headerHeight = headerHeight;

		if (showHeader && headerWrapper.offsetWidth > 0 && (this.store.states.columns || []).length > 0 && headerHeight < 2) {
			return nextTick(() => this.updateElsHeight());
		}

		const tableHeight = this.table.vnode.el.clientHeight;

		this.states.tableHeight = tableHeight;
		const footerHeight = footerWrapper ? footerWrapper.offsetHeight : 0;
		this.states.footerHeight = footerHeight;

		// footerWrapper 中margin-top: -1px
		if (this.states.height !== null) {
			this.states.bodyHeight = tableHeight - headerHeight - footerHeight + (footerWrapper ? 1 : 0);
		}
		const { bodyHeight } = this.states;
		this.states.fixedBodyHeight = bodyHeight;

		const noData = !this.table.props.dataSource || this.table.props.dataSource.length === 0;
		this.states.viewportHeight = tableHeight;

		this.updateScrollY();
		this.updateScroller();
	}

	updateColumnsWidth() {
		if (IS_SERVER) return;
		const bodyWidth = this.table.vnode.el.clientWidth;
		let bodyMinWidth = 0;

		const flattenColumns = this.getFlattenColumns();
		let flexColumns = flattenColumns.filter((column) => typeof column.width !== 'number');

		flattenColumns.forEach((column) => { // Clean those columns whose width changed from flex to unflex
			if (typeof column.width === 'number' && column.realWidth) column.realWidth = null;
		});

		const { fit, scrollY } = this.states;

		if (flexColumns.length > 0 && fit) {
			flattenColumns.forEach((column) => {
				bodyMinWidth += column.width || column.minWidth || 80;
			});

			if (bodyMinWidth <= bodyWidth) {
				this.states.scrollX = false;

				const totalFlexWidth = bodyWidth - bodyMinWidth;

				if (flexColumns.length === 1) {
					flexColumns[0].realWidth = (flexColumns[0].minWidth || 80) + totalFlexWidth;
				} else {
					const allColumnsWidth = flexColumns.reduce((prev, column) => prev + (column.minWidth || 80), 0);
					const flexWidthPerPixel = totalFlexWidth / allColumnsWidth;
					let noneFirstWidth = 0;

					flexColumns.forEach((column, index) => {
						if (index === 0) return;
						const flexWidth = Math.floor((column.minWidth || 80) * flexWidthPerPixel);
						noneFirstWidth += flexWidth;
						column.realWidth = (column.minWidth || 80) + flexWidth;
					});

					flexColumns[0].realWidth = (flexColumns[0].minWidth || 80) + totalFlexWidth - noneFirstWidth;
				}
			} else { // HAVE HORIZONTAL SCROLL BAR
				this.states.scrollX = true;
				flexColumns.forEach(function (column) {
					column.realWidth = column.minWidth;
				});
			}

			this.states.bodyWidth = Math.max(bodyMinWidth, bodyWidth);
			this.table.proxy.resizeState.width = this.states.bodyWidth;
		} else {
			flattenColumns.forEach((column) => {
				if (!column.width && !column.minWidth) {
					column.realWidth = 80;
				} else {
					column.realWidth = column.width || column.minWidth;
				}

				bodyMinWidth += column.realWidth;
			});

			this.states.scrollX = bodyMinWidth > bodyWidth;
			this.states.bodyWidth = bodyMinWidth;
		}

		const fixedColumns = this.store.states.fixedColumns;

		if (fixedColumns.length > 0) {
			let fixedWidth = 0;
			fixedColumns.forEach(function (column) {
				fixedWidth += column.realWidth || column.width;
			});

			this.states.fixedWidth = fixedWidth;
		}

		const rightFixedColumns = this.store.states.rightFixedColumns;
		if (rightFixedColumns.length > 0) {
			let rightFixedWidth = 0;
			rightFixedColumns.forEach(function (column) {
				rightFixedWidth += column.realWidth || column.width;
			});

			this.states.rightFixedWidth = rightFixedWidth;
		}

		this.updateColumns();
	}

	// v2.x中的 notifyObservers
	updateColumns() {
		const cols = this.table.vnode.el.querySelectorAll('colgroup > col');
		if (!cols.length) return;
		const flattenColumns = this.getFlattenColumns();
		const columnsMap = {};
		flattenColumns.forEach((column) => {
			columnsMap[column.id] = column;
		});
		for (let i = 0, j = cols.length; i < j; i++) {
			const col = cols[i];
			const name = col.getAttribute('name');
			const column = columnsMap[name];
			if (column) {
				col.setAttribute('width', column.realWidth || column.width);
			}
		}
	}

	updateScroller() {
		const cols = this.table.vnode.el.querySelectorAll('colgroup > col[name=gutter]');
		for (let i = 0, j = cols.length; i < j; i++) {
			const col = cols[i];
			col.setAttribute('width', '0');
		}
		const ths = this.table.vnode.el.querySelectorAll('th.vc-table__gutter');
		for (let i = 0, j = ths.length; i < j; i++) {
			const th = ths[i];
			th.style.width = '0';
			th.style.display = this.states.scrollY ? '' : 'none';
		}
	}
}

export default TableLayout;
