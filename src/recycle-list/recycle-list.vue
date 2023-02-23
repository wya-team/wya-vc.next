<template>
	<div 
		ref="wrapper" 
		class="vc-recycle-list" 
		@scroll="handleScroll"
	>
		<vc-scroll-state v-if="inverted" ref="scrollState" />
		<div 
			ref="content"
			class="vc-recycle-list__content" 
			:style="{ height: contentH + 'px' }"
		>
			<div 
				v-for="(_, columnIndex) in cols"
				:key="columnIndex"
				:style="{ 
					width,
					paddingLeft: `${(columnIndex == 0 ? 0 : gutter) / 2}px`,
					paddingRight: `${columnIndex + 1 == cols ? 0 : gutter / 2}px`,
					transform: 'translate(0,' + (data[columnIndex][0]?.top || 0) + 'px)'
				}"
				:class="{ 'is-inverted': inverted }"
				class="vc-recycle-list__column"
			>
				<div v-if="inverted" :style="{ height: `${columnLevelH[columnIndex]}px` }" />
				<template
					v-for="(item) in data[columnIndex]"
					:key="item.id"
				>
					<div
						v-if="item.isPlaceholder && hasPlaceholder"
						:class="{ 'vc-recycle-list__transition': hasPlaceholder }"
						:style="{ opacity: +!item.loaded }"
					>
						<slot name="placeholder">
							<vc-customer 
								v-if="renderer.placeholder"
								:render="renderer.placeholder"
							/>
						</slot>
					</div>
					<vc-recycle-list-item
						v-if="!item.isPlaceholder"
						:ref="(v) => curloads[item.id] = v"
						:class="{ 'vc-recycle-list__transition': hasPlaceholder }"
						:style="{ opacity: item.loaded }"
						@resize="handleResize"
					>
						<slot :row="item.data" />
					</vc-recycle-list-item>
				</template>
			</div>
			<!-- preloads 以获取其高度，计算高度后将其移除 -->
			<div 
				class="vc-recycle-list__pool" 
			>
				<template 
					v-for="(item) in preData"
					:key="item.id"
				>
					<div
						:ref="(v) => preloads[item.id] = v"
						class="vc-recycle-list__hidden"
						:style="{ width }"
					>
						<slot :row="item.data" />
					</div>
				</template>
				
				<div ref="placeholder" class="vc-recycle-list__hidden">
					<slot name="placeholder">
						<vc-customer 
							v-if="renderer.placeholder"
							:render="renderer.placeholder"
						/>
					</slot>
				</div>
			</div>
		</div>
		<vc-scroll-state v-if="!inverted" ref="scrollState" />
	</div>
</template>

<script lang="ts">
import { 
	defineComponent,
	ref,
	computed,
	getCurrentInstance,
	onMounted,
	onBeforeUnmount,
	nextTick,
	watch
} from 'vue';
import { throttle } from 'lodash';
import { Resize } from '../utils/resize';
import { VcInstance } from '../vc';
import RecycleListItem from './recycle-list-item.vue';
import ScrollState from './scroll-state.vue';
import Customer from '../customer';

export default defineComponent({
	name: 'vc-recycle-list',
	components: {
		'vc-recycle-list-item': RecycleListItem,
		'vc-customer': Customer,
		'vc-scroll-state': ScrollState
	},
	props: {
		disabled: {
			type: Boolean,
			default: false
		},

		pageSize: {
			type: Number,
			default: 20
		},

		// 底部拉取更多数据的距离
		offset: {
			type: Number,
			default: 100
		},

		loadData: {
			type: Function,
			default: () => () => false
		},

		cols: {
			type: Number,
			default: 1
		},

		gutter: {
			type: Number,
			default: 0
		},

		inverted: {
			type: Boolean,
			default: false
		},

		renderEmpty: Function,
		renderFinish: Function,
		renderLoading: Function,
		renderPlaceholder: Function,
	},
	setup(props, { slots }) {
		const instance = getCurrentInstance();

		const contentH = ref(0);
		const columnLevelH = ref([]); // 优化inverted多列时用于补齐高度
		const firstItemIndex = ref(0);
		const loadings = ref([]);
		const isEnd = ref(false);
		const isMounted = ref(false);

		// el
		const curloads = ref({});
		const preloads = ref({});
		const placeholder = ref();
		const wrapper = ref();
		const content = ref();
		const scrollState = ref();

		// data
		const rebuildData = ref([]); // 封装后的数据，包含位置信息
		const rebuildDataIndexMap = ref({}); // 优化inverted下的find逻辑

		let originalData = []; // 原始数据
		let promiseStack = []; // 每页数据栈信息

		let originalScrollTop = 0; // 数据load前滚动条位置

		const width = computed(() => {
			if (props.cols === 1) return;
			if (props.gutter === 0) return `${100 / props.cols}%`;
			return `calc((100% - ${props.gutter * (props.cols - 1)}px) / ${props.cols})`;
		});

		// 用于展示的信息
		const data = computed(() => {
			const base = Array.from({ length: props.cols }).map(_ => []);
			return rebuildData.value
				.slice(
					Math.max(0, firstItemIndex.value - props.pageSize), 
					Math.min(rebuildData.value.length, firstItemIndex.value + props.pageSize)
				).reduce((pre, cur) => {
					cur.column >= 0 && pre[cur.column].push(cur);
					return pre;
				}, base);
		});

		const preData = computed(() => {
			return rebuildData.value.filter(i => {
				return i && !i.isPlaceholder && !i.height;
			});
		});

		const renderer = computed(() => {
			const globalProps = VcInstance.config?.RecycleList || {};
			return {
				placeholder: props.renderPlaceholder || globalProps.renderPlaceholder,
				loading: props.renderLoading || globalProps.renderLoading,
				finish: props.renderFinish || globalProps.renderFinish,
				empty: props.renderEmpty || globalProps.renderEmpty
			};
		});

		const hasPlaceholder = computed(() => {
			return !!slots.placeholder || renderer.value.placeholder;
		});

		const placeholderH = computed(() => {
			return hasPlaceholder.value ? placeholder.value.offsetHeight : 0;
		});

		const isLoading = computed(() => {
			return loadings.value.length;
		});

		const scrollTo = (options) => {
			let options$ = { x: 0, y: 0 };
			if (typeof options === 'number') {
				options$.y = options;
			} else if (typeof options === 'object') {
				options$ = Object.assign(options$, options);
			}

			const { el } = instance.vnode;
			let x = el.scrollLeft;
			let y = el.scrollTop;

			x !== options$.x && (el.scrollLeft = options$.x);
			y !== options$.y && (el.scrollTop = options$.y);
		};

		const scrollToIndex = (index, offset = 0) => {
			let item = rebuildData.value[index];
			item?.top && item.top >= 0 && scrollTo(item.top + offset);
		};

		const setRebuildDataMap = () => {
			if (!props.inverted) return;
			rebuildDataIndexMap.value = rebuildData.value.reduce((pre, cur, index) => {
				pre[cur.id] = index;
				return pre;
			}, {});
		};

		const setItemData = (index, $data) => {
			let node = {
				id: index,
				data: $data || {},
				height: 0,
				top: -1000,
				isPlaceholder: !$data,
				loaded: $data ? 1 : 0,

				// 在第几列渲染
				column: -1
			};
			if (!props.inverted) return (rebuildData.value[index] = node);

			let index$ = rebuildDataIndexMap.value[index];
			typeof index$ === 'undefined'
				? rebuildData.value.unshift(node)
				: (rebuildData.value[index$] = node);
		};
		// 更新item.height
		const refreshItemHeight = (index) => {
			let current = props.inverted 
				? rebuildData.value[rebuildDataIndexMap.value[index]]
				: rebuildData.value[index];	

			if (!current) return; // 受到`removeUnusedPlaceholders`影响，无效的会被回收

			let dom = preloads.value[index] || curloads.value[props.inverted ? index : index - firstItemIndex.value];
			if (dom) {
				current.height = dom.offsetHeight || placeholderH.value;
			} else if (current) {
				current.height = placeholderH.value;
			}
		};

		const refreshItemTop = () => {
			let height = Array.from({ length: props.cols }).map(_ => 0);
			let pre;
			let current;
			// 循环所有数据以更新item.top和总高度
			for (let i = 0; i < rebuildData.value.length; i++) {
				pre = rebuildData.value[i - 1];
				current = rebuildData.value[i];

				// TODO: minIndex挂入current
				if (rebuildData.value[i]) {
					let minIndex = height.indexOf(Math.min(...height));

					current.top = height[minIndex] || 0;
					current.column = minIndex;

					height[minIndex] += current.height;
				}
			}

			contentH.value = Math.max(...height);
			columnLevelH.value = height.map(i => contentH.value - i);
		};

		// 设置data首个元素的在originalData索引值
		const setFirstItemIndex = () => {
			let top = instance.vnode.el.scrollTop;
			let item;
			for (let i = 0; i < rebuildData.value.length; i++) {
				item = rebuildData.value[i];
				if (!item || item.top > top) {
					firstItemIndex.value = Math.max(0, i - props.cols);
					break;
				}
			}
		};

		const removeUnusedPlaceholders = (copy, page) => {
			let start = (page - 1) * props.pageSize;
			let end = page * props.pageSize;
			let cursor;
			if (!props.inverted) {
				for (cursor = start; cursor < end; cursor++) {
					if (copy[cursor]?.isPlaceholder) break;
				}
				rebuildData.value = copy.slice(0, cursor);
			} else {
				for (cursor = 0; cursor < end - start; cursor++) {
					if (!copy[cursor]?.isPlaceholder) break;
				}
				rebuildData.value = copy.slice(cursor);
			}
		};

		const stopScroll = (page) => {
			isEnd.value = true;
			removeUnusedPlaceholders(rebuildData.value.slice(0), page);
			refreshItemTop();
			setFirstItemIndex();
		};

		const refreshLayout = async (start, end) => {
			let promiseTasks = [];
			let item;
			for (let i = start; i < end; i++) {
				item = props.inverted 
					? rebuildData.value[rebuildDataIndexMap.value[i]]
					: rebuildData.value[i];	
				
				if (item && item.loaded) {
					continue; // eslint-disable-line
				}
				setItemData(i, originalData[i]);
				promiseTasks.push(nextTick(() => refreshItemHeight(i)));
			}
			
			await Promise.all(promiseTasks);

			refreshItemTop();
			setFirstItemIndex();
		};

		const refreshLayoutByPage = async (page) => {
			const { el } = instance.vnode;
			const start = (page - 1) * props.pageSize;
			const end = page * props.pageSize;
			const originalH = page === 1 ? 0 : contentH.value;
			await refreshLayout(start, end);

			if (!props.inverted) return;

			// 当偏移值只是新增加的高度, 提前滚动了则要显示之前的位置
			const changed = el.scrollTop !== originalScrollTop;
			const offset = page === 1 ? 0 : changed ? el.scrollTop : 0;
			scrollTo(contentH.value - originalH + offset);
		};

		const setOriginData = (page, res) => {
			const baseIndex = (page - 1) * props.pageSize;
			for (let i = 0; i < res.length; i++) {
				originalData[baseIndex + i] = res[i];
			}
		};

		const loadRemoteData = () => {
			const currentPage = promiseStack.length + 1;
			const promiseFetch = props.loadData(currentPage, props.pageSize);
			loadings.value.push('pending');
			promiseStack.push(promiseFetch);
			promiseFetch.then((res) => {
				loadings.value.pop();
				if (!res) {
					stopScroll(currentPage);
				} else {
					setOriginData(currentPage, res);
					refreshLayoutByPage(currentPage);

					if (res.length < props.pageSize) {
						stopScroll(currentPage);
					}
				}
			});
		};

		const loadData = async () => {
			if (props.disabled || isEnd.value) return;
			originalScrollTop = instance.vnode.el.scrollTop;
			if (hasPlaceholder.value) {
				let start;
				let end;
				if (props.inverted) {
					start = rebuildData.value.length;
					end = start + props.pageSize;

					Array
						.from({ length: props.pageSize })
						.forEach((_, index) => {
							setItemData(index + start);
						});
					setRebuildDataMap();
				} else {
					start = rebuildData.value.length;
					rebuildData.value.length += props.pageSize;
					end = rebuildData.value.length;
				}

				const originalH = contentH.value;
				await refreshLayout(start, end);
				props.inverted && scrollTo(contentH.value - originalH);
				loadRemoteData();
			} else if (!isLoading.value) {
				loadRemoteData();
			}
		};
		
		const reset = () => {
			rebuildData.value = [];
			rebuildDataIndexMap.value = {};
			contentH.value = 0;
			columnLevelH.value = [];
			firstItemIndex.value = 0;
			loadings.value = [];
			isEnd.value = false;

			originalData = [];
			promiseStack = [];

			instance.vnode.el.scrollTop = 0;
			loadData();
		};

		/**
		 * 最大滚动距离：el.scrollHeight - el.clientHeight
		 * contentH.value不含loading，以及wrapper的border, padding
		 */
		const handleScroll = (e) => {
			const { el } = instance.vnode;
			if (
				(!props.inverted && el.scrollTop > el.scrollHeight - el.clientHeight - props.offset)
				|| (props.inverted && el.scrollTop - props.offset <= 0)
			) {
				loadData();
			}
			
			setFirstItemIndex();
		};

		const forceRefreshLayout = async () => {
			rebuildData.value.forEach((item) => {
				item.loaded = 0;
			});
			await refreshLayout(0, rebuildData.value.length);
		};

		// 图片撑开时，会影响布局, 节流结束后调用
		const handleResize = throttle(async () => {
			const isNeedRefreshLayout = rebuildData.value.some(i => !i.isPlaceholder);
			
			if (isNeedRefreshLayout) {
				let oldFirstItemIndex = firstItemIndex.value;
				let oldTop = rebuildData.value[oldFirstItemIndex]?.top;

				await forceRefreshLayout();
				let newTop = rebuildData.value[oldFirstItemIndex]?.top;

				// 保持原来的位置
				const { el } = instance.vnode;
				el.scrollTop += newTop - oldTop;
			}
		}, 50, {
			leading: false,
			trailing: true
		});

		onMounted(() => {
			Resize.on(wrapper.value, handleResize);
			loadData();
			isMounted.value = true;
		});

		onBeforeUnmount(() => {
			Resize.off(wrapper.value, handleResize);
		});

		watch(
			() => props.disabled,
			(v, oldV) => {
				isMounted.value
					&& oldV === true 
					&& v === false
					&& loadData();
			}
		);

		watch(
			() => rebuildData.value.length,
			(v, oldV) => setRebuildDataMap()
		);

		return {
			// el
			wrapper,
			content,
			preloads,
			curloads,

			// ref
			rebuildData,
			contentH,
			columnLevelH,
			firstItemIndex,
			loadings,
			isEnd,
			placeholder,
			scrollState,

			// computed
			width,
			data,
			preData,
			placeholderH,
			hasPlaceholder,
			renderer,
			isLoading,

			// method
			handleScroll,
			handleResize,

			// expose
			reset,
			scrollTo,
			scrollToIndex,
			refreshLayout: forceRefreshLayout,
		};
	}
});

</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-recycle-list;

@include block($block) {
	position: relative;
	overflow-x: hidden;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;

	box-sizing: border-box;

	@include element(hidden) {
		width: 100%;
		box-sizing: border-box;

		position: absolute;
		top: -1000px;
		visibility: hidden;
	}

	@include element(transition) {
		opacity: 0;
		transition-property: opacity;
		transition-duration: .5s;
		width: 100%;
	}

	@include element(column) {
		display: inline-block; 
		box-sizing: border-box;
		width: 100%;
		vertical-align: top;
	}
}
</style>
