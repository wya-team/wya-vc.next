<template>
	<div :style="{ background: background }" class="vc-color-picker-panel">
		<div class="vc-color-picker-panel__white" />
		<div class="vc-color-picker-panel__black" />
		<div
			:style="{
				top: `${cursorTop}px`,
				left: `${cursorLeft}px`
			}" 
			class="vc-color-picker-panel__cursor"
		>
			<div />
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, computed } from 'vue';
import draggable from './draggable';

export default defineComponent({
	name: 'vc-color-picker-panel',
	props: {
		color: {
			required: true,
			type: Object
		}
	},
	setup(props) {
		const instance = getCurrentInstance();
		const background = ref('hsl(0, 100%, 50%)');
		const cursorTop = ref(0);
		const cursorLeft = ref(0);

		const colorValue = computed(() => {
			const hue = props.color.get('hue');
			const value = props.color.get('value');
			return { hue, value };
		});

		const update = () => {
			const saturation = props.color.get('saturation');
			const value = props.color.get('value');
			let { clientWidth, clientHeight } = instance.vnode.el;

			cursorLeft.value = (saturation * clientWidth) / 100;
			cursorTop.value = ((100 - value) * clientHeight) / 100;
			background.value = 'hsl(' + props.color.get('hue') + ', 100%, 50%)';
		};

		const handleDrag = (event) => {
			const rect = instance.vnode.el.getBoundingClientRect();
			let left = event.clientX - rect.left;
			let top = event.clientY - rect.top;

			left = Math.max(0, left);
			left = Math.min(left, rect.width);
			top = Math.max(0, top);
			top = Math.min(top, rect.height);

			cursorLeft.value = left;
			cursorTop.value = top;
			props.color.set({
				saturation: (left / rect.width) * 100,
				value: 100 - (top / rect.height) * 100
			});
		};

		onMounted(() => {
			draggable(instance.vnode.el, {
				drag: handleDrag,
				end: handleDrag
			});
			update();
		});

		watch(() => colorValue.value, update);

		return {
			background,
			cursorTop,
			cursorLeft,
			colorValue
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-color-picker-panel;

@include block($block) {
    width: 240px;
    height: 180px;
    margin: 0 auto;
	cursor: pointer;
    box-sizing: initial;
    position: relative;
    &__white, &__black {
       cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    &__white {
        background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
    }
    &__black {
        background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
    }
	@include element(cursor) {
		position: absolute;
		div {
			width: 4px;
			height: 4px;
			box-shadow: 0 0 0 1.5px #fff, inset 0 0 1px 1px rgba(0, 0, 0, 0.3), 0 0 1px 2px rgba(0, 0, 0, 0.4);
			border-radius: 50%;
			transform: translate(-2px, -2px);
		}
	}
}
</style>
