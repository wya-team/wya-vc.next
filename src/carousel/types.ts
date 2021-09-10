// @file 含该组件内所有类型定义

import type { ComponentInternalInstance, ComputedRef, Ref, UnwrapRef } from 'vue';

// carousel-item.props
export interface CarouselItemProps {
	name: string;
	label: string | number;
	width: string | number;
	gutter: number;
	scale: number;
}

// use-carousel-item.ts
export interface CarouselItemData {
	translate: Ref<number>;
	isHover: Ref<boolean>;
	isActive: Ref<boolean>;
	isReady: Ref<boolean>;
	isInStage: Ref<boolean>;
	isAnimating: Ref<boolean>;
	reset: AnyFunction;
}

interface OverwriteCarouselItem {
	props: CarouselItemProps;
	proxy: UnwrapRef<CarouselItemData>
}

export type CarouselItemInstance = OverwriteCarouselItem & ComponentInternalInstance;

// carousel.props
export interface CarouselProps extends Options {
	t: number;
	card: boolean;
	gutter: number;
	height: string | number;
	initialIndex: number;
	trigger: string;
	autoplay: boolean;
	// bottom/outside | false
	dots: string | boolean;
	// hover/always | false
	arrow: boolean;
	loop: boolean;
	vertical: boolean;
	draggable: boolean;

	// mobile
	indicator?: boolean;
}

// use-carousel.ts
export interface CarouselData {
	carouselId: Ref<string>;
	allowTransition: Ref<boolean>;
	items: Ref<CarouselItemInstance[]>;
	activeIndex: Ref<number>;
	offset: Ref<number>;
	direction: ComputedRef<string>;
	hasLabel: ComputedRef<boolean>;
	dotsClasses: ComputedRef<string[]>;

	start: Ref<boolean>;
	startX: Ref<number>;
	startY: Ref<number>;

	handleStart: AnyFunction;
	handleMove: AnyFunction;
	handleEnd: AnyFunction;
	handleDotClick: AnyFunction;

	prev: AnyFunction;
	next: AnyFunction;
	setActiveItem: AnyFunction;
	pauseTimer: AnyFunction;
	startTimer: AnyFunction;
}


interface OverwriteCarousel {
	props: CarouselProps;
	proxy: UnwrapRef<CarouselData>
}

export type CarouselInstance = OverwriteCarousel & ComponentInternalInstance

export interface CarouselInject extends Options {
	props: CarouselProps;
	add: (instance: ComponentInternalInstance) => void;
	remove: (instance: ComponentInternalInstance) => void;
}
