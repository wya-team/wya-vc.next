<template>
	<component 
		:is="componentType"
		:tag="tag"
		v-bind="its.attrs"
		move-class="vc-transition-collapse--move"
		:style="its.style"
		:class="its.class"
		v-on="listeners"
	>
		<slot />
	</component>
</template>
<script lang="ts">
import { defineComponent, getCurrentInstance } from 'vue';
import basicMixin from './basic-mixin';
import useTransition from './use-transition';
import type { TransitionInstance } from './types';

export default defineComponent({
	name: 'vc-transition-collapse',
	mixins: [basicMixin],
	setup(props) {
		const { attrs } = getCurrentInstance() as TransitionInstance;
		const { componentType, resetStyles, resetAbsolute, its } = useTransition();
		const getTransitionStyle = (duration = 0.3) => {
			let style = `
				${duration}s height ease-in-out, 
				${duration}s padding-top ease-in-out, 
				${duration}s padding-bottom ease-in-out
			`;
			return style;
		};

		const handleBeforeEnter = (el: HTMLElement) => {
			let duration = (props.duration as any).enter || props.duration;

			el.style.transition = getTransitionStyle(duration);
			// @ts-ignore
			if (!el.dataset) el.dataset = {};

			el.dataset.oldPaddingTop = el.style.paddingTop;
			el.dataset.oldPaddingBottom = el.style.paddingBottom;

			el.style.height = '0px';
			el.style.paddingTop = '0px';
			el.style.paddingBottom = '0px';
			resetStyles(el);

			attrs.onBeforeEnter?.(el);
		};

		const handleEnter = (el: HTMLElement) => {
			el.dataset.oldOverflow = el.style.overflow;
			if (el.scrollHeight !== 0) {
				el.style.height = el.scrollHeight + 'px';
				el.style.paddingTop = el.dataset.oldPaddingTop + 'px';
				el.style.paddingBottom = el.dataset.oldPaddingBottom + 'px';
			} else {
				el.style.height = '';
				el.style.paddingTop = el.dataset.oldPaddingTop + 'px';
				el.style.paddingBottom = el.dataset.oldPaddingBottom + 'px';
			}

			el.style.overflow = 'hidden';

			attrs.onEnter?.(el);
		};

		const handleAfterEnter = (el: HTMLElement) => {
			// for safari: 删除，然后需要重置高度
			el.style.transition = '';
			el.style.height = '';
			el.style.overflow = el.dataset.oldOverflow || '';

			attrs.onAfterEnter?.(el);
		};

		const handleBeforeLeave = (el: HTMLElement) => {
			// @ts-ignore
			if (!el.dataset) el.dataset = {};
			el.dataset.oldPaddingTop = el.style.paddingTop;
			el.dataset.oldPaddingBottom = el.style.paddingBottom;
			el.dataset.oldOverflow = el.style.overflow;

			el.style.height = el.scrollHeight + 'px';
			el.style.overflow = 'hidden';
			resetStyles(el);

			attrs.onBeforeLeave?.(el);
		};

		const handleLeave = (el: HTMLElement) => {
			let leaveDuration = (props.duration as any).leave || props.duration;
			if (el.scrollHeight !== 0) {
				/**
				 * for safari: 
				 * 在设置高度之后添加，否则它会突然跳到零高度
				 */
				el.style.transition = getTransitionStyle(leaveDuration);
				el.style.height = '0px';
				el.style.paddingTop = '0px';
				el.style.paddingBottom = '0px';
			}
			/**
			 * for group
			 */
			resetAbsolute(el);

			attrs.onLeave?.(el);
		};

		const handleAfterLeave = (el: HTMLElement) => {
			el.style.transition = '';
			el.style.height = '';
			el.style.overflow = el.dataset.oldOverflow || '';
			el.style.paddingTop = el.dataset.oldPaddingTop || '';
			el.style.paddingBottom = el.dataset.oldPaddingBottom || '';

			attrs.onAfterLeave?.(el);
		};

		return {
			its,
			componentType,
			listeners: {
				'before-enter': handleBeforeEnter,
				'after-enter': handleAfterEnter,
				'enter': handleEnter,
				'before-leave': handleBeforeLeave,
				'leave': handleLeave,
				'after-leave': handleAfterLeave
			}
		};
	}
});

</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-transition) {
	@include element(collapse) {
		@include modifier(move) {
			transition: transform .3s ease-in-out;
		}
	}
}
</style>
