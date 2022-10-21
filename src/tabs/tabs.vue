<template>
	<div :class="classes" class="vc-tabs">
		<div class="vc-tabs__extra">
			<slot name="extra" />
		</div>
		<div ref="wrapper" :style="{ padding: scrollable && '0 24px' }" class="vc-tabs__bar">
			<vc-icon v-if="scrollable" class="vc-tabs__icon is-left" type="left" @click="handlePrev" />
			<vc-icon v-if="scrollable" class="vc-tabs__icon is-right" type="right" @click="handleNext" />

			<div ref="scroll" class="vc-tabs__scroll">
				<div ref="nav" :style="scrollStyle" class="vc-tabs__nav">
					<div 
						v-if="!isCard" 
						:style="afloatStyle" 
						class="vc-tabs__afloat"
					/>
					<div 
						v-for="(item, index) in list"
						:key="index"
						:class="[{ 'is-active': (item.name || index) == currentName }]"
						class="vc-tabs__item"
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
						<!-- TODO -->
						<vc-icon v-if="closable && item.closable" type="close" />
					</div>
				</div>
			</div>
		</div>
		<div 
			ref="content"
			:style="contentStyle" 
			class="vc-tabs__content"
		>
			<slot />
		</div>
	</div>
</template>
<script lang="ts">
import { getCurrentInstance, defineComponent, ref, watch, computed, nextTick } from 'vue';
import TabsMixin from './tabs-mixin';
import Icon from '../icon';
import Customer from '../customer';
import useTabs from './use-tabs';

export default defineComponent({
	name: 'vc-tabs',
	components: {
		'vc-icon': Icon,
		'vc-customer': Customer,
	},
	mixins: [TabsMixin],
	props: {
		type: {
			type: String,
			validator: v => /^(line|card)$/.test(v),
			default: 'line'
		},
		closable: {
			type: Boolean,
			default: false
		},
	},
	setup(props, context) {
		const instance = getCurrentInstance();
		const wrapper = ref(null);
		const content = ref(null);
		const scroll = ref(null);
		const nav = ref(null);
		let tabs;

		/**
		 * 刷新是否需要滚动条
		 */
		const refreshScroll = () => {
			// 容器
			const boxWidth = scroll.value.offsetWidth;
			// 总长度
			const totalWidth = nav.value.offsetWidth;

			if (boxWidth < totalWidth) {
				tabs.scrollable.value = true;
				(totalWidth - tabs.scrollOffset.value < boxWidth) && (
					tabs.scrollOffset.value = totalWidth - boxWidth
				);
			} else {
				tabs.scrollable.value = false;
				tabs.scrollOffset.value > 0 && (tabs.scrollOffset.value = 0);
			}
		};

		/**
		 * 刷新当前标签底下的滑块位置
		 */
		const refreshAfloat = () => {
			nextTick(() => {
				const index = tabs.getTabIndex(tabs.currentName.value);
				if (instance.isUnmounted) return;
				const items = nav.value.querySelectorAll(`.vc-tabs__item`);
				
				const $ = items[index];

				tabs.afloatWidth.value = $ ? parseFloat($.offsetWidth) : 0;

				if (!Array.from(items).length) return;
				let offset = 0;
				if (index > 0) {
					const gutter = 16; // margin-right -> 16px
					for (let i = 0; i < index; i++) {
						offset += parseFloat(items[i].offsetWidth) + gutter;
					}
				}

				tabs.afloatOffset.value = offset;

				refreshScroll();
			});
		};

		const scrollToActive = () => {
			if (!tabs.scrollable.value) return;
			// 这里不直接选择is-active,存在延迟
			const $ = instance.vnode.el.querySelector(`.vc-tabs__item[name="${tabs.currentName.value}"]`);

			if (!$) return;

			const itemBounding = $.getBoundingClientRect();
			const scrollBounding = scroll.value.getBoundingClientRect();
			const navBounding = nav.value.getBoundingClientRect();

			let offset;

			if (navBounding.right < scrollBounding.right) {
				offset = nav.value.offsetWidth - scrollBounding.width;
			}

			if (itemBounding.left < scrollBounding.left) {
				offset = tabs.scrollOffset.value - (scrollBounding.left - itemBounding.left);
			} else if (itemBounding.right > scrollBounding.right) {
				offset = tabs.scrollOffset.value + itemBounding.right - scrollBounding.right;
			}

			if (tabs.scrollOffset.value !== offset) {
				tabs.scrollOffset.value = offset;
			}
		};

		tabs = useTabs({ 
			content,
			wrapper, 
			refreshAfloat, 
			refreshScroll, 
			scrollToActive
		});
		/**
		 * 上一个
		 */
		const handlePrev = () => {
			const boxWidth = scroll.value.offsetWidth;

			if (!tabs.scrollOffset.value) return;

			tabs.scrollOffset.value = tabs.scrollOffset.value > boxWidth
				? tabs.scrollOffset.value - boxWidth
				: 0;
		};

		/**
		 * 下一个
		 */
		const handleNext = () => {
			const boxWidth = scroll.value.offsetWidth;
			const totalWidth = nav.value.offsetWidth;

			if (totalWidth - tabs.scrollOffset.value <= boxWidth) return;

			tabs.scrollOffset.value = totalWidth - tabs.scrollOffset.value > boxWidth * 2
				? tabs.scrollOffset.value + boxWidth
				: (totalWidth - boxWidth);
		};

		
		const scrollStyle = computed(() => {
			let style = {};
			
			style.transform = `translate3d(${-tabs.scrollOffset.value}px, 0px, 0px)`;
			return style;
		});

		const isCard = computed(() => {
			return props.type === 'card';
		});

		return {
			tabs,
			wrapper,
			content,
			scroll,
			nav,
			scrollStyle,
			isCard,
			...tabs,

			handlePrev,
			handleNext
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-tabs) {
	@include element(bar) {
		margin-bottom: 16px;
		display: flex;
		align-items: center;
		position: relative;
		// 不用添加背景色
	}
	@include element(extra) {
		float: right;
		line-height: 34px;
	}
	@include element(scroll) {
		overflow: hidden;
		white-space: nowrap;
	}
	@include element(nav) {
		position: relative;
		display: inline-block;
		transition: transform .5s ease-in-out;
	}
	
	@include element(afloat) {
		height: 2px;
		box-sizing: border-box;
		background-color: #5495f6;
		position: absolute;
		left: 0;
		bottom: 0;
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
	@include element(icon) {
		position: absolute;
		line-height: 28px;
		cursor: pointer;
		@include when(left) {
			left: 0;
		}
		@include when(right) {
			right: 0;
		}
	}

	@include when(line) {
		@include element(bar){
			@include commonBorder1PX(bottom);
		}
		@include element(item) {
			display: inline-block;
			padding: 8px 16px;
			margin-right: 16px;
			box-sizing: border-box;
			cursor: pointer;
			text-decoration: none;
			position: relative;
			transition: color .3s ease-in-out;
			@include when(active) {
				color: #5495f6;
			}
			&:hover {
				color: #5495f6;
			};
		};
	}
	@include when(card) {
		@include element(item) {
			display: inline-block;
			cursor: pointer;
			height: 32px;
			line-height: 30px;
			padding: 0 16px;
			border-bottom: 0;
			transition: all .3s ease-in-out;
			background: #fff;
			border: 1px solid #d9d9d9;
			margin-right: -1px; 
			position: relative;
			z-index: 1;
			&:first-child {
				border-top-left-radius: 4px;
				border-bottom-left-radius: 4px
			}
			&:last-child {
				border-top-right-radius: 4px;
				border-bottom-right-radius: 4px;
				margin-right: 0; 
			}
			@include when(active) {
				color: #5495f6;
				border: 1px solid #5495f6;
				z-index: 2;
			}
			&:hover {
				color: #5495f6;
			}
		}
	}
}
</style>
