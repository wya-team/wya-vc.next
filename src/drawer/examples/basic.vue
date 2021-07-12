<template>
	<div>
		<vc-button @click="handleDrawer">
			点击出现抽屉
		</vc-button>
		<vc-button @click="handleDrawer2">
			点击出现第二个抽屉
		</vc-button>
		<div style="height: 1000px" />
		<vc-drawer
			v-model="visible"
			:height="500"
			placement="bottom"
		>
			我是content1
		</vc-drawer>
		<vc-drawer
			v-model="visible2"
			:width="500"
			:mask="false"
			:scrollable="true"
		>
			<div>
				我是content2
			</div>
		</vc-drawer>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Drawer from '../drawer';
import Button from '../../button';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-drawer': Drawer,
		'vc-button': Button
	},
	setup(props) {
		const visible = ref(false);
		const visible2 = ref(false);

		return {
			visible,
			visible2,
			handleDrawer() {
				visible.value = true;
			},
			handleDrawer2() {
				visible2.value = true;
			}
		};
	}
});
</script>
