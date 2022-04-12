<template>
	<vc-panel :color="color" />	
	<vc-hue-slider v-if="hue" :color="color" />
	<vc-alpha v-if="alpha" :color="color" />
	<vc-predefine 
		v-if="colors.length"
		:colors="colors"
		:color="color" 
	/> 
	<vc-predefine 
		v-if="!colors.length && recommend"
		:colors="recommendColors"
		:color="color" 
	/> 
</template>

<script  lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import Color from "./color";
import Panel from "./panel.vue";
import HueSlider from "./hue-slider.vue";
import Alpha from "./alpha.vue";
import Predefine from "./predefine.vue";
import { COLORS } from './constants';

export default {
	components: {
		'vc-panel': Panel,
		'vc-hue-slider': HueSlider,
		'vc-alpha': Alpha,
		'vc-predefine': Predefine,
	},
	props: {
		value: {
			type: String,
			default: ''
		},
		alpha: {
			type: Boolean,
			default: false
		},
		hue: {
			type: Boolean,
			default: true
		},
		recommend: {
			type: Boolean,
			default: false
		},
		colors: {
			type: Array,
			default: () => ([])
		},
		format: {
			type: String,
			validator: v => /(hsl|hsv|hex|rgb)/.test(v),
		}
	},
	emits: ['change'],
	setup(props, { emit }) {
		const recommendColors = ref([...COLORS]);
		const color = reactive(new Color({
			enableAlpha: props.alpha,
			format: props.format,
			value: props.value
		}));
		
		// 初始化时，先于watch设置color的value，防止触发change
		color.fromString(props.value);

		watch(
			() => props.value,
			(v) => {
				color.fromString(v);
			},
		);

		watch(
			() => color,
			(v) => {
				emit('change', color);
			},
			{ deep: true }
		);

		return {
			color,
			recommendColors
		};
	}
};
</script>