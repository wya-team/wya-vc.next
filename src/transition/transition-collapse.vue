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

export default defineComponent({
	name: 'vc-transition-collapse',
	mixins: [basicMixin],
	setup(props, { emit, attrs }) {
		const { componentType, resetStyles, resetAbsolute, its, listeners } = useTransition();
		const getTransitionStyle = (duration = 0.3) => {
			let style = `
				${duration}s height ease-in-out, 
				${duration}s padding-top ease-in-out, 
				${duration}s padding-bottom ease-in-out
			`;
			return style;
		};

		const handleBeforeEnter = (el) => {
			let duration = props.duration.enter || props.duration;

			el.style.transition = getTransitionStyle(duration);
			if (!el.dataset) el.dataset = {};

			el.dataset.oldPaddingTop = el.style.paddingTop;
			el.dataset.oldPaddingBottom = el.style.paddingBottom;

			el.style.height = '0';
			el.style.paddingTop = 0;
			el.style.paddingBottom = 0;
			resetStyles(el);

			attrs.onBeforeEnter?.(el);
		};

		const handleEnter = (el) => {
			el.dataset.oldOverflow = el.style.overflow;
			if (el.scrollHeight !== 0) {
				el.style.height = el.scrollHeight + 'px';
				el.style.paddingTop = el.dataset.oldPaddingTop;
				el.style.paddingBottom = el.dataset.oldPaddingBottom;
			} else {
				el.style.height = '';
				el.style.paddingTop = el.dataset.oldPaddingTop;
				el.style.paddingBottom = el.dataset.oldPaddingBottom;
			}

			el.style.overflow = 'hidden';

			attrs.onEnter?.(el);
		};

		const handleAfterEnter = (el) => {
			// for safari: 删除，然后需要重置高度
			el.style.transition = '';
			el.style.height = '';
			el.style.overflow = el.dataset.oldOverflow;

			attrs.onAfterEnter?.(el);
		};

		const handleBeforeLeave = (el) => {
			if (!el.dataset) el.dataset = {};
			el.dataset.oldPaddingTop = el.style.paddingTop;
			el.dataset.oldPaddingBottom = el.style.paddingBottom;
			el.dataset.oldOverflow = el.style.overflow;

			el.style.height = el.scrollHeight + 'px';
			el.style.overflow = 'hidden';
			resetStyles(el);

			attrs.onBeforeLeave?.(el);
		};

		const handleLeave = (el) => {
			let leaveDuration = props.duration.leave || props.duration;
			if (el.scrollHeight !== 0) {
				/**
				 * for safari: 
				 * 在设置高度之后添加，否则它会突然跳到零高度
				 */
				el.style.transition = getTransitionStyle(leaveDuration);
				el.style.height = 0;
				el.style.paddingTop = 0;
				el.style.paddingBottom = 0;
			}
			/**
			 * for group
			 */
			resetAbsolute(el);

			attrs.onLeave?.(el);
		};

		const handleAfterLeave = (el) => {
			el.style.transition = '';
			el.style.height = '';
			el.style.overflow = el.dataset.oldOverflow;
			el.style.paddingTop = el.dataset.oldPaddingTop;
			el.style.paddingBottom = el.dataset.oldPaddingBottom;

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
