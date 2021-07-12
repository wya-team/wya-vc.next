<!-- 开发使用的版本，如各种操作改变属性值 -->
<template>
	<div style=" display: flex; padding: 20px; flex-direction: column-reverse;">
		<!-- 组件展示 -->
		<vc-tpl v-bind="attrs" v-on="hooks" />
		<br>
		<!-- 控制区域 -->
		<div>
			<br>
			<br>
		</div>
	</div>
</template>
<script>
import { defineComponent } from 'vue';
import Tpl from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-tpl': Tpl,
	},
	setup() {
		return {
			attrs: {

			},
			hooks: {

			}
		};
	}
});
</script>
