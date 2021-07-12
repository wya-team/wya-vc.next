import { getCurrentInstance, cpmputed, ref, watch, computed, onBeforeMount, onBeforeUnmount, inject } from 'vue';
import { TRANSFORM } from '../utils';
import { VcError } from '../vc/index';
import { getInstance } from '../hooks';

export default () => {
	const instance = getCurrentInstance();
	const carousel = inject('carousel', {});

	const { props, emit } = instance;
	const translate = ref(0);
	const currentScale = ref(1);
	const isHover = ref(false);
	const isActive = ref(false);
	const isReady = ref(false);
	const isInStage = ref(false);
	const isAnimating = ref(false);

	const isVertical = computed(() => {
		return carousel.props.vertical;
	});

	const isCard = computed(() => {
		return carousel.props.card;
	});

	const isMove = computed(() => {
		return carousel.offset.value !== 0;
	});

	const itemGutter = computed(() => {
		return props.gutter || carousel.props.gutter || 0;
	});

	const itemStyle = computed(() => {
		const translateType = isVertical.value ? 'translateY' : 'translateX';
		if (carousel.props.card) {
			return {
				[TRANSFORM]: `${translateType}(${translate.value}px) scale(${currentScale.value})`,
				width: props.width
			};
		} else {
			// 只有当设置了gutter, width才能生效, 且宽度要>50%，否则会失效
			return {
				[TRANSFORM]: `${translateType}(${translate.value}px) scale(${currentScale.value})`,
				width: itemGutter.value ? props.width : '100%'
			};
		}
	});

	onBeforeMount(() => {
		carousel.add?.(instance);

		// 检查语法
		if (
			!isCard.value 
			&& itemGutter.value 
			&& carousel.props.loop
		) {
			throw new VcError('carousel', 'slide模式下loop不能为true');
		}
	});

	onBeforeUnmount(() => {
		carousel.remove?.(instance);
	});

	const processIndex = (index, activeIndex, length) => {
		if (activeIndex === 0 && index === length - 1) {
			return -1;
		} else if (activeIndex === length - 1 && index === 0) {
			return length;
		} else if (index < activeIndex - 1 && activeIndex - index >= length / 2) {
			return length + 1;
		} else if (index > activeIndex + 1 && index - activeIndex >= length / 2) {
			return -2;
		}
		return index;
	};

	const calcCardTranslate = (index, activeIndex) => {
		let value;
		let widthNumber = parseFloat(props.width) / 100;
		const parentW = carousel.vnode.el.offsetWidth;
		// 修改了计算公式
		if (isInStage.value) {
			if (index === activeIndex) {
				value = parentW * (1 - widthNumber) / 2;
			} else if (index > activeIndex) {
				value = parentW * (1 + widthNumber * props.scale) / 2 + itemGutter.value;
			} else {
				value = -(parentW * ((widthNumber * props.scale - 1) / 2 + widthNumber)) - itemGutter.value;
			}
		} else if (index < activeIndex) {
			value = parentW * (1 - widthNumber) / 2;
		} else {
			value = parentW * (1 - widthNumber) / 2;
		}
		return value;
	};

	/**
	 * 暂不考虑宽度 < 50% 的情况
	 * 如果考虑，需要判断-2的情况，更小则还要判断-3的情况
	 */
	const calcSlideOffset = (index, activeIndex, wrapperWidth) => {
		const { length } = carousel.items.value;
		const offset = wrapperWidth - instance.vnode.el.offsetWidth;
		const gutter = itemGutter.value; 

		if (!gutter || isVertical.value) return 0;
			
		let slideOffset = 0;

		// 居中
		if (length === 1) {
			return offset / 2;
		}

		// 头
		if (activeIndex == 0) {
			if (index - activeIndex === 0) {
				slideOffset = gutter;
			} else if (index - activeIndex === 1) {
				slideOffset = -offset + gutter * 2;
			}
		}

		// 中
		if (activeIndex !== 0 && activeIndex != length - 1) {
			if (index - activeIndex === 0) {
				slideOffset = offset / 2;
			} else if (index - activeIndex === 1) {
				slideOffset = -offset / 2 + gutter;
			} else if (index - activeIndex === -1) {
				slideOffset = offset * 3 / 2 - gutter;
			}
		}

		// 尾
		if (activeIndex == length - 1) {
			if (index - activeIndex === 0) {
				slideOffset = offset - gutter;
			} else if (index - activeIndex === -1) {
				slideOffset = offset * 2 - gutter * 2;
			}
		}

		return slideOffset;
	};

	const calcTranslate = (index, activeIndex) => {
		const distance = carousel.vnode.el[isVertical.value ? 'offsetHeight' : 'offsetWidth'];
		const slideOffset = calcSlideOffset(index, activeIndex, distance);

		return distance * (index - activeIndex) + carousel.offset.value + slideOffset;
	};

	const reset = (index, activeIndex, oldIndex) => {
		const { length } = carousel.items.value;
		if (
			carousel.allowTransition.value 
			&& !isCard.value 
			&& oldIndex !== undefined
		) {
			isAnimating.value = index === activeIndex || index === oldIndex;
			// 如果有边距且没有设置动画，前后需要添加动画
			if (!isVertical.value
				&& !isAnimating.value 
				&& itemGutter.value
				&& (index - activeIndex === 1 || index - activeIndex === -1)
			) {
				isAnimating.value = true;
			}
		}
		if (index !== activeIndex && length > 2 && carousel.props.loop) {
			index = processIndex(index, activeIndex, length);
		}
		if (isCard.value) {
			if (isVertical.value) {
				throw new VcError('carousel', '卡片模式不支持垂直方向');
			}
			isInStage.value = Math.round(Math.abs(index - activeIndex)) <= 1;
			isActive.value = index === activeIndex;
			translate.value = calcCardTranslate(index, activeIndex);
			currentScale.value = isActive.value ? 1 : props.scale;
		} else {
			isActive.value = index === activeIndex;
			translate.value = calcTranslate(index, activeIndex);
		}

		isReady.value = true;
	};

	const handleItemClick = () => {
		if (parent && isCard.value) {
			const index = carousel.items.value.indexOf(instance);
			carousel.setActiveItem(index);
		}
	};


	return {
		translate,
		currentScale,
		isHover,
		isActive,
		isReady,
		isInStage,
		isAnimating,
		isVertical,
		isCard,
		isMove,
		itemGutter,
		itemStyle,

		reset,
		handleItemClick
	};
};