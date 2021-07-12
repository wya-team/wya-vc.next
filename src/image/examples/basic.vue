<!-- 仅展示最基本的用法 -->
<template>
	<div style="padding: 20px">
		<h1>Basic</h1>
		<div v-for="fit in fits" :key="fit">
			<vc-image :src="url" :fit="fit" style="width: 100px; height: 100px" />
			<span>{{ fit }}</span>
		</div>
	</div>
</template>
<script>
import { defineComponent } from 'vue';
import Image from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-image': Image,
	},
	setup() {
		return {
			fits: ['fill', 'contain', 'cover', 'none', 'scale-down'],
			url: 'https://oss.ruishan666.com/image/xcx/180313/942996157518/10053669,2880,1800.jpg'
		};
	}
});
</script>
