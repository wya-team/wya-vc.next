<template>
	<div>
		<vc-image-crop 
			ref="target"
			:src="src" 
			:scale="scale" 
			:rotate="rotate" 
			:width="375"
			:height="230"
			cross-origin="anonymous"
			@drop-file="handleFn"
			@load-failure="handleFn"
			@load-success="handleFn"
			@image-ready="handleFn"
			@image-change="handleFn"
			@position-change="handleFn"
		/>
		<vc-slider v-model="scale" :min="0.3" :max="3" :step="0.01" />
		<vc-slider v-model="rotate" :min="0" :max="360" />
		
		<div @click="handleSave">
			保存
		</div>

		<img :src="result" width="200">
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Slider from '../../slider';
import ImageCrop from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-image-crop': ImageCrop,
		'vc-slider': Slider,
	},
	setup() {
		const target = ref(null);
		// const src = ref('https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/1/20190522/212240/CEB)AY7L){07$XT$DU8B}Y7.jpg');
		const src = ref('https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg');
		// const src = ref('https://avatars3.githubusercontent.com/u/34465004?s=200&v=4');
		const scale = ref(1);
		const rotate = ref(0);
		const result = ref(null);

		return {
			target,
			src,
			scale,
			rotate,
			result,
			handleFn() {
				console.log(...arguments);
			},
			async handleSave() {
				try {
					const { file, base64Image } = await target.value.getImage();
					result.value = base64Image;

				} catch (e) {
					console.log(e, "跨域问题：需要添加 cors协议头");
				}
			}
		};
	}	
});
</script>
