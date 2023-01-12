<template>
	<div 
		ref="wrapper" 
		class="vc-recycle-list" 
		@scroll="handleScroll"
	>
		<div 
			ref="content"
			class="vc-recycle-list__content" 
			:style="{ height: contentH + 'px' }"
		>
			<div
				v-for="(item) in data"
				:key="item.id"
				class="vc-recycle-list__item"
				:style="{ transform: 'translate(0,' + item.top + 'px)' }"
			>
				<div
					v-if="hasPlaceholder"
					:class="{ 'vc-recycle-list__transition': hasPlaceholder }"
					:style="{ opacity: +!item.loaded }"
				>
					<slot name="placeholder" />
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
			</div>

			<!-- preloads 以获取其高度，计算高度后将其移除 -->
			<div class="vc-recycle-list__pool">
				<template 
					v-for="(item) in preData"
					:key="item.id"
				>
					<div
						:ref="(v) => preloads[item.id] = v"
						class="vc-recycle-list__item is-hidden"
					>
						<slot :row="item.data" />
					</div>
				</template>
				
				<div ref="placeholder" class="vc-recycle-list__item is-hidden">
					<slot name="placeholder" />
				</div>
			</div>
		</div>
		<div
			v-if="!hasPlaceholder && !isEnd"
			class="vc-recycle-list__loading"
			:style="{ visibility: isLoading ? 'visible' : 'hidden' }"
		>
			<slot name="loading">
				<div class="vc-recycle-list__center">
					<vc-spin :size="20" />
				</div>
			</slot>
		</div>

		<div v-show="isEnd" class="vc-recycle-list__finish">
			<slot name="finish">
				<div class="vc-recycle-list__center">
					已全部加载
				</div>
			</slot>
		</div>
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
import RecycleListItem from './recycle-list-item.vue';
import Spin from '../spin';

export default defineComponent({
	name: 'vc-recycle-list',
	components: {
		'vc-recycle-list-item': RecycleListItem,
		'vc-spin': Spin
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
		}
	},
	setup(props, { slots }) {
		const instance = getCurrentInstance();

		const contentH = ref(0);
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

		// data
		const rebuildData = ref([]); // 封装后的数据，包含位置信息
		let originalData = []; // 原始数据
		let promiseStack = []; // 每页数据栈信息

		// 用于展示的信息
		const data = computed(() => {
			return rebuildData.value.slice(
				Math.max(0, firstItemIndex.value - props.pageSize), 
				Math.min(rebuildData.value.length, firstItemIndex.value + props.pageSize)
			);
		});

		const preData = computed(() => {
			return rebuildData.value.filter(i => {
				return i && !i.isPlaceholder && !i.height;
			});
		});

		const hasPlaceholder = computed(() => {
			return !!slots.placeholder;
		});

		const placeholderH = computed(() => {
			return hasPlaceholder.value ? placeholder.value.offsetHeight : 0;
		});

		const isLoading = computed(() => {
			return loadings.value.length;
		});

		const setItemData = (index, $data) => {
			rebuildData.value[index] = {
				id: index,
				data: $data || {},
				height: 0,
				top: -1000,
				isPlaceholder: !$data,
				loaded: $data ? 1 : 0
			};
		};
		// 更新item.height
		const refreshItemHeight = (index) => {
			let current = rebuildData.value[index];
			let dom = preloads.value[index] || curloads.value[index - firstItemIndex.value];
			if (dom) {
				current.height = dom.offsetHeight || placeholderH.value;
			} else if (current) {
				current.height = placeholderH.value;
			}
		};

		const refreshItemTop = () => {
			let height = 0;
			let pre;
			let current;
			// 循环所有数据以更新item.top和总高度
			for (let i = 0; i < rebuildData.value.length; i++) {
				pre = rebuildData.value[i - 1];
				current = rebuildData.value[i];
				if (!rebuildData.value[i]) {
					height += 0;
				} else {
					current.top = pre ? pre.top + pre.height : 0;
					height += current.height;
				}
			}
			contentH.value = height;
		};

		// 设置data首个元素的在originalData索引值
		const setFirstItemIndex = () => {
			let top = instance.vnode.el.scrollTop;
			let item;
			for (let i = 0; i < rebuildData.value.length; i++) {
				item = rebuildData.value[i];
				if (!item || item.top > top) {
					firstItemIndex.value = Math.max(0, i - 1);
					break;
				}
			}
		};

		const removeUnusedPlaceholders = (copy, page) => {
			let cursor;
			let start = (page - 1) * props.pageSize;
			let end = page * props.pageSize;
			for (cursor = start; cursor < end; cursor++) {
				if (copy[cursor] && copy[cursor].isPlaceholder) break;
			}
			rebuildData.value = copy.slice(0, cursor);
		};

		const stopScroll = (page) => {
			isEnd.value = true;
			removeUnusedPlaceholders(rebuildData.value.slice(0), page);
			refreshItemTop();
			setFirstItemIndex();
		};

		const refreshLayout = (start, end) => {
			let promiseTasks = [];
			let item;
			for (let i = start; i < end; i++) {
				item = rebuildData.value[i];
				if (item && item.loaded) {
					continue; // eslint-disable-line
				}
				setItemData(i, originalData[i]);
				promiseTasks.push(nextTick().then(() => {
					refreshItemHeight(i);
				}));
			}
			
			Promise.all(promiseTasks).then(() => {
				refreshItemTop();
				setFirstItemIndex();
			});
		};

		const refreshLayoutByPage = (page) => {
			const start = (page - 1) * props.pageSize;
			const end = page * props.pageSize;
			refreshLayout(start, end);
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

		const loadData = () => {
			if (props.disabled || isEnd.value) return;
			if (hasPlaceholder.value) {
				const start = rebuildData.value.length;
				rebuildData.value.length += props.pageSize;
				const end = rebuildData.value.length;
				refreshLayout(start, end);
				loadRemoteData();
			} else if (!isLoading.value) {
				loadRemoteData();
			}
		};
		
		const reset = () => {
			rebuildData.value = [];
			contentH.value = 0;
			firstItemIndex.value = 0;
			loadings.value = [];
			isEnd.value = false;

			originalData = [];
			promiseStack = [];

			instance.vnode.el.scrollTop = 0;
			loadData();
		};

		const handleScroll = () => {
			const { el } = instance.vnode;
			if (el.scrollTop + el.offsetHeight > contentH.value - props.offset) {
				loadData();
			}
			setFirstItemIndex();
		};

		const forceRefreshLayout = () => {
			rebuildData.value.forEach((item) => {
				item.loaded = 0;
			});
			refreshLayout(0, rebuildData.value.length);
		};

		// 图片撑开时，会影响布局, 节流结束后调用
		const handleResize = throttle(() => {
			const isNeedRefreshLayout = rebuildData.value.some(i => !i.isPlaceholder);

			isNeedRefreshLayout && forceRefreshLayout();
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

		return {
			// el
			wrapper,
			content,
			preloads,
			curloads,

			// ref
			rebuildData,
			contentH,
			firstItemIndex,
			loadings,
			isEnd,
			placeholder,

			// computed
			data,
			preData,
			placeholderH,
			hasPlaceholder,
			isLoading,

			// method
			handleScroll,
			handleResize,

			// expose
			reset,
			refreshLayout: forceRefreshLayout
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

	@include element(item) {
		width: 100%;
		position: absolute;
		box-sizing: border-box;
		@include when(hidden) {
			top: -1000px;
			visibility: hidden;
		}
	}

	@include element(transition) {
		position: absolute;
		opacity: 0;
		transition-property: opacity;
		transition-duration: .5s;
		width: 100%;
	}

	@include element(center) {
		text-align: center;
	}

	@include element(loading) {
		margin: 10px auto;
		display: flex;
		justify-content: center;
	}
}
</style>
