import { getCurrentInstance, provide, ref, watch, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import type { Ref } from 'vue';
import { VcError } from '../vc/index';
import { Resize, getUid } from '../utils';
import type { CarouselItemInstance, CarouselInstance } from './types';

export default (wrapper: Ref<Nullable<HTMLElement>>) => {
	const instance = getCurrentInstance() as CarouselInstance;
	const { props, emit } = instance;
	const items: Ref<CarouselItemInstance[]> = ref([]);
	const activeIndex = ref(-1);
	const timer: Ref<Nullable<TimeoutHandle>> = ref(null);
	const offset = ref(0);
	const carouselId = ref(getUid('carousel'));

	const start = ref();
	const startX = ref();
	const startY = ref();

	// 主要给slide滑动时1和-1添加转场动画
	const allowTransition = ref(false);

	const direction = computed(() => {
		return props.vertical ? 'vertical' : 'horizontal';
	});

	const hasLabel = computed(() => {
		return items.value.some(item => (item.props as any).label.toString().length > 0);
	});

	const dotsClasses = computed(() => {
		const classes = ['is-' + direction.value];
		if (hasLabel.value) {
			classes.push('is-labels');
		}
		if (props.dots === 'outside' || props.card) {
			classes.push('is-outside');
		}
		return classes;
	});

	const resetItems = (oldIndex?: number) => {
		items.value.forEach((item, index) => {
			item.proxy?.reset?.(index, activeIndex.value, oldIndex);
		});
	};

	const playSlides = () => {
		allowTransition.value = true;
		if (activeIndex.value < items.value.length - 1) {
			activeIndex.value++;
		} else if (props.loop) {
			activeIndex.value = 0;
		}
	};

	const pauseTimer = () => {
		if (timer.value) {
			clearInterval(timer.value);
			timer.value = null;
		}
	};

	const startTimer = () => {
		if (props.t <= 0 || !props.autoplay || timer.value) return;
		timer.value = setInterval(playSlides, props.t * 1000);
	};

	const setActiveItem = (index: number | string) => {
		if (typeof index === 'string') {
			const filteredItems = items.value.filter(item => item.props.name === index);
			if (filteredItems.length > 0) {
				index = items.value.indexOf(filteredItems[0]);
			}
		}
		index = Number(index);
		if (isNaN(index) || index !== Math.floor(index)) {
			throw new VcError('carousel', '索引必须是整数');
		}
		let length = items.value.length;
		const oldIndex = activeIndex.value;
		if (index < 0) {
			activeIndex.value = props.loop ? length - 1 : 0;
		} else if (index >= length) {
			activeIndex.value = props.loop ? 0 : length - 1;
		} else {
			activeIndex.value = index;
		}
		if (oldIndex === activeIndex.value) {
			resetItems(oldIndex);
		}
	};

	const prev = () => {
		setActiveItem(activeIndex.value - 1);
	};

	const next = () => {
		setActiveItem(activeIndex.value + 1);
	};

	const handleDotClick = (index: number) => {
		activeIndex.value = index;
	};

	const handleStart = (e: MouseEvent) => {
		allowTransition.value = true;

		if (!props.draggable) return;
		pauseTimer();

		start.value = true;
		startX.value = e.screenX;
		startY.value = e.screenY;
	};

	const handleMove = (e: MouseEvent) => {
		if (!start.value || !props.draggable) return;
		offset.value = !props.vertical 
			? (e.screenX - startX.value) 
			: (e.screenY - startY.value);

		resetItems();
	};

	const handleEnd = () => {
		if (!props.draggable) return;

		start.value = false;
		startTimer();
		const $offset = Math.abs(offset.value);
		const $direction = offset.value > 0;
		offset.value = 0;
		if ($offset > 5) {
			$direction && prev();
			!$direction && next();
		} else {
			resetItems();
		}
	};

	watch(
		() => items.value,
		(v) => {
			if (v.length > 0) setActiveItem(props.initialIndex);
		}
	);

	watch(
		() => activeIndex.value,
		(v, oldV) => {
			resetItems(oldV);
			emit('change', v, oldV);
		}
	);

	watch(
		() => props.autoplay,
		(v) => {
			v ? startTimer() : pauseTimer();
		}
	);

	watch(
		() => props.loop,
		() => {
			setActiveItem(activeIndex.value);
		}
	);

	watch(
		() => props.t,
		() => {
			pauseTimer();
			startTimer();
		}
	);

	onMounted(() => {
		nextTick(() => {
			if (instance.vnode.el) Resize.on(instance.vnode.el, resetItems);
			if (props.initialIndex < items.value.length && props.initialIndex >= 0) {
				activeIndex.value = props.initialIndex;
			}
			startTimer();
		});
	});

	onBeforeUnmount(() => {
		if (instance.vnode.el) Resize.off(instance.vnode.el, resetItems);
		pauseTimer();
		startTimer();
	});


	const add = (item: CarouselItemInstance) => {
		if (!item) return;
		// vnode动态时排序
		nextTick(() => {
			if (wrapper.value) {
				let index = Array
					.from(wrapper.value.children)
					.filter(i => /vcm?-carousel-item/.test(i.className))
					.indexOf(item.vnode.el as any);
				items.value.splice(index, 0, item);
				return;
			}
			items.value.push(item);
		});
	};

	const remove = (item: CarouselItemInstance) => {
		if (!item) return;
		items.value.splice(items.value.indexOf(item), 1);
	};

	provide('carousel', {
		props,
		items,
		offset,
		allowTransition,
		vnode: instance.vnode, 

		setActiveItem,
		add,
		remove
	});

	return {
		carouselId,
		allowTransition,
		items,
		activeIndex,
		offset,
		direction,
		hasLabel,
		dotsClasses,

		start,
		startX,
		startY,

		handleStart,
		handleMove,
		handleEnd,
		handleDotClick,

		prev,
		next,
		setActiveItem,
		pauseTimer,
		startTimer
	};
};