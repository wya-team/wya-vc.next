<template>
	<i class="vc-icon">
		<svg :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg">
			<path 
				v-for="(it, i) in path"
				:key="i" 
				:d="it.d" 
				:fill="inherit && it.fill"
			/>
		</svg>
	</i>
</template>
<script>
import { defineComponent, onMounted, reactive, ref, computed, watch } from 'vue';
import IconManager from './manager';

export default defineComponent({
	name: "vc-icon",
	props: {
		type: String,
		inherit: {
			type: Boolean,
			default: false
		}
	},
	setup(props, context) {
		const viewBox = ref('0 0 1024 1024');
		const path = ref([]);

		const getConfig = () => {
			viewBox.value = IconManager.icons[props.type].viewBox;
			path.value = IconManager.icons[props.type].path;
		};

		watch(
			() => props.type, 
			(v, old) => {
				IconManager.icons[v] 
					? getConfig() 
					: (
						IconManager
							.off(old, getConfig)
							.on(v, getConfig)
					);
			}, 
			{ immediate: true }
		);

		return {
			viewBox,
			path
		};
	}
});
</script>
<style lang="scss">
.vc-icon {
	display: inline-block;
	vertical-align: middle;
	line-height: 0;
}
.vc-icon svg {
	width: 1em;
	height: 1em;
	vertical-align: -0.15em; // 居中
	// padding: 0.05em;
	fill: currentColor;
	overflow: hidden;
}
</style>