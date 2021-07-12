<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<h1>图像处理</h1>
		<h3>原图</h3>
		<img :src="img" width="100" height="100">
		<h3>扣掉指定颜色</h3>
		<vc-image-processing
			:data-source="img"
			:tolerance="90"
			:cutout-color="[255, 237, 113, 1]" 
			processing="cutout"
		/>
		<h3>置灰</h3>
		<vc-image-processing
			:data-source="img"
			processing="gray"
		/>
	</div>
</template>
<script>
import ImageProcessing from '..';

export default {
	name: "vc-image-processing-basic",
	components: {
		'vc-image-processing': ImageProcessing,
	},
	setup() {
		return {
			img: 'https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/172/20190812/112918/微信图片_20190624213255.jpg'
		};
	}
};
</script>
