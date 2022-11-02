<template>
	<div class="vc-modal">
		<vc-transition-fade :delay=".05">
			<div
				v-show="mask && isActive"
				class="vc-modal__mask"
				@click="handleClose($event, maskClosable)"
			/>
		</vc-transition-fade>
		<div
			ref="wrapper"
			:style="[styles, draggable && { top: 0 }]"
			class="vc-modal__wrapper"
			@click="handleClose($event, false)"
		>
			<vc-transition-scale
				mode="part"
				@enter="handleEnter"
				@after-leave="handleRemove"
			>
				<div
					v-show="isActive"
					ref="container"
					:class="{ 
						'is-drag': draggable, 
						'is-large' : size === 'large' || size === 'medium',
						'is-no-footer': !footer || (!cancelText && !okText)
					}"
					:style="[basicStyle, draggableStyle]"
					class="vc-modal__container"
				>
					<div
						ref="header"
						:class="[{ 'is-confirm': mode }]"
						class="vc-modal__header"
						@mousedown="handleMouseDown"
					>
						<vc-icon
							v-if="mode"
							:type="mode"
							:class="`is-${mode}`"
							class="vc-modal__icon"
						/>
						<!-- 用户可以自定义，但也有默认 -->
						<slot name="header">
							<p class="vc-modal__title" v-html="title" />
							<div
								v-if="closable && !mode"
								class="vc-modal__close"
								@click="handleClose($event, true)"
							>
								<vc-icon type="close" />
							</div>
						</slot>
					</div>
					<div 
						ref="content$"
						:class="[{ 'is-confirm': mode }, portalClassName]" 
						class="vc-modal__content"
					>
						<p v-if="typeof content === 'string'" v-html="content" />
						<vc-customer
							v-else-if="typeof content === 'function'"
							:render="content"
						/>

						<slot v-if="$slots.default" />
					</div>
					<div v-if="footer && (cancelText || okText)" :class="{ 'is-confirm': mode }" class="vc-modal__footer">
						<slot name="footer-extra" />
						<slot name="footer">
							<vc-button
								v-if="cancelText"
								style="margin-right: 8px;"
								@click="handleBefore($event, handleCancel)"
							>
								{{ cancelText }}
							</vc-button>
							<vc-button
								v-if="okText"
								type="primary"
								@click="handleBefore($event, handleOk)"
							>
								{{ okText }}
							</vc-button>
						</slot>
					</div>
				</div>
			</vc-transition-scale>
		</div>
	</div>
</template>
<script>
import {
	ref,
	watch,
	computed,
	defineComponent,
	onMounted,
	onUnmounted,
	onBeforeUnmount,
	onUpdated,
	getCurrentInstance
} from 'vue';
import { debounce } from 'lodash';
import Icon from '../icon';
import Button from '../button';
import Transition from '../transition';
import Customer from "../customer/index";
import { VcInstance } from "../vc/index";
import { Resize, getUid } from '../utils/index';
import { IS_SERVER } from '../utils/constant';
import { useScrollbar } from '../hooks/index';

let zIndexNumber = 1002;
export default defineComponent({
	name: "vc-modal",
	components: {
		'vc-icon': Icon,
		'vc-button': Button,
		'vc-customer': Customer,
		'vc-transition-fade': Transition.Fade,
		'vc-transition-scale': Transition.Scale,
	},
	props: {
		modelValue: {
			type: Boolean,
			default: false
		},
		mode: {
			type: String,
			validator: v => /(info|success|error|warning)/.test(v),
		},
		content: {
			type: [String, Function],
			default: ''
		},
		size: {
			type: String,
			validator: v => /(small|medium|large)/.test(v),
			default: 'small'
		},
		portalClassName: [Object, String],
		width: {
			type: Number
		},
		mask: {
			type: Boolean,
			default: true,
		},
		closable: {
			type: Boolean,
			default: true,
		},
		maskClosable: {
			type: Boolean,
			default: true
		},
		escClosable: {
			type: Boolean,
			default: true
		},
		closeWithCancel: {
			type: Boolean,
			default: true // 如果关闭, cancel只能是取消的按钮
		},
		title: String,
		scrollable: {
			type: Boolean,
			default: false
		},
		draggable: {
			type: Boolean,
			default: false
		},
		okText: {
			type: [String, Boolean],
			default: '确定'
		},
		cancelText: {
			type: [String, Boolean],
			default: '取消'
		},
		styles: {
			type: Object
		},

		footer: {
			type: Boolean,
			default: true
		},

		/**
		 * 兼容portal设计, 实现Promise方式
		 */
		onOk: {
			type: Function
		},
		onCancel: {
			type: Function
		}
	},
	emits: ['update:modelValue', 'close', 'portal-fulfilled', 'visible-change', 'ok', 'cancel'],
	setup(props, context) {
		const instance = getCurrentInstance();
		const { slots, attrs, emit } = context;
		// $refs
		const container = ref(null);
		const wrapper = ref(null);
		const header = ref(null);
		const content$ = ref(null);

		const x = ref(0);
		const y = ref(0);
		const isActive = ref(false);

		const defaultSize = computed(() => {
			let width;
			let height;
			switch (props.size) {
				case 'small':
					width = props.mode ? 340 : 480;
					height = props.mode ? 154 : 296;
					break;
				case 'medium':
					width = 640;
					height = 502;
					break;
				case 'large':
					width = props.mode ? 390 : 864;
					height = props.mode ? 198 : 662;
					break;
				default:
					break;
			}
			return {
				width: props.width || width,
				height
			};
		});

		const basicStyle = computed(() => {
			return {
				width: `${defaultSize.value.width}px`,
				minHeight: `${defaultSize.value.height}px`,

				// 注: 服务端渲染为0, 在客服端激活前，展示端存在问题【高度不定】
				maxHeight: IS_SERVER ? 0 : `${window.innerHeight - 20}px`,
			};
		});

		const draggableStyle = computed(() => {
			if (IS_SERVER || !props.draggable) return;

			let left = x.value || window.innerWidth / 2 - defaultSize.value.width / 2;
			let top = y.value || window.innerHeight / 2 - defaultSize.value.height / 2;

			return {
				left: `${left}px`,
				top: `${top}px`,
			};
		});

		useScrollbar(isActive);
		watch(
			() => props.modelValue,
			(v, old) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		let startX = 0;
		let startY = 0;
		let originX = VcInstance.globalEvent.x;
		let originY = VcInstance.globalEvent.y;

		let isDestroyed = false;
		/**
		 * 设置原始坐标
		 */
		const resetOrigin = debounce(function () {
			let el = container.value;

			if (!el) return;

			let $x = 0;
			let $y = 0;
			/**
			 * 拖拽使用x, y
			 * 其他正常的布局
			 */
			let modalX = x.value || el.offsetLeft;
			let modalY = y.value || el.offsetTop || (window.screen.height - el.clientHeight) / 2;

			$x = originX - modalX;
			$y = originY - modalY;

			el.style.transformOrigin = `${$x}px ${$y}px 0`;
		}, 250, { leading: true });

		const handleEnter = () => resetOrigin();
		/**
		 * 动画执行后关闭, 关闭事件都会被执行
		 * visible-change 由移除之后触发
		 * 同时portal-fulfilled兼容portal设计
		 */
		const handleRemove = () => {
			!instance.isUnmounted && (
				emit('close'),
				emit('portal-fulfilled'),
				emit('update:modelValue', false),
				emit('visible-change', false)
			);
		};

		const handleBefore = (e, hook) => {
			if (!isActive.value) return;

			// 2.x使用的是callback
			let fn = hook && hook(e);
			if (fn && fn.then) {
				return fn
					.then((res) => {
						isActive.value = false;
						return res;
					});
			} else if (!fn) {
				isActive.value = false;
			}
		};

		/**
		 * 用户点击确定的回调
		 * 兼容portal设计
		 */
		const handleOk = (...rest) => {
			let ok = instance.vnode.props.onOk || props.onOk || (() => {});

			return ok(...rest);
		};

		/**
		 * 用户点击取消按钮时为取消
		 * 兼容portal设计
		 */
		const handleCancel = (...rest) => {
			let cancel = instance.vnode.props.onCancel || props.onCancel || (() => {});

			return cancel(...rest);
		};
		/**
		 * 关闭事件
		 */
		const handleClose = (e, closable) => {
			if (closable
				|| (
					props.maskClosable
					&& e.target.classList.contains('vc-modal__wrapper')
				)
			) {
				// 用户主要取消与关闭事件关联
				if (props.closeWithCancel) {
					handleBefore(e, handleCancel);
				} else {
					isActive.value = false;
				}
			}
		};
		const handleEscClose = (e) => {
			if (e.keyCode === 27 && props.escClosable && isActive.value) {
				handleClose(e, true);
			}
		};

		// 当高度为基数时，解决模糊的问题
		const handleContainerResize = () => {
			const $container = container.value;
			const maxheight = window.innerHeight - 20;
			let containerHeight = $container.offsetHeight;
			if (containerHeight + 1 > maxheight) {
				if (maxheight % 2 !== 0) {
					$container.style.height = `${maxheight - 1}px`;
				}
			} else if (containerHeight % 2 !== 0) {
				$container.style.height = `${containerHeight + 1}px`;
			}
		};

		/**
		 * 解决handleContainerResize设置高度后
		 * content变化，高度无法重写计算的问题，因为content有over-flow-y: auto;
		 *
		 * 移除后可能会再次触发handleContainerResize
		 */
		const handleContentResize = () => {
			const has = !!container.value.style.getPropertyValue('height');
			has && container.value.style.removeProperty('height');
		};

		const handleClick = (e) => {
			// isActive click先触发,后设置后
			if (props.draggable && isActive.value && originX) return;
			originX = e.x;
			originY = e.y;
		};


		const handleMouseMove = (e) => {
			x.value += e.clientX - startX;
			y.value += e.clientY - startY;
			startX = e.clientX;
			startY = e.clientY;
		};
		/**
		 * 松开鼠标时清除move和up事件
		 */
		const handleMouseUp = () => {
			/**
			 * 放手后重新设置原点
			 */
			resetOrigin();

			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};

		const handleMouseDown = (e) => {
			if (!props.draggable) {
				return;
			}
			const $container = container.value;
			const $wrapper = wrapper.value;
			const $header = header.value;
			const rect = $container.getBoundingClientRect();
			$header.style.cursor = 'move';
			zIndexNumber += 1;
			$wrapper.style.zIndex = zIndexNumber;
			x.value = rect.x || rect.left;
			y.value = rect.y || rect.top;

			startX = e.clientX;
			startY = e.clientY;

			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseup", handleMouseUp);
		};

		onMounted(() => {
			document.addEventListener('keydown', handleEscClose);
			document.addEventListener('click', handleClick, true);
			Resize.on(container.value, handleContainerResize);
			Resize.on(content$.value, handleContentResize);
		});

		onUpdated(() => {
			/**
			 * 非拖动状态下, 外部,会触发设置初始值
			 */
			!props.draggable && isActive.value && resetOrigin();
		});

		onBeforeUnmount(() => {
			Resize.off(container.value, handleContainerResize);
			Resize.off(content$.value, handleContentResize);
		});

		onUnmounted(() => {
			document.removeEventListener('click', handleClick, true);
			document.removeEventListener('keydown', handleEscClose);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		});

		return {
			container,
			wrapper,
			header,
			content$,
			x,
			y,
			isActive,
			defaultSize,
			basicStyle,
			draggableStyle,
			handleClose,
			handleEnter,
			handleRemove,
			handleMouseDown,
			handleBefore,
			handleCancel,
			handleOk,
			resetOrigin
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-modal) {
	@include element(mask) {
		opacity: 1;
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		background-color: $mask-bg-color;
		height: 100%;
		z-index: $popup-zindex; // 与wrapper相同，两个modal同时出现时可以盖上去
	}
	@include element(wrapper) {
		position: fixed;
		top: 50%;
		transform: translateY(-50%);
		left: 0;
		width: 100%;
		z-index: $popup-zindex;
	}
	@include element(container) {
		position: relative;
		background: $white;
		box-shadow: $border-shadow;
		margin: auto;
		border-radius: 4px;
		padding-bottom: 63px;
		display: flex;
		flex-direction: column;
		@include when(no-footer) {
			padding-bottom: 0;
		}
		@include when(drag) {
			position: absolute;
		}
		@include when(large) {
			@media screen and (max-height: 768px) {
				min-height: 400px !important;
			}
			@media screen and (max-height: 400px) {
				min-height: 100% !important;
			}
		}
	}

	@include element(header) {
		position: relative;
		border-bottom: 1px solid $border-line-color;
		padding: 14px 24px;
		line-height: 1;
		font-size: 14px;
		font-weight: 400;
		display: flex;
		@include when(confirm) {
			border-bottom: none;
			padding: 24px 16px 16px 16px;
		}
	}
	@include element(content) {
		overflow-y: auto;
		padding: 16px 24px;
		flex: 1;
		// modal下分页器距离table  16px
		.vc-paging__footer {
			padding: 16px 0 0 0;
		}
		@include when(confirm) {
			padding: 0;
			padding-left: 46px;
			padding-right: 24px;
		}
		@include when(padding-none) {
			padding: 0;
			padding-left: 0;
		}
	}
	@include element(footer) {
		position: absolute;
		bottom: 0;
		width: 100%;
		border-top: 1px solid $border-line-color;
		padding: 17px 24px;
		text-align: right;
		@include when(confirm) {
			border-top: none;
			padding: 14px 16px;
			button {
				display: inline-block;
				vertical-align: middle;
			}
		}
	}
	@include element(title) {
		width: 100%;
		line-height: 20px;
		min-height: 20px;
		font-size: 14px;
		color: $c333;
		font-weight: 400;
		word-wrap: break-word;
	}
	@include element(close) {
		position: absolute;
		top: 17px;
		right: 16px;
		color: $c999;
		cursor: pointer;
	}
	@include element(icon) {
		margin-right: 8px;
		font-size: 20px;
		@include when(success) {
			color: $success;
		}
		@include when(error) {
			color: $error;
		}
		@include when(warning) {
			color: $warning;
		}
		@include when(info) {
			color: $info;
		}
	}
}
</style>
