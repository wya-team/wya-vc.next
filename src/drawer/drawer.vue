<template>
	<div :class="classes" class="vc-drawer">
		<vc-transition-fade :delay=".05">
			<div 
				v-show="mask && isActive"
				:style="maskStyle"
				class="vc-drawer__mask"
				@click="handleClose($event, maskClosable)"
			/>
		</vc-transition-fade>
		<vc-transition-slide :mode="mode" @after-leave="handleRemove">
			<div 
				v-show="isActive" 
				:class="wrapperClassName"
				:style="[style, wrapperStyle]"
				class="vc-drawer__wrapper"
			>
				<div ref="header" class="vc-drawer__header">
					<slot name="header">
						<p class="vc-drawer__title" v-html="title || '我是标题' " />
					</slot>
					<a class="vc-drawer__close" @click="handleClose($event, true)">
						<vc-icon type="close" />
					</a>
				</div>
				<slot />
			</div>
		</vc-transition-slide>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, computed, watch, getCurrentInstance } from 'vue';
import Icon from '../icon';
import Button from '../button';
import Transition from '../transition';
import { placement2mode } from '../utils';
import { useScrollbar } from '../hooks';

let drawerNumber = 0;
export default defineComponent({
	name: "vc-drawer",
	components: {
		'vc-icon': Icon,
		'vc-transition-fade': Transition.Fade,
		'vc-transition-slide': Transition.Slide,
	},
	props: {
		title: String,
		modelValue: {
			type: Boolean,
			default: false
		},
		width: {
			type: Number,
			default: 300
		},
		height: {
			type: Number,
			default: 300
		},
		mask: {
			type: Boolean,
			default: true
		},
		maskClosable: {
			type: Boolean,
			default: true
		},
		scrollable: {
			type: Boolean,
			default: false
		},
		placement: {
			type: String,
			default: 'right' // top/right/left/bottom
		},
		maskStyle: Object,
		wrapperClassName: [Object, Array, String],
		wrapperStyle: [Object, Array, String]
	},
	setup(props, context) {
		const { emit } = context;
		const instance = getCurrentInstance();
		const isActive = ref(false);

		const classes = computed(() => {
			return {
				[`is-${props.placement}`]: true,
			};
		});
		const style = computed(() => {
			return props.placement === 'top' || props.placement === 'bottom'
				? { height: `${props.height}px` }
				: { width: `${props.width}px` };
		});
		const mode = computed(() => {
			return placement2mode[props.placement];
		});

		watch(
			() => props.modelValue,
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		/**
		 * 关闭事件
		 */
		const handleClose = (e, closable) => {
			if (closable 
				|| (
					props.maskClosable 
					&& e.target.classList.contains('vc-drawer__wrapper')
				)
			) {
				isActive.value = false;
			}
		};

		/**
		 * 动画执行后关闭, 关闭事件都会被执行
		 * visible-change 由移除之后触发
		 * 同时close兼容portal设计
		 */
		const handleRemove = () => {
			!instance.isUnmounted && (
				emit('close'),
				emit('update:modelValue', false),
				emit('visible-change', false)
			);
		};

		return {
			isActive,
			classes,
			style,
			mode,
			handleClose,
			handleRemove
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-drawer;

@include block($block) {
	@include element(mask){
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		background-color: rgba(0, 0, 0, .4);
		height: 100%;
		z-index: 1000;
	}
	@include element(wrapper) {
		position: fixed;
		z-index: 1000;
		background-color: #fff;
		box-shadow: 0 4px 12px rgba(0,0,0,.15);
	}
	@include when(bottom) {
		@include element(wrapper) {
			right: 0;
			left: 0;
			bottom: 0;
			// padding-bottom: env(safe-area-inset-bottom);
		}
	}

	@include when(top) {
		@include element(wrapper) {
			right: 0;
			left: 0;
			top: 0;
			// padding-top: env(safe-area-inset-bottom);
		}
	}
	@include when(left) {
		@include element(wrapper) {
			top: 0;
			bottom: 0;
			left: 0;
		}
	}

	@include when(right) {
		@include element(wrapper) {
			top: 0;
			bottom: 0;
			right: 0;
		}
	}
	@include element(header) {
		position: relative;
		border-bottom: 1px solid #e8eaec;
		padding: 14px 16px;
		line-height: 1;
		font-size: 14px;
	}
	@include element(close) {
		position: absolute;
		top: 12px;
		right: 16px;
		color: #999;
	}	
}
</style>