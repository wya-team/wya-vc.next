<template>
	<div>
		<vcm-touch @pinch="handlePinch">
			<vcm-image-crop 
				ref="target"
				:src="src"
				:scale="scale" 
				:rotate="rotate" 
				style="height: 100%; width: 100%" 
				cross-origin="anonymous"
				@drop-file="handleFn"
				@load-failure="handleFn"
				@load-success="handleFn"
				@image-ready="handleFn"
				@image-change="handleFn"
				@mouseup="handleFn"
				@mousemove="handleFn"
				@position-change="handleFn"
			/>
		</vcm-touch>
		<vcm-icon type="rotate-right" @click="rotate += 90" />
		<vcm-button @click="handleSave">
			保存
		</vcm-button>
		<img :src="result">
	</div>
</template>
<script>
import { defineComponent, ref, getCurrentInstance } from 'vue';
import MImageCrop from '..';
import MTouch from '../../touch/index.m';
import MIcon from '../../icon/index.m';
import MButton from '../../button/index.m';

export default defineComponent({
	name: "vcm-tpl-basic",
	components: {
		'vcm-image-crop': MImageCrop,
		'vcm-touch': MTouch,
		'vcm-icon': MIcon,
		'vcm-button': MButton,
	},
	setup(props) {
		const target = ref(null);
		const instance = getCurrentInstance();
		const src = ref("https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg");
		// const src = ref('https://avatars3.githubusercontent.com/u/34465004?s=200&v=4');
		const scale = ref(1);
		const rotate = ref(0);
		const result = ref(null);

		return {
			target,
			result,
			scale,
			rotate,
			src,
			handleFn() {
				console.log(...arguments);
			},
			async handleSave() {
				try {
					const { file, base64Image } = await target.value.getImage({ getFile: true });
					result.value = base64Image;
					console.log(file);
				} catch (e) {
					console.log(e, "跨域问题：需要添加 cors协议头");
				}
			},
			handlePinch({ scale: $scale }) {
				scale.value += $scale;
				scale.value = scale.value < 0 ? 0.05 : scale.value;
			},
		};
	}
});
</script>
<style>
img {
	width: 100%
}
</style>
