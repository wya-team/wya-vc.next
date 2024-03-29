<template>
	<div
		:class="`is-${direction}`"
		class="vcm-carousel"
		@touchstart.stop="handleTouchStart"
		@touchmove.stop="handleTouchMove"
		@touchend.stop="handleTouchEnd"
	>
		<div
			ref="wrapper"
			:style="{ height: height ? `${height}px` : 'auto' }"
			class="vcm-carousel__wrapper"
		>
			<slot />
		</div>
		<ul
			v-if="dots"
			:class="dotsClasses"
			class="vcm-carousel__dots"
		>
			<li
				v-for="(item, index) in items"
				:key="index"
				:class="[
					'vcm-carousel__dot',
					'is-' + direction,
					{ 'is-active': index === activeIndex }
				]"
				@click.stop="handleDotClick(index)"
			>
				<button class="vcm-carousel__button">
					<span v-if="hasLabel">{{ item.label }}</span>
				</button>
			</li>
		</ul>
		<div v-if="!card && indicator" class="vcm-carousel__indicator">
			{{ activeIndex + 1 }} / {{ items.length }}
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import type { Ref } from 'vue';
import CarouselMixin from '../carousel-mixin';
import useCarousel from '../use-carousel';
import type { CarouselData } from '../types';

export default defineComponent({
	name: 'vcm-carousel',
	mixins: [CarouselMixin],
	props: {
		dots: {
			type: [String, Boolean],
			default: false // bottom/outside | false
		},
		indicator: {
			type: Boolean,
			default: true
		}
	},
	setup(props) {
		const wrapper: Ref<Nullable<HTMLElement>> = ref(null);
		const carousel: CarouselData = useCarousel(wrapper);
		/**
		 * 0：未滚动
		 * 1：页面滚动
		 * 2：轮播滚动
		 */
		let scrollStatus = 0;

		const handleTouchStart = (e: TouchEvent) => {
			carousel.handleStart(e.touches[0]);
			scrollStatus = 0;
		};

		const handleTouchMove = (e: TouchEvent) => {
			let absX = Math.abs(e.touches[0].screenX - carousel.startX.value);
			let absY = Math.abs(e.touches[0].screenY - carousel.startY.value);

			if (!props.vertical && absX > absY && scrollStatus != 1) {
				e.preventDefault();
				carousel.handleMove(e.touches[0]);
				scrollStatus = 2;
				return;
			} else if (props.vertical && absY > absX) { // loop下为false,可以考虑触底
				e.preventDefault();
				carousel.handleMove(e.touches[0]);
				return;
			} else if (scrollStatus === 0) {
				scrollStatus = 1;
			}
		};

		const handleTouchEnd = (e: TouchEvent) => {
			carousel.handleEnd(e.changedTouches[0]);
			scrollStatus = 0;
		};

		return {
			wrapper,
			...carousel,
			handleTouchStart,
			handleTouchMove,
			handleTouchEnd
		};

	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-carousel) {
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
			.vcm-carousel__dot:hover button {
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

			.vcm-carousel__button {
				height: auto;
				width: auto;
				padding: 2px 18px;
				font-size: 12px;
			}

			.vcm-carousel__dot {
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
			.vcm-carousel__button {
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
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: #fff;
		border: none;
		outline: none;
		padding: 0;
		margin: 0 2px;
		cursor: pointer;
		transition: .3s;
	}
	@include element(indicator) {
		position: absolute;
		right: 10px;
		bottom: 10px;
		z-index: 2;
		background: rgba(0, 0, 0, .7);
		color: white;
		border-radius: 10px;	
		height: 20px;
		line-height: 20px;
		padding: 0 10px;
	}
}
</style>
