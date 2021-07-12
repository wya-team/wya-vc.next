<template>
	<vc-transition-scale 
		:mode="animation || 'part'" 
		:duration="{ enter: 0.3, leave: 0.15 }"
		@after-leave="handleRemove"
	>
		<div 
			v-show="isActive"
			:style="[wrapperStyle, wrapperW, portalStyle]"
			:class="[wrapperClasses, portalClassName]"
			class="vc-popover-core" 
			@mouseenter="hover && handleChange($event, { visible: true })"
			@mouseleave="hover && handleChange($event, { visible: false })"
		>
			<div :class="themeClasses" class="vc-popover-core__container">
				<div 
					v-if="arrow" 
					:style="arrowStyle"
					:class="[themeClasses, posClasses]"
					class="vc-popover-core__arrow"
				/>
				<slot v-if="$slots.content" name="content" />
				<vc-customer v-else-if="typeof content === 'function'" :render="content" />
				<div v-else v-html="content" />
			</div>
		</div>
	</vc-transition-scale>
</template>

<script lang="ts">
import { 
	defineComponent,
	getCurrentInstance,
	watch,
	ref,
	computed,
	onMounted,
	nextTick,
	onUnmounted 
} from 'vue';
import usePos from './use-pos';
import Portal from '../portal/index';
import Transition from '../transition/index';
import Customer from '../customer/index';
import { VcError } from '../vc/index';
import { Resize } from '../utils/index';
import { IS_SERVER } from '../utils/constant';

const wrapperComponent = defineComponent({
	name: 'vc-popover-core',
	components: {
		'vc-customer': Customer,
		'vc-transition-scale': Transition.Scale,
	},
	props: {
		modelValue: Boolean,
		animation: Transition.Scale.props.mode,
		placement: {
			type: String,
			default: 'bottom',
			validator: (value) => {
				return [
					'bottom', 'bottom-left', 'bottom-right',
					'top', 'top-left', 'top-right',
					'right', 'right-top', 'right-bottom',
					'left', 'left-top', 'left-bottom'
				].includes(value);
			}
		},
		theme: {
			type: String,
			default: 'light',
			validator: v => /(light|dark|none)/.test(v)
		},
		content: [String, Function],
		getPopupContainer: Function,
		portal: {
			type: Boolean,
			default: true
		},
		arrow: { // 是否显示箭头
			type: Boolean,
			default: true
		},
		autoWidth: { // 同宽
			type: Boolean,
			default: false
		},
		triggerEl: {
			type: IS_SERVER ? Object : HTMLElement,
			required: true
		},
		onChange: {
			type: Function,
			default: () => {}
		},
		onReady: Function,
		// 直接传送门标记调用时，hover需要绑定事件
		alone: {
			type: Boolean,
			default: false
		},
		hover: Boolean,
		always: Boolean,
		portalClassName: [Object, String, Array],
		portalStyle: Object
	},
	emits: ['portal-fulfilled', 'close'],
	/**
	 * instance.ctx.$el与instance.vnode.el
	 */
	setup(props, context) {
		const { emit, slots } = context;
		const {
			getYAssistFitPos,
			getXAssistFitPos,
			getPopupStyle,
			getFitPos,
			getRect
		} = usePos();
		const instance = getCurrentInstance();
		const { ctx } = instance;
		const isActive = ref(false);
		const wrapperStyle = ref({});
		const arrowStyle = ref({});
		const fitPos = ref(props.placement);
		const wrapperW = ref({ width: 'auto' });

		const themeClasses = computed(() => {
			return {
				'is-light': /light/.test(props.theme),
				'is-dark': /dark/.test(props.theme),
			};
		});

		const wrapperClasses = computed(() => {
			return {
				'is-top': props.arrow && /top/.test(fitPos.value),
				'is-right': props.arrow && /right/.test(fitPos.value),
				'is-bottom': props.arrow && /bottom/.test(fitPos.value),
				'is-left': props.arrow && /left/.test(fitPos.value),
			};
		});

		const posClasses = computed(() => {
			return {
				[`is-${fitPos.value.split('-')[0]}-basic`]: true,
				[`is-${fitPos.value}`]: true
			};
		});

		/**
		 * hack
		 * 外层高度没有撑开时
		 */
		const getHackContainer = () => {
			let container = props.triggerEl;
			try {
				if (
					slots.content 
					&& props.triggerEl.children.length === 1
				) {
					let hackEl = props.triggerEl.children[0];
					let slotHeight = hackEl.getBoundingClientRect().height;
					let parentHeight = props.triggerEl.getBoundingClientRect().height;
					if (slotHeight > parentHeight) {
						container = hackEl;
					}
				}
				return container;
			} catch (e) {
				return container;
			}
		};

		const setPopupStyle = () => {
			if (!ctx.$el) return;

			const triggerEl = getHackContainer();

			const { portal, getPopupContainer } = props;

			let rect = getRect({
				portal,
				triggerEl,
				el: ctx.$el,
				hasContainer: !!getPopupContainer
			});

			let result = getFitPos({
				rect,
				triggerEl,
				el: ctx.$el,
				placement: props.placement
			});


			let { wrapperStyle: $wrapperStyle, arrowStyle: $arrowStyle } = getPopupStyle({
				rect,
				triggerEl,
				el: ctx.$el,
				placement: result
			});

			fitPos.value = result;
			wrapperStyle.value = $wrapperStyle;
			arrowStyle.value = $arrowStyle;

			/**
			 * 自适应高度
			 */
			if (!props.autoWidth) return;
			wrapperW.value = {
				width: `${triggerEl.getBoundingClientRect().width}px`
			};
		};

		let timer;
		const handleTriggerChange = (e) => {
			let visible = e.type === 'mouseenter';

			timer && clearTimeout(timer);
			timer = setTimeout(() => {
				isActive.value = visible;
				props.onChange(e, { visible, context: instance });
			}, 200);
		};

		const handleClick = (e) => {
			props.alone && (isActive.value = false);
			props.onChange(e, { context: instance });
		};

		const handleChange = (e, { visible }) => {
			props.alone && handleTriggerChange(e);
			!props.alone && props.onChange(e, { visible, context: instance });
		};

		/**
		 * 弹层【宽度】变化后的自适应，主要服务于Cascader等内容会变化的下拉框
		 */
		const handleWrapperResize = () => {
			let direction = props.placement.split('-');

			let left = parseFloat(wrapperStyle.value.left);
			switch (direction[0]) {
				case 'top':
				case 'bottom':
					if (left + ctx.$el.offsetWidth >= window.innerWidth) {
						wrapperStyle.value = {
							...wrapperStyle.value,
							left: `${window.innerWidth - ctx.$el.offsetWidth}px`
						};
					} else {
						setPopupStyle();
					}
					break;
				default:
					break;
			}

		};

		/**
		 * 动画执行后关闭
		 * 同时close兼容portal设计
		 */
		const handleRemove = () => {
			!instance.isUnmounted && (
				emit('portal-fulfilled'),
				emit('close')
			);
		};

		/**
		 * for alone, 方法直接调用
		 */
		const bindEvents = () => {
			props.triggerEl.addEventListener('mouseenter', handleTriggerChange);
			props.triggerEl.addEventListener('mouseleave', handleTriggerChange);
		};
		const removeEvents = () => {
			props.triggerEl.removeEventListener('mouseenter', handleTriggerChange);
			props.triggerEl.removeEventListener('mouseleave', handleTriggerChange);
		};

		props.alone && props.hover && bindEvents();

		onMounted(() => {
			isActive.value = true;
			nextTick(() => {
				setPopupStyle();
			});

			// 捕获阶段执行
			!props.hover && document.addEventListener('click', handleClick, true);
			// 监听body的滚动
			document.addEventListener('scroll', setPopupStyle);
			// 监听触发节点的Resize
			Resize.on(props.triggerEl, setPopupStyle);
			// 监听弹层的Resize
			Resize.on(ctx.$el, handleWrapperResize);

			props.onReady && props.onReady();
		});

		onUnmounted(() => {
			!props.hover && document.removeEventListener('click', handleClick, true);
			document.removeEventListener('scroll', setPopupStyle);
			Resize.off(props.triggerEl, setPopupStyle);
			Resize.off(ctx.$el, handleWrapperResize);

			props.alone && props.hover && removeEvents();
		});

		return {
			isActive,
			arrowStyle,
			wrapperStyle,
			wrapperW,
			wrapperClasses,
			themeClasses,
			posClasses,
			handleRemove,
			handleChange
		};
	}
});

export default wrapperComponent;
export const Func = new Portal(wrapperComponent, {
	promise: false,
	// multiple: true
});
</script>

<style lang="scss">
@import '../style/vars.scss';

@include block(vc-popover-core) {
	position: absolute;
	transition: top .02s linear, left .02s linear;
	z-index: $popup-zindex;
	@include when(top) {
		padding-bottom: 8px;
	}
	@include when(bottom) {
		padding-top: 8px;
	}
	@include when(right) {
		padding-left: 8px;
	}
	@include when(left) {
		padding-right: 8px;
	}
	@include element(container) {
		padding: 5px 12px;
		border-radius: 4px;
		box-shadow: $border-shadow;
		@include when(dark) {
			color: $white;
			background-color: $dark-bg-color;
		}
		@include when(light) {
			background-color: $white;
		}
	}
	@include when(padding-none) {
		& > .vc-popover-core__container {
			padding: 0;
		}
	}
	@include element(arrow) {
		background: transparent;
		width: 9px;
		height: 9px;
		transform: rotate(45deg);
		position: absolute;
		display: block;
		border-width: 4px;
		border-style: solid;
		border-color: transparent;
		@include when(top-basic) {
			bottom: 4px;
			box-shadow: 3px 3px 7px rgba(0, 0, 0, 0.07);
			border-top-color: transparent;
			border-left-color: transparent;
			@include when(light) {
				border-right-color: $white;
				border-bottom-color: $white;
			}
			@include when(dark) {
				border-right-color: $dark-bg-color;
				border-bottom-color: $dark-bg-color;
			}
		}
		@include when(top) {
			left: 50%;
			transform: translateX(-50%) rotate(45deg);
		}
		@include when(top-left) {
			left: 16px;
		}
		@include when(top-right) {
			right: 16px;
		}

		@include when(bottom-basic) {
			top: 4px;
			box-shadow: -2px -2px 5px rgba(0, 0, 0, 0.06);
			border-right-color: transparent;
			border-bottom-color: transparent;
			@include when(light) {
				border-top-color: $white;
				border-left-color: $white;
			}
			@include when(dark) {
				border-top-color: $dark-bg-color;
				border-left-color: $dark-bg-color;
			}
			
		}
		@include when(bottom) {
			left: 50%;
			transform: translateX(-50%) rotate(45deg);
		}
		@include when(bottom-left) {
			left: 16px;
		}
		@include when(bottom-right) {
			right: 16px;
		}

		@include when(right-basic) {
			left: 4px;
			box-shadow: -3px 3px 7px rgba(0, 0, 0, 0.07);
			border-top-color: transparent;
			border-right-color: transparent;

			@include when(light) {
				border-bottom-color: $white;
				border-left-color: $white;
			}
			@include when(dark) {
				border-bottom-color: $dark-bg-color;
				border-left-color: $dark-bg-color;
			}
		}

		@include when(left) {
			top: 50%;
			transform: translateY(-50%) rotate(45deg);
		}

		@include when(left-basic) {
			right: 4px;
			box-shadow: 3px -3px 7px rgba(0, 0, 0, 0.07);
			border-bottom-color: transparent;
			border-left-color: transparent;

			@include when(light) {
				border-top-color: $white;
				border-right-color: $white;
			}
			@include when(dark) {
				border-top-color: $dark-bg-color;
				border-right-color: $dark-bg-color;
			}
		}


		@include when(right) {
			top: 50%;
			transform: translateY(-50%) rotate(45deg);
		}
	}
}

</style>
