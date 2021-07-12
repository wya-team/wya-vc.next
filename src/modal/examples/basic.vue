<template>
	<div style="padding: 100px">
		<vc-button @click="handleModal1">
			点击出现对话框
		</vc-button>
		<vc-button @click="handleModal2">
			点击出现对话框,点击遮罩不能关闭
		</vc-button>
		<vc-button @click="handleModal3">
			new Portal
		</vc-button>
		<vc-button type="primary" @click="handleModal4">
			Modal.methods
		</vc-button>
		<div style="width: 100%; height: 2000px" />
		<vc-modal 
			v-model="visible1"
			:mask-closable="true"
			title="标题1"
			@close="handleClose"
			@cancel="handleCancel"
			@ok="handleOk"
		>
			<vc-button type="primary" @click="handleModal4">
				Modal.methods
			</vc-button>
			<template #footer>
				222
			</template>
		</vc-modal>
		<vc-modal 
			v-model="visible2"
			:mask="false"
			:mask-closable="false"
			:esc-closable="false"
			scrollable
			draggable
			title="标题2"
			ok-text="保存2"
			cancel-text="关闭2"
			@close="handleClose"
			@cancel="handleCancel"
			@ok="handleOk"
		>
			可以拖拽
		</vc-modal>
	</div>
</template>
<script>
import { h, ref, defineComponent } from 'vue';
import Button from '../../button';
import Modal from '../index';
import { Portal } from './basic/portal';
import { VcInstance } from '../../vc/index';

window.vc = VcInstance;
export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-modal': Modal,
		'vc-button': Button
	},
	setup() {
		const visible1 = ref(true);
		const visible2 = ref(false);
		const visible3 = ref(false);
		let hasReject = false;

		return {
			visible1,
			visible2,
			visible3,
			handleModal1(e) {
				visible1.value = !visible1.value;
			},
			handleModal2(e) {
				visible2.value = !visible2.value;
			},
			async handleModal3(e) {
				await Portal.popup({});
			},
			handleModal4() {
				Modal.warning({
					title: 'warning',
					content: () => {
						return h('input', {
							type: 'textarea',
						});
					},
					okText: '啦啦啦啦',
					mask: true,
					closeWithCancel: true,
					maskClosable: true,
					portalClassName: 'is-padding-none',
					// draggable: true,
					onOk: (e) => {
						return new Promise((resolve, reject) => {
							setTimeout(() => {
								resolve();
							}, 1000);
						});
					},
					onCancel: (e) => {
						setTimeout(() => {
							console.log('cancel');
						});
						return false;
					},

					onClose: () => {
						console.log('关闭后都会触发');
					}
				});
			},
			handleClose() {
				console.log('关闭后都会触发');
			},
			handleCancel() {
				console.log('点击取消这个按钮时回调');
			},
			handleOk(e) {
				return new Promise((resolve, reject) => {
					setTimeout(() => {
						hasReject 
							? resolve()
							: (reject(), (hasReject = true));
					}, 1000);
				}).catch(err => {
					return Promise.reject(err);
				});
			}
		};
	}
});
</script>
