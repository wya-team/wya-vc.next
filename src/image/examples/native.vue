<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<h1>原生标签比较(有一定差距，原图会全部显示)</h1>
		<vc-image :src="url" />
		<img :src="url">
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Image from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-image': Image,
	},
	setup() {
		return {
			url: 'https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg'
		};
	}
});
</script>
