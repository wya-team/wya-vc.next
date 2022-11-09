
<template>
	<component 
		:is="tag" 
		style="position: relative;"
		@focus="isFocus && handleChange($event, { visible: true })"
		@blur="isFocus && handleChange($event, { visible: false })"
		@mouseenter="(isHover || isStrictHover) && handleChange($event, { visible: true })"
		@mouseleave="(isHover || isStrictHover) && handleChange($event, { visible: false })"
		@click="isClick && handleChange($event, { visible: !isActive })"
	>
		<slot />
	</component>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, getCurrentInstance, onMounted, onUnmounted } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { pick } from 'lodash';
import { DOM } from '@wya/utils';
import { getUid } from '../utils/index';
import Core, { Func } from './core.vue';
import type PortalLeaf from '../portal/portal-leaf';

export default defineComponent({
	name: "vc-popover",
	props: {
		...pick(Core.props, [
			'modelValue', 
			'animation', 
			'placement', 
			'theme', 
			'content', 
			'getPopupContainer', 
			'portal', 
			'arrow',
			'portalClassName',
			'portalStyle',
			'autoWidth',
			'always'
		]),
		trigger: {
			type: String,
			default: 'hover',
			validator: (v: string) => /(hover|strictHover|click|focus|custom)/.test(v)
		},
		tag: {
			type: String,
			default: 'span'
		},
		disabled: {
			type: Boolean,
			default: false
		},
		outsideClickable: {
			type: Boolean,
			default: true
		}
	},
	emits: ['update:modelValue', 'visible-change', 'ready', 'close'],
	setup(props, context) {
		const instance = getCurrentInstance() as ComponentInternalInstance;
		const { emit, slots } = context;

		const popoverId = getUid('popover');
		const isActive = ref(false);
		const isHover = computed(() => {
			return props.trigger === 'hover' && !props.always;
		});
		const isStrictHover = computed(() => {
			return props.trigger === 'strictHover' && !props.always;
		});

		const isClick = computed(() => {
			return props.trigger === 'click' && !props.always;
		});

		const isFocus = computed(() => {
			return props.trigger === 'focus' && !props.always;
		});

		const sync = () => {
			emit('update:modelValue', isActive.value);
			emit('visible-change', isActive.value);
		};

		let timer: Nullable<TimeoutHandle>;
		let popperInstance: PortalLeaf;

		/**
		 * portal: false
		 * 是直接挂在父节点上的，
		 * 点击pop内容区域时click事件冒泡，导致执行了该toggle方法
		 * visible: true, false, undefined(处理 doc click)
		 */
		const handleChange = (e: any = {}, { visible }) => {
			visible = props.always || visible;
			if (props.disabled) return;

			isHover.value && timer && clearTimeout(timer);
			let path: Element[] = e.path || DOM.composedPath(e) || [];

			let isPopArea = path.some(item => new RegExp(popoverId).test(item.className));

			if (!props.portal && isPopArea) return;

			// document click
			if (visible === undefined) {
				if (
					!isPopArea 
					&& !instance?.vnode?.el?.contains(e.target) 
					&& props.outsideClickable
				) {
					visible = false;
				} else {
					return;
				}
			}

			if (visible != isActive.value) {
				let callback = () => {
					isActive.value = visible;

					sync();
				};
				(isHover.value || isStrictHover.value) && visible === false 
					? (timer = setTimeout(callback, 200))
					: callback();
			} 
		};

		const refresh = () => {
			if (isActive.value) {
				let el = props.getPopupContainer 
					? props.getPopupContainer()
					: props.portal 
						? document.body 
						: instance.vnode.el;
				let { portalClassName } = props;

				typeof portalClassName === 'object' 
					? portalClassName instanceof Array 
						? portalClassName.push(popoverId)
						: (portalClassName[popoverId] = true)
					: (portalClassName += ` ${popoverId}`);

				popperInstance = Func.popup({
					el,
					cName: popoverId,
					triggerEl: instance.vnode.el as Element,
					onChange: handleChange,
					onClose: () => {
						emit('close');
					},
					onReady: () => {
						emit('ready');
					},
					hover: isHover.value,

					/**
					 * 传送门通信控制
					 */
					slots,
					parent: instance.parent,
					...props,
					portalClassName
				}) as PortalLeaf;
			} else if (popperInstance && popperInstance.wrapper) {
				popperInstance.wrapper.isActive = false;
			}
		};

		watch(
			() => props.modelValue,
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		watch(
			() => isActive.value,
			() => {
				refresh();
			}
		);

		onMounted(() => {
			isActive.value && refresh();
		});



		onUnmounted(() => {
			popperInstance && popperInstance.destroy();
		});

		return {
			isFocus,
			isHover,
			isStrictHover,
			isClick,
			isActive,
			handleChange,
		};
	}

});
</script>
