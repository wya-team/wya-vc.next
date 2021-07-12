<template>
	<div :class="classes" class="vcm-popup">
		<vcm-transtion-fade>
			<div
				v-show="mask && isActive"
				class="vcm-popup__mask"
				@click="handleClose(maskClosable)"
				@touchmove.prevent
			/>
		</vcm-transtion-fade>
		<component :is="animateComponent" :mode="mode" @after-leave="handleRemove">
			<div
				v-show="isActive"
				:style="[{ position: fixed ? 'fixed' : 'absolute' }, wrapperStyle]"
				:class="wrapperClassName"
				class="vcm-popup__wrapper"
			>
				<slot />
			</div>
		</component>
	</div>
</template>
<script lang="ts">
import { defineComponent, watch, ref, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { DOM } from '@wya/utils';
import MTransition from '../../transition/index.m';
import { placement2mode, eleInRegExp } from '../../utils';
import { useScrollbar } from '../../hooks';

export default defineComponent({
	name: "vcm-popup",
	components: {
		'vcm-transtion-fade': MTransition.Fade,
		'vcm-transtion-slide': MTransition.Slide,
	},
	props: {
		fixed: {
			type: Boolean,
			default: true
		},
		modelValue: {
			type: Boolean,
			default: false
		},
		mask: {
			type: Boolean,
			default: true
		},
		maskClosable: {
			type: Boolean,
			default: true
		},
		placement: {
			type: String,
			default: 'bottom',
			validator: v => /(bottom|top|left|right|center)/.test(v)
		},
		theme: {
			type: String,
			default: 'light',
			validator: v => /(light|dark|none)/.test(v)
		},
		wrapperClassName: [Object, Array, String],
		wrapperStyle: [Object, Array, String],
		scrollRegExp: {
			type: Object,
			default: (v) => ({ 
				className: /(vc-hack-scroll|scroll-container)/ 
			})
		}
	},
	emits: [
		'update:modelValue',
		'close',
		'portal-fulfilled',
		'visible-change'
	],
	setup(props, context) {
		const { slots, emit } = context;
		const instance = getCurrentInstance();
		const isActive = ref(false);
		const classes = computed(() => {
			return {
				[`is-${props.placement}`]: true,
				[`is-${props.theme}`]: true,
			};
		});

		const mode = computed(() => {
			return placement2mode[props.placement];
		});

		const animateComponent = computed(() => {
			return props.placement === 'center' 
				? 'vcm-transtion-fade' 
				: 'vcm-transtion-slide';
		});

		watch(
			() => props.modelValue, 
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		/**
		 * 立即执行关闭操作，内部主动触发
		 */
		const handleClose = (allow = true) => {
			if (allow) {
				isActive.value = false;
			}
		};

		/**
		 * 动画执行后关闭
		 * 同时close兼容portal设计
		 */
		const handleRemove = () => {
			!instance.isUnmounted && (
				emit('close'),
				emit('portal-fulfilled'),
				emit('visible-change', false),
				emit('update:modelValue', false)
			);
		};

		let startY;
		let scrollContainer;
		const handleTouchStart = (e) => {
			if (isActive.value) {
				startY = e.touches[0].pageY;
			}
		};

		const handleTouchMove = (e) => {
			// 显示状态下才处理滑动
			if (!isActive.value) return;
			let path = e.path || DOM.composedPath(e) || [];
			let inContainer = path.some((ele) => {
				if (eleInRegExp(ele, props.scrollRegExp)) {
					scrollContainer = ele;
					return true;
				}
				return false;
			});
			// 容器外的滑动禁止
			if (!inContainer) { e.preventDefault(); return; }
			
			const moveY = e.touches[0].pageY;
			const top = scrollContainer.scrollTop;
			const ch = scrollContainer.clientHeight;
			const sh = scrollContainer.scrollHeight;
			if ((top === 0 && moveY > startY) || (top + ch === sh && moveY < startY)) {
				// 到底或到头都禁止
				e.preventDefault();
			}
		};

		const operateDOMEvents = (type) => {
			let fn = type === 'add' ? document.addEventListener : document.removeEventListener;
			fn('touchstart', handleTouchStart);
			fn('touchmove', handleTouchMove, { passive: false }); // 是否会使用preventDefault()，false表示使用
		};

		onMounted(() => operateDOMEvents('add'));
		onBeforeUnmount(() => operateDOMEvents('remove'));

		return {
			isActive,
			classes,
			mode,
			animateComponent,
			handleRemove,
			handleClose,
			handleTouchStart,
			handleTouchMove
		};
	}
});

</script>
<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-popup) {
	@include element(mask) {
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
		z-index: 1000;
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

	@include when(center) {
		@include element(wrapper) {
			top: 50%;
			left: 50%;
			transform: translate3d(-50%, -50%, 0);
		}
	}

	@include when(fixed) {
		@include element(wrapper) {
			position: fixed;
		}
	}
	@include when(dark) {
		@include element(wrapper) {
			background: rgba(0, 0, 0, .3);
			color: #fff;
		}
	}
	@include when(light) {
		@include element(wrapper) {
			background-color: #fff;
		}
	}
}


	
</style>
