<template>
	<div>
		<img :src="src">
		<vc-html-image ref="target" :parser="parser">
			<div>tpl</div>
			<div>tpl</div>
			<div>tpl</div>
			<div>tpl</div>
			<div>tpl</div>
			<div>tpl</div>
			<img src="https://avatars3.githubusercontent.com/u/34465004?s=200&v=4" class="image">
			
			<!-- 需要crossorigin加在第一个， 才能处理跨域 -->
			<img 
				:crossorigin="`anonymous`" 
				src="https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/1/20190518/102315/227984.jpg" 
				class="image"
			>
		</vc-html-image>
		<vc-button @click="handleClick">
			生成
		</vc-button>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import HTMLImage from '..';
import Button from '../../button/index';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-html-image': HTMLImage,
		'vc-button': Button
	},
	setup() {
		const src = ref('');
		const target = ref(null);
		return {
			src,
			target,
			async handleClick() {
				let res = await target.value.download();
				src.value = res.base64Image;
			},
			parser(url) {
				return new Promise((resolve) => {
					setTimeout(() => {
						console.log(url);
						resolve(url);
					}, 3000);
				});
			}
		};
	}
});
</script>
<style>
.image {
	width: 200px;
}
</style>
