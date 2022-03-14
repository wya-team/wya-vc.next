<template>
	<div class="vc-color-picker-hue-slider">
		<div 
			ref="bar" 
			class="vc-color-picker-hue-slider__bar"
		/>
		<div
			ref="thumb"
			:style="{
				top: 0,
				left: `${thumbLeft}px`
			}" 
			class="vc-color-picker-hue-slider__thumb"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onMounted, ref, watch, nextTick } from 'vue';
import draggable from './draggable';

export default defineComponent({
	name: 'vc-color-picker-hue-slider',
	props: {
		color: {
			required: true,
			type: Object
		}
	},
	setup(props) {
		const instance = getCurrentInstance();
		const bar = ref(null);
		const thumb = ref(null);
		const thumbLeft = ref(0);

		const handleDrag = (event) => {
			const rect = instance.vnode.el.getBoundingClientRect();
			let left = event.clientX - rect.left;
			let hue;

			left = Math.min(left, rect.width);
			left = Math.max(left, 0);
			hue = Math.round((left / rect.width) * 360);

			props.color.set('hue', hue);
		};


		const update = () => {
			if (!instance.vnode.el) return;

			const hue = props.color.get('hue');
			thumbLeft.value = Math.round((hue * (instance.vnode.el.offsetWidth - thumb.value.offsetWidth / 2)) / 360);
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
			() => props.color?.value,
			update
		);

		return {
			bar,
			thumb,
			thumbLeft,
			update
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-color-picker-hue-slider;

@include block($block) {
    width: 100%;
    height: 10px;
    margin-top: 8px;
	cursor: pointer;
    position: relative;
    @include element(bar) {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        border-radius: 2px;
        background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
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
