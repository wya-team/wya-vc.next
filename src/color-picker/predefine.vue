<template>
	<div class="vc-color-picker-predefine">
		<div 
			v-for="(item, index) in rgbaColors"
			:key="index"
			:class="{ 
				'is-selected': item.selected,
				'is-alpha': item._alpha < 100
			}"
			class="vc-color-picker-predefine__block"
			@click="handleSelect(index)"
		>
			<div :style="{'background-color': item.value}" />
		</div>            
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, onBeforeMount, ref, watch, computed, reactive } from 'vue';
import Color from './color';

const formatColors = (colors, color) => {
	return colors.map(value => {
		let c = reactive(new Color({
			enableAlpha: true,
			format: 'rgba'
		}));
		c.fromString(value);
		c.selected = c.value === color.value;
		return c;
	});
};
export default defineComponent({
	name: 'vc-color-picker-predefine',
	props: {
		colors: {
			type: Array,
		},
		color: {
			type: Object,
			required: true
		}
	},
	setup(props) {
		const rgbaColors = ref([]);

		const update = () => {
			rgbaColors.value = formatColors(props.colors, props.color);
		};

		const handleSelect = (index) => {
			props.color.fromString(props.colors[index]);
		};

		onBeforeMount(update);

		watch(
			() => props.colors,
			update
		);

		watch(
			() => props.color?.value,
			update
		);

		return {
			rgbaColors,
			update
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';
$block: vc-color-picker-predefine;
$url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8uwAAAAGUlEQVQYV2M4gwH+YwCGIasIUwhT25BVBADtzYNYrHvv4gAAAABJRU5ErkJggg==';

@include block($block) {
	display: flex;
	width: 240px;
	margin-top: 8px;
	display: flex;
	flex: 1;
	flex-wrap: wrap;
	@include element(block) {
		width: 18px;
		height: 18px;
		margin: 0 0 6px 6px;
		cursor: pointer;
		div {
			height: 100%;
			border-radius: 2px;
			box-shadow: inset 0 0 0 1px rgba(0,0,0,.15)
		}
		&:nth-child(10n + 1) {
			margin-left: 3px;
		}
		@include when(selected) {
			box-shadow: 0 0 2px 1px #409EFF;
		}
		@include when(alpha) {
			background: url($url);
		}
	}
}
</style>
