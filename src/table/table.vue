<template>
	<div 
		:class="classes" 
		class="vc-table"
		@mouseleave="handleMouseLeave" 
	>
		<!-- 依赖收集 -->
		<div ref="hiddenColumns" class="vc-table__hidden">
			<slot />
		</div>
		<div
			v-if="showHeader"
			ref="headerWrapper"
			v-event:mousewheel="handleHeaderFooterMousewheel"
			class="vc-table__header-wrapper"
		>
			<vc-table-header
				ref="tableHeader"
				:store="store"
				:border="border"
				:default-sort="defaultSort"
				:style="{
					width: layout.states.bodyWidth ? layout.states.bodyWidth + 'px' : ''
				}"
			/>
		</div>
		<div
			ref="bodyWrapper"
			:class="[layout.states.scrollX ? `is-scrolling-${scrollPosition}` : 'is-scrolling-none']"
			:style="[bodyHeight]"
			class="vc-table__body-wrapper"
		>
			<vc-table-body
				:context="context"
				:store="store"
				:stripe="stripe"
				:row-class-name="rowClassName"
				:row-style="rowStyle"
				:highlight="highlightCurrentRow"
				:style="{ width: bodyWidth }"
			/>
			<div
				v-if="!dataSource || dataSource.length === 0"
				ref="emptyBlock"
				:style="{ width: bodyWidth }"
				class="vc-table__empty-block"
			>
				<!-- TODO: vc-customer -->
				<span class="vc-table__empty-text">
					<slot name="empty">{{ emptyText || '暂无数据' }}</slot>
				</span>
			</div>
			<div
				v-if="$slots.append"
				ref="appendWrapper"
				class="vc-table__append-wrapper"
			>
				<slot name="append" />
			</div>
		</div>
		<div
			v-if="showSummary"
			v-show="dataSource && dataSource.length > 0"
			ref="footerWrapper"
			v-event:mousewheel="handleHeaderFooterMousewheel"
			class="vc-table__footer-wrapper"
		>
			<vc-table-footer
				:store="store"
				:border="border"
				:sum-text="sumText || '合计'"
				:get-summary="getSummary"
				:style="{ width: layout.states.bodyWidth? layout.states.bodyWidth+ 'px' : ''}"
			/>
		</div>
		<div
			v-if="states.fixedColumns.length > 0"
			ref="fixedWrapper"
			v-event:mousewheel="handleFixedMousewheel"
			:style="[{ width: layout.states.fixedWidth ? layout.states.fixedWidth + 'px' : ''}, fixedHeight]"
			class="vc-table__fixed"
		>
			<div
				v-if="showHeader"
				ref="fixedHeaderWrapper" 
				class="vc-table__fixed-header-wrapper"
			>
				<vc-table-header
					ref="fixedTableHeader"
					:border="border"
					:store="store"
					:default-sort="defaultSort"
					:style="{ width: bodyWidth }" 
					fixed="left"
				/>
			</div>
			<div
				ref="fixedBodyWrapper"
				:style="[{ top: layout.states.headerHeight + 'px' }, fixedBodyHeight]"
				class="vc-table__fixed-body-wrapper"
			>
				<vc-table-body
					:store="store"
					:stripe="stripe"
					:highlight="highlightCurrentRow"
					:row-class-name="rowClassName"
					:row-style="rowStyle"
					:style="{ width: bodyWidth }"
					fixed="left"
				/>
				<div
					v-if="$slots.append"
					:style="{ height: layout.states.appendHeight + 'px' }" 
					class="vc-table__append-gutter"
				/>
			</div>
			<div
				v-if="showSummary"
				v-show="dataSource && dataSource.length > 0"
				ref="fixedFooterWrapper"
				class="vc-table__fixed-footer-wrapper"
			>
				<vc-table-footer
					:border="border"
					:sum-text="sumText || '合计'"
					:get-summary="getSummary"
					:store="store"
					:style="{ width: bodyWidth }" 
					fixed="left"
				/>
			</div>
		</div>
		<div
			v-if="states.rightFixedColumns.length > 0"
			ref="rightFixedWrapper"
			v-event:mousewheel="handleFixedMousewheel"
			:style="[
				{
					width: layout.states.rightFixedWidth ? layout.states.rightFixedWidth + 'px' : '',
					right: layout.states.scrollY ? (border ? layout.states.gutterWidth : (layout.states.gutterWidth || 0)) + 'px' : ''
				},
				fixedHeight
			]"
			class="vc-table__fixed-right"
		>
			<div 
				v-if="showHeader"
				ref="rightFixedHeaderWrapper"
				class="vc-table__fixed-header-wrapper"
			>
				<vc-table-header
					ref="rightFixedTableHeader"
					:border="border"
					:default-sort="defaultSort"
					:store="store"
					:style="{width: bodyWidth}"
					fixed="right"
				/>
			</div>
			<div
				ref="rightFixedBodyWrapper"
				
				:style="[
					{
						top: layout.states.headerHeight + 'px'
					},
					fixedBodyHeight
				]"
				class="vc-table__fixed-body-wrapper"
			>
				<vc-table-body
					:store="store"
					:stripe="stripe"
					:row-class-name="rowClassName"
					:row-style="rowStyle"
					:highlight="highlightCurrentRow"
					:style="{ width: bodyWidth }"
					fixed="right"
				/>
				<div
					v-if="$slots.append"
					:style="{ height: layout.states.appendHeight + 'px' }"
					class="vc-table__append-gutter"
				/>
			</div>
			<div
				v-if="showSummary"
				v-show="dataSource && dataSource.length > 0"
				ref="rightFixedFooterWrapper"
				class="vc-table__fixed-footer-wrapper"
			>
				<vc-table-footer
					:border="border"
					:sum-text="sumText || '合计'"
					:get-summary="getSummary"
					:store="store"
					:style="{ width: bodyWidth }" 
					fixed="right"
				/>
			</div>
		</div>
		<div
			v-if="states.rightFixedColumns.length > 0"
			ref="rightFixedPatch"
			:style="{
				width: layout.states.scrollY ? layout.states.gutterWidth + 'px' : '0',
				height: layout.states.headerHeight + 'px'
			}"
			class="vc-table__fixed-right-patch"
		/>
		<div 
			v-show="resizeProxyVisible" 
			ref="resizeProxy" 
			class="vc-table__column-resize-proxy" 
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, watch, computed, ref, getCurrentInstance, nextTick, onMounted, onBeforeUnmount } from 'vue';
import { debounce, throttle } from 'lodash';

import Extends from '../extends';
import { Resize, getUid } from '../utils/index';
import { parseHeight } from './utils';

import { Store, useStates } from './store';
import Layout from './layout/index';

// Table
import TableBody from './table-body';
import TableHeader from './table-header';
import TableFooter from './table-footer';

export default defineComponent({
	name: 'vc-table',
	components: {
		'vc-table-header': TableHeader,
		'vc-table-footer': TableFooter,
		'vc-table-body': TableBody,
	},
	directives: {
		...Extends.directives('event')
	},
	props: {
		dataSource: {
			type: Array,
			default: () => ([]),
		},
		width: [String, Number],
		height: [String, Number],
		maxHeight: [String, Number],
		// 列的宽度是否自撑开
		fit: {
			type: Boolean,
			default: true
		},
		// 是否为斑马纹 table
		stripe: Boolean,
		// 是否带有纵向边框
		border: Boolean,
		rowKey: [String, Function],
		context: {
			type: Object,
			default: () => ({})
		},
		// 是否显示表头
		showHeader: {
			type: Boolean,
			default: true
		},
		showSummary: Boolean,
		sumText: String,
		getSummary: Function,
		rowClassName: [String, Function],
		rowStyle: [Object, Function],
		cellClassName: [String, Function],
		cellStyle: [Object, Function],
		headerRowClassName: [String, Function],
		headerRowStyle: [Object, Function],
		headerCellClassName: [String, Function],
		headerCellStyle: [Object, Function],
		highlightCurrentRow: Boolean,
		currentRowKey: [String, Number],
		emptyText: [String, Function],
		expandRowKeys: Array,
		defaultExpandAll: Boolean,
		/**
		 * 在多选表格中，当仅有部分行被选中时，点击表头的多选框时的行为。
		 * 若为 true，则选中所有行；若为 false，则取消选择所有行
		 */
		selectOnIndeterminate: {
			type: Boolean,
			default: true
		},
		lazy: Boolean,
		// 展示树形数据时，树节点的缩进
		indent: {
			type: Number,
			default: 16
		},
		treeProps: {
			type: Object,
			default: () => {
				return {
					hasChildren: 'hasChildren',
					children: 'children'
				};
			}
		},
		// 树形表格子集是否需要显示选择按钮
		expandSelectable: {
			type: Boolean,
			default: true
		},
		loadExpand: Function,
		getSpan: Function,
		placeholder: {
			type: [String, Function],
			default: '--'
		},
		/**
		 * 排序全部交给外部处理，内部不处理数据，只做交互
		 * 列与列之间互斥
		 */
		defaultSort: {
			type: Object,
			default: () => ({})
		}
	},
	emits: [
		'select',
		'select-all',
		'selection-change',
		'cell-mouse-enter',
		'cell-mouse-leave',
		'cell-click',
		'cell-dblclick',
		'row-click',
		'row-contextmenu',
		'row-dblclick',
		'header-click',
		'header-contextmenu',
		'current-change',
		'header-dragend ',
		'expand-change',
		'sort-change'
	],
	setup(props, context) {
		const { emit } = context;
		const instance = getCurrentInstance();

		const store = new Store({ table: instance });
		const layout = new Layout({ table: instance, store });

		// 由table-column控制
		const renderExpanded = ref(null);
		const resizeProxyVisible = ref(false);
		const resizeState = ref({
			width: null,
			height: null
		});

		// refs
		const hiddenColumns = ref(null);
		const headerWrapper = ref(null);
		const tableHeader = ref(null);
		const bodyWrapper = ref(null);
		const emptyBlock = ref(null);
		const appendWrapper = ref(null);
		const footerWrapper = ref(null);
		const fixedWrapper = ref(null);
		const fixedHeaderWrapper = ref(null);
		const fixedTableHeader = ref(null);
		const fixedBodyWrapper = ref(null);
		const fixedFooterWrapper = ref(null);
		const rightFixedWrapper = ref(null);
		const rightFixedHeaderWrapper = ref(null);
		const rightFixedTableHeader = ref(null);
		const rightFixedBodyWrapper = ref(null);
		const rightFixedFooterWrapper = ref(null);
		const rightFixedPatch = ref(null);
		const resizeProxy = ref(null);

		// 是否拥有多级表头, 由table-header控制
		const isGroup = ref(false);
		const scrollPosition = ref('left');
		const hoverState = ref(null);
		const isReady = ref(false);

		const states = useStates({
			fixedColumns: 'fixedColumns',
			rightFixedColumns: 'rightFixedColumns'
		}, store);

		const classes = computed(() => {
			return {
				'vc-table--fit': props.fit,
				'vc-table--striped': props.stripe,
				'vc-table--border': props.border || isGroup.value,
				'vc-table--group': isGroup.value,
				'vc-table--fluid-height': props.maxHeight,
				'vc-table--scrollable-x': layout.states.scrollX,
				'vc-table--scrollable-y': layout.states.scrollY,
				'vc-table--enable-row-hover': !store.states.isComplex,
				'vc-table--enable-row-transition': (store.states.data || []).length !== 0 && (store.states.data || []).length < 100
			};
		});

		const shouldUpdateHeight = computed(() => {
			return props.height 
				|| props.maxHeight 
				|| states.fixedColumns.length > 0 
				|| states.rightFixedColumns.length > 0;
		});

		const bodyWidth = computed(() => {
			const { bodyWidth: $bodyWidth, scrollY, gutterWidth } = layout.states;
			return $bodyWidth ? $bodyWidth - (scrollY ? gutterWidth : 0) + 'px' : '';
		});

		const bodyHeight = computed(() => {
			const { headerHeight, bodyHeight: $bodyHeight, footerHeight } = layout.states;
			if (props.height) {
				return {
					height: $bodyHeight ? $bodyHeight + 'px' : ''
				};
			} else if (props.maxHeight) {
				const maxHeight = parseHeight(props.maxHeight);
				if (maxHeight) {
					return {
						'max-height': (maxHeight - (footerHeight || 0) - (props.showHeader ? (headerHeight || 0) : 0)) + 'px'
					};
				}
			}
			return {};
		});

		const fixedBodyHeight = computed(() => {
			if (props.height) {
				return {
					height: layout.states.fixedBodyHeight ? layout.states.fixedBodyHeight + 'px' : ''
				};
			} else if (props.maxHeight) {
				let maxHeight = parseHeight(props.maxHeight);
				if (maxHeight) {
					maxHeight = layout.states.scrollX ? maxHeight - layout.states.gutterWidth : maxHeight;
					if (props.showHeader) {
						maxHeight -= layout.states.headerHeight;
					}
					maxHeight -= layout.states.footerHeight;
					return {
						'max-height': maxHeight + 'px'
					};
				}
			}
			return {};
		});

		const fixedHeight = computed(() => {
			if (props.maxHeight) {
				if (props.showSummary) {
					return {
						bottom: 0
					};
				}
				return {
					bottom: (layout.states.scrollX && props.dataSource.length) ? layout.states.gutterWidth + 'px' : ''
				};
			} else {
				if (props.showSummary) {
					return {
						height: layout.states.tableHeight ? layout.states.tableHeight + 'px' : ''
					};
				}
				return {
					height: layout.states.viewportHeight ? layout.states.viewportHeight + 'px' : ''
				};
			}
		});

		const updateScrollY = () => {
			layout.updateScrollY();
			layout.updateColumnsWidth();
		};

		/**
		 * 对 Table 进行重新布局。
		 * 当 Table 或其祖先元素由隐藏切换为显示时，可能需要调用此方法
		 */
		const refreshLayout = () => {
			layout.updateColumnsWidth();
			if (shouldUpdateHeight.value) {
				layout.updateElsHeight();
			}
		};
		/**
		 * 用于多选表格，切换所有行的选中状态
		 */
		const toggleAllSelection = () => {
			store.commit('toggleAllSelection');
		};


		/**
		 * 用于单选表格，设定某一行为选中行，如果调用时不加参数，则会取消目前高亮行的选中状态。
		 */
		const setCurrentRow = (row) => {
			store.commit('setCurrentRow', row);
		};

		/**
		 * 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
		 */
		const toggleRowSelection = (row, selected, emitChange) => {
			store.toggleRowSelection(row, selected, emitChange);
			store.updateAllSelected();
		};

		/**
		 * 用于可展开表格与树形表格，切换某一行的展开状态
		 * 如果使用了第二个参数，则是设置这一行展开与否（expanded 为 true 则展开）
		 */
		const toggleRowExpansion = (row, expanded) => {
			store.toggleRowExpansionAdapter(row, expanded);
		};

		/**
		 * 用于多选表格，清空用户的选择
		 */
		const clearSelection = () => {
			store.clearSelection();
		};

		// TODO 性能优化
		const handleSyncPosition = throttle(function () {
			const { scrollLeft, scrollTop, offsetWidth, scrollWidth } = bodyWrapper.value;
			if (headerWrapper.value) headerWrapper.value.scrollLeft = scrollLeft;
			if (footerWrapper.value) footerWrapper.value.scrollLeft = scrollLeft;
			if (fixedBodyWrapper.value) fixedBodyWrapper.value.scrollTop = scrollTop;
			if (rightFixedBodyWrapper.value) rightFixedBodyWrapper.value.scrollTop = scrollTop;
			const maxScrollLeftPosition = scrollWidth - offsetWidth - 1;
			if (scrollLeft >= maxScrollLeftPosition) {
				scrollPosition.value = 'right';
			} else if (scrollLeft === 0) {
				scrollPosition.value = 'left';
			} else {
				scrollPosition.value = 'middle';
			}
		}, 20);

		const handleResize = () => {
			if (!isReady.value) return;
			let shouldUpdateLayout = false;
			const el = instance.vnode.el;
			const { width: oldWidth, height: oldHeight } = resizeState;

			const width = el.offsetWidth;
			if (oldWidth !== width) {
				shouldUpdateLayout = true;
			}

			const height = el.offsetHeight;
			if ((props.height || shouldUpdateHeight.value) && oldHeight !== height) {
				shouldUpdateLayout = true;
			}

			if (shouldUpdateLayout) {
				resizeState.value = {
					width,
					height
				};

				refreshLayout();
			}
		};

		const handleMouseLeave = () => {
			store.commit('setHoverRow', null);
			if (hoverState.value) hoverState.value = null;
		};

		const handleFixedMousewheel = (event, data) => {
			const el = bodyWrapper.value;
			if (Math.abs(data.spinY) > 0) {
				const currentScrollTop = el.scrollTop;
				if (data.pixelY < 0 && currentScrollTop !== 0) {
					event.preventDefault();
				}
				if (data.pixelY > 0 && el.scrollHeight - el.clientHeight > currentScrollTop) {
					event.preventDefault();
				}
				el.scrollTop += Math.ceil(data.pixelY / 5);
			} else {
				el.scrollLeft += Math.ceil(data.pixelX / 5);
			}
		};

		const handleHeaderFooterMousewheel = (event, data) => {
			const { pixelX, pixelY } = data;
			if (Math.abs(pixelX) >= Math.abs(pixelY)) {
				bodyWrapper.value.scrollLeft += data.pixelX / 5;
			}
		};

		const bindEvents = () => {
			bodyWrapper.value.addEventListener('scroll', handleSyncPosition, { passive: true });
			if (props.fit) {
				Resize.on(instance.vnode.el, handleResize);
			}
		};

		const unbindEvents = () => {
			bodyWrapper.value.removeEventListener('scroll', handleSyncPosition, { passive: true });
			if (props.fit) {
				Resize.off(instance.vnode.el, handleResize);
			}
		};
		const debouncedUpdateLayout = debounce(() => refreshLayout(), 50);

		watch(
			() => props.height,
			(v) => {
				layout.setHeight(v);
			},
			{ immediate: true }
		);

		watch(
			() => props.maxHeight,
			(v) => {
				layout.setMaxHeight(v);
			},
			{ immediate: true }
		);

		watch(
			() => props.currentRowKey,
			(v) => {
				if (!props.rowKey) return;
				store.setCurrentRowKey(v);
			},
			{ immediate: true }
		);

		watch(
			() => props.dataSource,
			(v) => {
				store.commit('setData', v);
				isReady.value && nextTick(refreshLayout);
			},
			{ immediate: true }
		);

		watch(
			() => props.expandRowKeys,
			(v) => {
				if (v) {
					store.setExpandRowKeysAdapter(v);
				}
			},
			{ immediate: true }
		);

		onMounted(() => {
			bindEvents();
			store.updateColumns();
			refreshLayout();

			resizeState.value = {
				width: instance.vnode.el.offsetWidth,
				height: instance.vnode.el.offsetHeight
			};

			isReady.value = true;
		});

		onBeforeUnmount(() => {
			unbindEvents();
		});

		
		return {
			tableId: getUid('table'),
			isReady,
			store,
			layout,

			renderExpanded,
			resizeProxyVisible,
			resizeState,
			isGroup,
			scrollPosition,
			hoverState,

			// computed
			classes,
			shouldUpdateHeight,
			bodyWidth,
			bodyHeight,
			fixedBodyHeight,
			fixedHeight,
			states,

			// refs
			hiddenColumns,
			headerWrapper,
			tableHeader,
			bodyWrapper,
			emptyBlock,
			appendWrapper,
			footerWrapper,
			fixedWrapper,
			fixedHeaderWrapper,
			fixedTableHeader,
			fixedBodyWrapper,
			fixedFooterWrapper,
			rightFixedWrapper,
			rightFixedHeaderWrapper,
			rightFixedTableHeader,
			rightFixedBodyWrapper,
			rightFixedFooterWrapper,
			rightFixedPatch,
			resizeProxy,

			// methods
			debouncedUpdateLayout,
			handleHeaderFooterMousewheel,
			handleFixedMousewheel,
			handleMouseLeave,

			updateScrollY,
			refreshLayout,
			toggleAllSelection,
			setCurrentRow,
			toggleRowSelection,
			toggleRowExpansion,
			clearSelection
		};
	}
});
</script>
