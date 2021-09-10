<template>
	<component 
		:is="componentType"
		:tag="tag"
		:enter-active-class="`${prefix} ${classes} is-in`"
		:leave-active-class="`${prefix} ${classes} is-out`"
		:move-class="`${prefix} ${classes} is-move`"
		:style="its.style"
		:class="its.class"
		v-bind="its.attrs"
		v-on="listeners"
	>
		<slot />
	</component>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import basicMixin from './basic-mixin';
import useTransition from './use-transition';

export default defineComponent({
	name: 'vc-transition-scale',
	mixins: [basicMixin],
	props: {
		mode: {
			type: String as PropType<'x' | 'y' | 'part' | 'both' | 'none'>,
			default: 'both',
			validator: (v: string) => /(part|both|y|x|none)/.test(v)
		},
		styles: {
			type: Object,
			default: () => ({
				animationFillMode: 'both',
				animationTimingFunction: undefined,
			})
		},
		prefix: {
			type: String,
			default: 'vc-transition-scale'
		}
	},
	setup(props) {
		const classes = computed(() => {
			return props.mode !== 'none' ? `is-${props.mode}` : '';
		});
		const { componentType, its, listeners } = useTransition();
		return {
			classes,
			its,
			listeners,
			componentType
		};
	}
});

</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-transition-scale;

@include block($block) {
	@include when(in) {
		will-change: transform, opacity;
		animation-timing-function: cubic-bezier(.43, .84, .61, .99);
	}
	@include when(out) {
		will-change: transform, opacity;
		animation-timing-function: cubic-bezier(.43, .84, .61, .99);
	}
	/**
	 * transition-group下删除元素, 其他元素位置变化动画
	 */
	@include when(move) {
		transition: transform .3s $ease-out-quint;
	}
}
@mixin scale($mode) {
	@include block($block) {
		@include when(#{$mode}) {
			@include when(in) {
				animation-name: vc-scale-#{$mode}-in;
			}
			@include when(out) {
				animation-name: vc-scale-#{$mode}-out;
			}
		}
	}
}

@include scale(part);
@include scale(both);
@include scale(y);
@include scale(x);

/**
 * both
 */
@keyframes vc-scale-both-in {
	from {
		opacity: 0;
		transform: scale(0)
	}

	to {
		opacity: 1;
		transform: scale(1);
	}
}

@keyframes vc-scale-both-out {
	from {
		opacity: 1;
		transform: scale(1);
	}

	to {
		opacity: 0;
		transform: scale(0);
	}
}

/**
 * part
 */
@keyframes vc-scale-part-in {
	from {
		opacity: 0;
		transform: scale(0.5)
	}

	to {
		transform: scale(1);
		opacity: 1;
	}
}

@keyframes vc-scale-part-out {
	from {
		opacity: 1;
		transform: scale(1);
	}

	to {
		opacity: 0;
		transform: scale(0.3);
	}
}

/**
 * y
 */
@keyframes vc-scale-y-in {
	0% {
		opacity: 0;
		transform: scaleY(0.8);
	}
	100% {
		opacity: 1;
		transform: scaleY(1);
	}
}

@keyframes vc-scale-y-out {
	0% {
		opacity: 1;
		transform: scaleY(1);
	}
	100% {
		opacity: 0;
		transform: scaleY(0.8);
	}
}

/**
 * x
 */
@keyframes vc-scale-x-in {
	0% {
		opacity: 0;
		transform: scaleX(0.8);
	}
	100% {
		opacity: 1;
		transform: scaleX(1);
	}
}

@keyframes vc-scale-x-out {
	0% {
		opacity: 1;
		transform: scaleX(1);
	}
	100% {
		opacity: 0;
		transform: scaleX(0.8);
	}
}

</style>
