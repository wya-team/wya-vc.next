<template>
	<component 
		:is="componentType"
		:tag="tag"
		:enter-active-class="`${prefix} is-in`"
		:move-class="`${prefix} is-move`"
		:leave-active-class="`${prefix} is-out`"
		:style="its.style"
		:class="its.class"
		v-bind="its.attrs"
		v-on="listeners"
	>
		<slot />
	</component>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import basicMixin from './basic-mixin';
import useTransition from './use-transition';

export default defineComponent({
	name: 'vc-transition-fade',
	mixins: [basicMixin],
	props: {
		styles: {
			type: Object,
			default: () => ({
				animationFillMode: 'both',
				animationTimingFunction: undefined,
			})
		},
		prefix: {
			type: String,
			default: 'vc-transition-fade'
		}
	},
	setup() {
		const { componentType, its, listeners } = useTransition();
		return {
			its,
			listeners,
			componentType,
		};
	}
});

</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-transition-fade;

@include block($block) {
	@include when(in) {
		will-change: opacity;
		animation-name: vc-fade-in;
		animation-timing-function: linear;
	}
	@include when(out) {
		will-change: opacity;
		animation-name: vc-fade-out;
		animation-timing-function: linear;
	}
	/**
	 * transition-group下删除元素, 其他元素位置变化动画
	 */
	@include when(move) {
		transition: transform .3s $ease-out-quint;
	}
}

@keyframes vc-fade-in {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}

@keyframes vc-fade-out {
	from {
		opacity: 1;
	}

	to {
		opacity: 0;
	}
}

</style>
