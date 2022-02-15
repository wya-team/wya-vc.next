import { getCurrentInstance, computed, watch, ref, provide, onMounted, onUnmounted, nextTick } from 'vue'; 

import { Resize, getUid } from '../utils/index';

export default (options = {}) => {
	const instance = getCurrentInstance();
	const { props, emit } = instance;

	const tabsId = ref(getUid('tabs'));
	// tabs-children数据
	const list = ref([]);
	// tabs-nav-item底部宽度，偏移值
	const afloatWidth = ref(0);
	const afloatOffset = ref(0);
	// 当前的active
	const currentName = ref(undefined);
	// tabs-nav滚动偏移值
	const scrollOffset = ref(0);
	// 可滚动
	const scrollable = ref(false);
	// 给paging， 做判断使用 , TODO: v3移除
	const hasClick = ref(false);
	// 正在切换
	const timer = ref(null);

	const getTabIndex = (name) => {
		return list.value.findIndex((nav, index) => (nav.name || index) === name);
	};
	
	const afloatStyle = computed(() => {
		let style = {
			width: `${afloatWidth.value}px`
		};

		style.transform = `translate3d(${afloatOffset.value}px, 0px, 0px)`;

		return style;
	});

	const contentStyle = computed(() => {
		const index = getTabIndex(currentName.value);
		const precent = index === 0 ? '0%' : `-${index}00%`;

		let style = {};
		if (index > -1) {
			style.transform = `translate3d(${precent}, 0px, 0px)`;
		}
		return style;
	});

	const classes = computed(() => {
		return { 
			'is-animated': props.animated, 
			[`is-${props.type}`]: !!props.type,
			[`is-${props.theme}`]: !!props.theme,
		};
	});

	/**
	 * 下层值变化：刷新tabs
	 */
	const refresh = () => {
		options?.refreshAfloat?.();
	};

	const handleChange = (index) => {
		if (timer.value) return;

		timer.value = setTimeout(() => timer.value = null, 300);

		const nav = list.value[index];
		if (nav.disabled) return;

		currentName.value = nav.name || index;
		emit('change', currentName.value);
		emit('click', currentName.value);
		emit('update:modelValue', currentName.value);

		hasClick.value = true;
	};

	const handleResize = () => {
		if (instance.isUnmounted) return;
		options?.refreshScroll?.();
		options?.refreshAfloat?.();
	};

	onMounted(() => {
		Resize.on(options.wrapper.value, handleResize);
		options.scrollToActive && nextTick(options.scrollToActive);
	});

	onUnmounted(() => {
		Resize.off(options.wrapper.value, handleResize);
		timer.value && clearTimeout(timer.value);
	});

	const add = item => {
		if (!item) return;
		// vnode动态时排序
		nextTick(() => {
			typeof currentName.value === 'undefined' && (
				currentName.value = item.proxy.currentName || 0
			);

			if (options.content.value) {
				let index = Array
					.from(options.content.value.children)
					.filter(i => /vcm?-tabs-pane/.test(i.className))
					.indexOf(item.vnode.el);
				if (index != -1) {
					list.value.splice(index, 0, item.props);
					typeof currentName.value === 'undefined' && (
						item.proxy.currentName = index
					);
					return;
				}
			}

			list.value.push(item.props);
			typeof currentName.value === 'undefined' && (
				item.proxy.currentName = list.value.length - 1
			);
		});
	};

	// v-if时，currentName使用index顺序会错误（建议设置name值，否则可能造成问题
	const remove = item => {
		if (!item) return;
		list.value.splice(list.value.indexOf(item.props), 1);
	};

	provide('tabs', {
		props,
		currentName,
		refresh,
		add,
		remove
	});

	watch(
		() => props.modelValue,
		(v) => {
			currentName.value = v;
		},
		{ immediate: true }
	);

	watch(
		() => currentName.value,
		(v) => {
			options.refreshAfloat?.();
			options.scrollToActive?.();
		}
	);
	return {
		tabsId,
		list,
		timer,
		afloatWidth,
		afloatOffset,
		currentName,
		scrollOffset,
		scrollable,
		afloatStyle,
		contentStyle,
		classes,

		getTabIndex,
		handleChange
	};
};