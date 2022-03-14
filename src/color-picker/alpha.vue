<template>
	<div class="vc-color-picker-alpha">
		<div 
			ref="bar"
			:style="{ background: background }" 
			class="vc-color-picker-alpha__bar"
		/>
		<div 
			ref="thumb" 
			:style="{
				top: 0,
				left: `${thumbLeft}px`
			}"
			class="vc-color-picker-alpha__thumb"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, nextTick } from 'vue';
import draggable from './draggable';

export default defineComponent({
	name: 'vc-color-picker-alpha',
	props: {
		color: {
			required: true,
			type: Object
		},
	},
	setup(props) {
		const instance = getCurrentInstance();
		const bar = ref(null);
		const thumb = ref(null);
		const background = ref(null);
		const thumbLeft = ref(0);

		const handleDrag = (event) => {
			const rect = instance.vnode.el.getBoundingClientRect();
			let left = event.clientX - rect.left;
			
			left = Math.min(left, rect.width);
			left = Math.max(left, 0);
			const alpha = Math.round((left / rect.width) * 100);

			props.color.set('alpha', alpha);
		};

		const getBackground = () => {
			const { r, g, b } = props.color.toRgb();
			return `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0) 0%, rgba(${r}, ${g}, ${b}, 1) 100%)`;
		};

		const update = () => {
			if (!instance.vnode.el) return;

			const alpha = props.color.get('alpha');
			thumbLeft.value = Math.round((alpha / 100) * (instance.vnode.el.offsetWidth - thumb.value.offsetWidth));
			background.value = getBackground();
		};

		onMounted(() => {
			const dragConfig = {
				drag: handleDrag,
				end: handleDrag
			};
			
			draggable(bar.value, dragConfig);
			draggable(thumb.value, dragConfig);
			nextTick(() => update());
		});

		watch(
			() => props.color?._alpha,
			update
		);

		watch(
			() => props.color?.value,
			update
		);

		return {
			bar,
			thumb,
			background,
			thumbLeft,
			update
		};
	}
});
</script>

<!-- eslint-disable -->
<style lang="scss">
@import '../style/vars.scss';
$block: vc-color-picker-alpha;
$color-block: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==';

@include block($block) {
	position: relative;
	box-sizing: border-box;
	width: 100%;
	height: 10px;
	margin-top: 8px;
	cursor: pointer;
	background: url($color-block);
	@include element(bar) {
		position: relative;
		height: 100%;
	}
	@include element(thumb) {
		position: absolute;
		top: 0;
		left: 100px;
		cursor: pointer;
		box-sizing: border-box;
		width: 4px;
		height: 100%;
		border-radius: 1px;
		background: #fff;
		border: 1px solid #f0f0f0;
		box-shadow: 0 0 2px rgba(0, 0, 0, 0.6);
		z-index: 1;
	}
}
</style>
