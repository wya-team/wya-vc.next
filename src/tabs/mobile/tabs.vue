<template>
	<div :class="classes" class="vcm-tabs">
		<div
			v-if="showWrapper"
			ref="wrapper"
			:style="[barStyle, fixedStyle]"
			:class="{ 'is-fixed': isFixed }"
			class="vcm-tabs__bar"
		>
			<slot name="prepend" />
			<div v-if="showStep && scrollable" class="vcm-tabs__step is-left" @click="handleStep(1)">
				<vcm-icon type="left" />
			</div>
			<div 
				ref="scroll"
				class="vcm-tabs__scroll"
			>
				<div ref="nav" :style="scrollStyle" class="vcm-tabs__nav">
					<div 
						v-if="showAfloat" 
						:style="afloatStyle" 
						class="vcm-tabs__afloat"
					/>
					<div
						v-for="(item, index) in list"
						:key="index"
						:data-id="item.name"
						:class="[{ 'is-active': (item.name || index) == currentName, 'is-average': average }]"
						class="vcm-tabs__item"
						@click="handleChange(index)"
					>
						<slot :it="item" :index="index" name="label">
							<span v-if="typeof item.label === 'string'" v-html="item.label" />
							<vc-customer
								v-else-if="typeof item.label === 'function'"
								:render="item.label"
								:it="item"
								:index="index"
							/>
						</slot>
					</div>
				</div>
			</div>
			<div v-if="showStep && scrollable" class="vcm-tabs__step is-right" @click="handleStep(-1)">
				<vcm-icon type="right" />
			</div>
			<slot name="append" />
		</div>
		<div v-if="isFixed" :style="{ height: `${placeholderH}px` }" class="vcm-tabs__placeholder" />
		<div ref="content" :style="contentStyle" class="vcm-tabs__content">
			<slot />
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance, ref, nextTick, computed, onUnmounted, onMounted, onUpdated, watch } from 'vue';
import { throttle, debounce } from 'lodash';
import TabsMixin from '../tabs-mixin';
import { Resize } from '../../utils/index';
import MIcon from '../../icon/index.m';
import Customer from '../../customer';
import useTabs from '../use-tabs';

export default defineComponent({
	name: 'vcm-tabs',
	components: {
		'vcm-icon': MIcon,
		'vc-customer': Customer,
	},
	mixins: [TabsMixin],
	props: {
		theme: {
			type: String,
			default: 'light',
			validator: v => /(light|dark)/.test(v)
		},
		barStyle: {
			type: [Object, Array],
			default: () => ({}),
		},
		autoAfloatWidth: {
			type: Boolean,
			default: true,
		},
		average: {
			type: Boolean,
			default: true
		},
		showWrapper: {
			type: Boolean,
			default: true
		},
		sticky: {
			type: Boolean,
			default: false
		},
		offsetTop: {
			type: Number,
			default: 0
		},
		showStep: {
			type: Boolean,
			default: false
		}
	},
	setup(props) {
		const instance = getCurrentInstance();
		const wrapper = ref(null);
		const content = ref(null);
		const scroll = ref(null);
		const nav = ref(null);

		const top = ref(0);
		const isFixed = ref(false);
		const placeholderH = ref(53);

		const startX = ref(0);

		const isTouching = ref(false);
		const scrollViewW = ref(0); // 滚动容器宽度
		const scrollContentW = ref(0); // 滚动内容宽度
		const baseX = ref(0);

		const isDark = computed(() => {
			return props.theme === 'dark';
		});

		const fixedStyle = computed(() => {
			return isFixed.value
				? { top: `${props.offsetTop}px` }
				: {};
		});

		let tabs;

		const handleScroll = throttle(() => {
			isFixed.value = document.scrollingElement.scrollTop + props.offsetTop > top.value;
		}, 100);

		const handleTouchstart = (event) => {
			isTouching.value = true;
			startX.value = event.touches[0].pageX;
			baseX.value = tabs.scrollOffset.value;
		};

		const handleTouchmove = throttle((event) => {
			const touchPageX = event.touches[0].pageX;
			// 与touchstart时触点位置的距离偏移值，大于0时为触点向右移，反之向左
			const changedX = touchPageX - startX.value;
			if (changedX > 0) {
				if (tabs.scrollOffset.value >= 0) {
					tabs.scrollOffset.value = 0;
					return;
				}
			} else if (Math.abs(tabs.scrollOffset.value) + scrollViewW.value >= scrollContentW.value) {
				tabs.scrollOffset.value = -(scrollContentW.value - scrollViewW.value);
				return;
			}
			tabs.scrollOffset.value = baseX.value + touchPageX - startX.value;
		}, 17);

		const handleTouchend = () => {
			isTouching.value = false;
			// TODO: 惯性滚动、回弹 （体验优化）
		};

		const handleStep = (flag) => {
			if (!tabs.scrollable.value) return;
			const moveX = flag * scrollViewW.value;
			let offsetX = tabs.scrollOffset.value + moveX;
			if (offsetX < -(scrollContentW.value - scrollViewW.value) || offsetX > 0) {
				offsetX = flag === -1 ? -(scrollContentW.value - scrollViewW.value) : 0;
			}
			tabs.scrollOffset.value = offsetX;
		};

		/**
		 * 使用Resize时, 切换页面失效，换种方案
		 */
		const refreshTop = debounce(() => {
			if (props.sticky) {
				top.value = content.value.offsetTop - placeholderH.value;
				isFixed.value = document.scrollingElement.scrollTop + props.offsetTop > top.value;
			}
		}, 250, { leading: true, trailing: true });

		/**
		 * 将选中的item滚动至可视区（尽量往中间靠）
		 */
		const scrollToActive = () => {
			if (!tabs.scrollable.value) return;
			const activeEl = instance.vnode.el.querySelector(`.vcm-tabs__item[data-id="${tabs.currentName.value}"]`);

			if (!activeEl) return;
			const contentEl = nav.value;

			const activeRect = activeEl.getBoundingClientRect();
			const viewRect = scroll.value.getBoundingClientRect();
			const contentRect = contentEl.getBoundingClientRect();
			
			let offset = 0;

			if (activeRect.width < viewRect.width) {
				// targetOffset为最理想的情况下，可以滚动到正中间，此时activeEl距scrollView的左右边距
				const targetOffset = (viewRect.width - activeRect.width) / 2;
				// offsetLeft其实等价于activeEl.offsetLeft，
				// 但是调试时发现这两个值在小数位会有差距，offsetLeft一直是整数，所以还是决定用下面这种方式计算offsetLeft
				const offsetLeft = activeRect.left - contentRect.left;
				if (offsetLeft - viewRect.left <= targetOffset) { // 左边距离不足以到正中间的情况
					offset = 0;
				} else if (contentRect.right - activeRect.right <= targetOffset) { // 右边距离不足以到正中间的情况
					offset = viewRect.width - contentRect.width; // 负值
				} else {
					offset = targetOffset - offsetLeft; // 可以滚动到正中间的理想情况
				}
			}
			tabs.scrollOffset.value = offset;
		};

		/**
		 * 处理是否需要滚动
		 */
		const refreshScroll = () => {
			const viewEl = scroll.value;
			scrollViewW.value = viewEl.offsetWidth;
			scrollContentW.value = nav.value.offsetWidth;
			if (scrollContentW.value > scrollViewW.value) {
				viewEl.addEventListener('touchstart', handleTouchstart, false);
				viewEl.addEventListener('touchmove', handleTouchmove, false);
				viewEl.addEventListener('touchend', handleTouchend, false);
				tabs.scrollable.value = true;
			} else if (tabs.scrollable.value) {
				viewEl.removeEventListener('touchstart', handleTouchstart, false);
				viewEl.removeEventListener('touchmove', handleTouchmove, false);
				viewEl.removeEventListener('touchend', handleTouchend, false);
				tabs.scrollable.value = false;
			}
			tabs.scrollable.value && scrollToActive();
		};

		/**
		 * 刷新当前标签底下的滑块位置
		 */
		const refreshAfloat = () => {
			if (!props.showWrapper) return;

			nextTick(() => {
				const index = tabs.getTabIndex(tabs.currentName.value);
				if (instance.isUnmounted) return;
				const items = nav.value.querySelectorAll(`.vcm-tabs__item`);

				const $ = items[index];

				// 暂时写死42
				tabs.afloatWidth.value = $
					? isDark.value
						? 20
						: props.autoAfloatWidth
							? $.querySelector('span').offsetWidth
							: $.offsetWidth
					: 0;

				if (!Array.from(items).length) return;
				let offset = 0;
				let basicOffset = $ ? ($.offsetWidth - tabs.afloatWidth.value) / 2 : 0;

				if (index > 0) {
					for (let i = 0; i < index; i++) {
						offset += parseFloat(items[i].offsetWidth);
					}
				}

				tabs.afloatOffset.value = offset + basicOffset;
				refreshScroll();
			});
		};

		/**
		 * TODO: 在height: 100%容器内滚动，让其带有粘性
		 */
		const operateDOMEvents = (type) => {
			if (!props.sticky) return;
			let fn = type === 'add' ? window.addEventListener : window.removeEventListener;
			fn('scroll', handleScroll);
		};

		tabs = useTabs({ 
			content,
			wrapper, 
			refreshAfloat, 
			refreshScroll, 
			scrollToActive
		});
		
		const scrollStyle = computed(() => {
			return {
				transition: isTouching.value ? '' : 'transform 300ms ease-in-out',
				transform: `translate3d(${tabs.scrollOffset.value}px, 0, 0)`
			};
		});

		onMounted(() => {
			refreshTop();
			operateDOMEvents('add');
			nextTick(refreshScroll);
		});

		onUpdated(refreshTop);

		onUnmounted(() => {
			operateDOMEvents('remove');
		});

		watch(
			() => props.theme,
			refreshAfloat
		);

		watch(
			() => props.average,
			refreshAfloat
		);

		watch(
			() => props.showStep,
			() => nextTick(refreshScroll)
		);

		return {
			wrapper,
			content,
			scroll,
			nav,

			top,
			isFixed,
			placeholderH,
			isTouching,
			scrollViewW,
			scrollContentW,
			baseX,

			scrollStyle,
			fixedStyle,
			isDark,

			handleStep,

			...tabs
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-tabs) {
	width: 100%;
	overflow: hidden;
	@include element(step) {
		width: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
		@include when(left) {
			box-shadow: 1px 0 5px 1px #eee;
		}
		@include when(right) {
			box-shadow: -1px 0 5px 1px #eee;
		}
	}
	@include element(bar) {
		overflow: hidden;
		margin-bottom: 8px;
		display: flex;
		align-items: stretch;
		position: relative;
		@include when(fixed) {
			position: fixed;
			width: 100%;
			z-index: 999;
			// box-shadow: 0px -5px 5px 5px #999;
		}
	}
	/**
	 * 这里的设计，存在问题，要做到少时自动撑开，多是滚动
	 * TODO: 用js方式实现;
	 */
	@include element(scroll) {
		white-space: nowrap;
		overflow: hidden;
		// -webkit-overflow-scrolling: touch;
		width: 100%;
	}
	@include element(nav) {
		position: relative;
		display: flex;
		width: fit-content;
		min-width: 100%;
	}
	@include element(item) {
		position: relative;
		text-align: center;
		transition: color .3s ease-in-out;
		font-size: 15px;
		line-height: 1;
		padding: 15px 10px;
		@include when(average) {
			flex: 1;
		}
	}

	@include element(afloat) {
		height: 2px;
		box-sizing: border-box;
		position: absolute;
		left: 0;
		z-index: 1;

	}
	@include element(content) {
		display: flex;
		flex-direction: row;
	}
	@include when(animated) {
		@include element(afloat) {
			transition: transform .3s ease-in-out;
			transform-origin: 0 0;
		}
		@include element(content) {
			will-change: transform;
			transition: transform .3s cubic-bezier(.35, 0, .25, 1);
		}
	}

	@include when(light) {
		@include element(bar) {
			background: white;
		}
		@include element(item) {
			color: #666;
			@include when(active) {
				color: #000;
			}
		}
		@include element(afloat) {
			background-color: #000;
			bottom: 0;
		}
	}

	@include when(dark) {
		@include element(bar) {
			background: #333;
		}
		@include element(item) {
			color: #E7C083;
			@include when(active) {
				color: #E7C083;
			}
		}
		@include element(afloat) {
			background-color: #E7C083;
			bottom: 6px;
			border-radius: 2px;
		}
		@include element(step) {
			color: #E7C083;
			@include when(left) {
				box-shadow: 1px 0 5px 1px #242421;
			}
			@include when(right) {
				box-shadow: -1px 0 5px 1px #242421;
			}
		}
	}
}
</style>
