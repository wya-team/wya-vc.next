<template>
	<div style="padding: 100px">
		<vcm-modal 
			v-model="visible1"
			:mask-closable="true"
			title="标题1"
			content="账号密码不一致，请重试"
			@close="handleClose"
			@cancel="handleCancel"
			@ok="handleOk"
		/>
		<vcm-modal 
			v-model="visible2"
			:mode="mode"
			:mask-closable="true"
			title="标题1"
			@close="handleClose"
			@cancel="handleCancel"
			@ok="handleOk"
		>
			<div @click="handleClick4">
				portal: 确定，取消
			</div>
			<!-- <vcm-input v-model="value" /> -->
		</vcm-modal>
		<vcm-modal 
			v-model="visible3"
			:mode="mode"
			:mask-closable="true"
			:cancel-text="false"
			title="标题1"
			content="啦啦啦啦"
			@close="handleClose"
			@cancel="handleCancel"
			@ok="handleOk"
		/>
		<vcm-modal 
			v-model="visible4"
			:mask-closable="true"
			content="账号密码不一致，请重试"
			@close="handleClose"
			@cancel="handleCancel"
			@ok="handleOk"
		/>
		<div @click="handleClick1">
			normal: 基本
		</div>		
		<div @click="handleClick2">
			normal: 自定义slot content
		</div>
		<div @click="handleClick3">
			normal: 1个按钮
		</div>
		<div @click="handleClick4">
			portal: 确定，取消
		</div>
		<div @click="handleClick5">
			portal: 多个按钮
		</div>
		<div @click="handleClick6">
			portal: operation
		</div>	
		<div @click="handleClick7">
			normal: 无标题
		</div>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import MModal from '../index.m';
import { VcInstance } from '../../vc/index';

window.vc = VcInstance;
export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vcm-modal': MModal,
	},

	setup() {
		const value = ref("222");
		const mode = ref('alert');
		const visible1 = ref(false);
		const visible2 = ref(false);
		const visible3 = ref(false);
		const visible4 = ref(false);
		return {
			value,
			mode,
			visible1,
			visible2,
			visible3,
			visible4,
			handleClose() {
				console.log('关闭后都会触发');
			},
			handleCancel() {
				console.log('点击取消这个按钮时回调');
			},
			handleOk(e) {
				console.log('点击确定这个按钮时回调');
				return new Promise((resolve, reject) => {
					setTimeout(resolve, 3000);
				});
			},
			handleClick1() {
				visible1.value = !visible1.value;
			},
			handleClick2() {
				visible2.value = !visible2.value;
			},
			handleClick3() {
				visible3.value = !visible3.value;
			},
			handleClick4() {
				MModal.alert({
					title: '标题1',
					content: '啦啦',
					onOk: () => {
						console.log('点击确定这个按钮时回调');
					},
					onCancel: (e) => {
						setTimeout(() => {
							console.log('点击确定这个按钮时回调');
						}, 3000);
						return true;
					},
					onClose: () => {
						console.log('关闭后都会触发');
					}
				});
			},
			handleClick5() {
				MModal.alert({
					title: '标题1',
					content: '啦啦',
					actions: [
						{
							text: '1',
							onPress: () => console.log(`点击了第1个按钮`)
						},
						{
							text: '2',
							onPress: () => console.log(`点击了第2个按钮`)
						},
						{
							text: '3',
							onPress: () => console.log(`点击了第3个按钮`)
						}
					]
				});
			},
			handleClick6() {
				MModal.operation({
					actions: [
						{
							text: '1',
							onPress: () => console.log(`点击了第1个按钮`)
						},
						{
							text: '2',
							onPress: () => console.log(`点击了第2个按钮`)
						},
						{
							text: '3',
							onPress: () => console.log(`点击了第3个按钮`)
						}
					]
				});
			},
			handleClick7() {
				visible4.value = !visible4.value;
			}
		};
	}
});
</script>
