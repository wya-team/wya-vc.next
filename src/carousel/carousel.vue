<template>
	<div
		:class="`is-${direction}`"
		class="vc-carousel"
		@mousedown.prevent.stop="handleStart"
		@mousemove.prevent.stop="handleMove"
		@mouseup.prevent.stop="handleEnd"
		@mouseenter.stop="handleMouseEnter"
		@mouseleave.stop="handleMouseLeave"
	>
		<div
			ref="wrapper"
			:style="{ height: height ? `${height}px` : 'auto' }"
			class="vc-carousel__wrapper"
		>
			<vc-transition-slide
				v-if="arrowDisplay"
				mode="left-part"
			>
				<button
					v-show="(arrow === 'always' || isHover) && (loop || activeIndex > 0)"
					type="button"
					class="vc-carousel__arrow is-left-arrow"
					@mouseenter="handleButtonEnter('left')"
					@mouseleave="handleButtonLeave"
					@click.stop="throttledArrowClick(activeIndex - 1)"
				>
					<vc-icon type="left" />
				</button>
			</vc-transition-slide>
			<vc-transition-slide
				v-if="arrowDisplay"
				mode="right-part"
			>
				<button
					v-show="(arrow === 'always' || isHover) && (loop || activeIndex < items.length - 1)"
					type="button"
					class="vc-carousel__arrow is-right-arrow"
					@mouseenter="handleButtonEnter('right')"
					@mouseleave="handleButtonLeave"
					@click.stop="throttledArrowClick(activeIndex + 1)"
				>
					<vc-icon type="right" />
				</button>
			</vc-transition-slide>
			<slot />
		</div>
		<ul
			v-if="dots"
			:class="dotsClasses"
			class="vc-carousel__dots"
		>
			<li
				v-for="(item, index) in items"
				:key="index"
				:class="[
					'vc-carousel__dot',
					'is-' + direction,
					{ 'is-active': index === activeIndex }
				]"
				@mouseenter="throttledDotHover(index)"
				@click.stop="handleDotClick(index)"
			>
				<button class="vc-carousel__button">
					<span v-if="hasLabel">{{ item.label }}</span>
				</button>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { throttle } from 'lodash';
import Icon from '../icon';
import Transition from '../transition';
import CarouselMixin from './carousel-mixin';
import useCarousel from './use-carousel';

export default {
	name: 'vc-carousel',
	components: {
		'vc-icon': Icon,
		'vc-transition-slide': Transition.Slide
	},
	mixins: [CarouselMixin],
	setup(props, context) {
		const isHover = ref(false);
		const wrapper = ref(null);
		const arrowDisplay = computed(() => {
			return props.arrow && !props.vertical;
		});

		const carousel = useCarousel(wrapper);
		const itemInStage = (item, index, items) => {
			const length = items.length;
			if ((index === length - 1 && item.isInStage && items[0].isActive)
				|| (item.isInStage && items[index + 1] && items[index + 1].isActive)
			) {
				return 'left';
			} else if ((index === 0 && item.isInStage && items[length - 1].isActive)
				|| (item.isInStage && items[index - 1] && items[index - 1].isActive)) {
				return 'right';
			}
			return false;
		};

		const handleButtonEnter = (arrow) => {
			if (props.vertical) return;
			carousel.items.value.forEach((item, index, items) => {
				if (arrow === itemInStage(item, index, items)) {
					item.proxy.isHover = true;
				}
			});
		};

		const handleButtonLeave = () => {
			if (props.vertical) return;
			carousel.items.value.forEach(item => {
				item.proxy.isHover = false;
			});
		};

		const handleDotHover = (index) => {
			if (props.trigger === 'hover' && index !== carousel.activeIndex.value) {
				carousel.activeIndex.value = index;
			}
		};

		const handleMouseEnter = () => {
			isHover.value = true;
			carousel.pauseTimer();
		};

		const handleMouseLeave = () => {
			isHover.value = false;
			carousel.startTimer();
		};

		const throttledArrowClick = throttle((index) => carousel.setActiveItem(index));
		const throttledDotHover = throttle((index) => carousel.setActiveItem(index));

		return {
			wrapper,
			isHover,
			arrowDisplay,
			...carousel,
			throttledArrowClick,
			throttledDotHover,
			
			handleButtonEnter,
			handleButtonLeave,
			handleMouseEnter,
			handleMouseLeave
		};
	}
	
};
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-carousel) {
	position: relative;

	@include when(horizontal) {
		overflow-x: hidden;
	}

	@include when(vertical) {
		overflow-y: hidden;
	}

	@include element(wrapper) {
		position: relative;
		height: 300px;
	}

	@include element(arrow) {
		border: none;
		outline: none;
		padding: 0;
		margin: 0;
		height: 36px;
		width: 36px;
		cursor: pointer;
		transition: .3s;
		border-radius: 50%;
		background-color: rgba(31, 45, 61, 0.11);
		color: #fff;
		position: absolute;
		top: 50%;
		z-index: 10;
		margin-top: -18px; 
		text-align: center;
		font-size: 12px;

		@include when(left-arrow) {
			left: 16px;
		}

		@include when(right-arrow) {
			right: 16px;
		}

		&:hover {
			background-color: rgba(31, 45, 61, 0.23);
		}
	}

	@include element(dots) {
		position: absolute;
		list-style: none;
		margin: 0;
		padding: 0;
		z-index: 2;

		@include when(horizontal) {
			bottom: 0;
			width: 100%;
			display: flex;
			justify-content: center;
			flex-wrap: wrap;
		}

		@include when(vertical) {
			right: 0;
			top: 0;
			height: 100%;
			display: flex;
			flex-direction: column;
			justify-content: center;
			flex-wrap: wrap;
		}

		@include when(outside) {
			bottom: 26px;
			text-align: center;
			position: static;
			transform: none;
			.vc-carousel__dot:hover button {
				opacity: 0.64;
			}
			button {
				background-color: #C0C4CC;
				opacity: 0.24;
			}
		}

		@include when(labels) {
			left: 0;
			right: 0;
			transform: none;
			text-align: center;

			.vc-carousel__button {
				height: auto;
				width: auto;
				padding: 2px 18px;
				font-size: 12px;
			}

			.vc-carousel__dot {
				padding: 6px 4px;
			}
		}
	}

	@include element(dot) {
		background-color: transparent;
		cursor: pointer;

		&:hover button {
			opacity: 0.72;
		}

		@include when(horizontal) {
			display: inline-block;
			padding: 12px 4px;
		}

		@include when(vertical) {
			padding: 4px 12px;
			.vc-carousel__button {
				width: 2px;
				height: 15px;
			}
		}

		@include when(active) {
			button {
				opacity: 1;
			}
		}
	}

	@include element(button) {
		display: block;
		opacity: 0.48;
		width: 30px;
		height: 2px;
		background-color: #fff;
		border: none;
		outline: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
		transition: .3s;
	}
}
</style>
