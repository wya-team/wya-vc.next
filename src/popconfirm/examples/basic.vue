<template>
	<div style="padding: 200px">
		<vc-popconfirm
			v-model="visible"
			:trigger="trigger"
			title="Are you sure to delete this task?"
			type="info"
			@close="handleClose"
			@visible-change="handleChange"
			@cancel="handleCancel"
			@ok="handleOk"
		>
			<vc-button type="primary">
				点我
			</vc-button>
			<template #content>
				<div>222</div>
			</template>
		</vc-popconfirm>

		<vc-button @click="handleVisible">
			外部点击
		</vc-button>
		<vc-button @click="handleTrigger">
			{{ trigger }}
		</vc-button>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Popconfirm from '..';
import Button from '../../button/index';

export default defineComponent({
	name: "vc-popconfirm-baisc",
	components: {
		'vc-popconfirm': Popconfirm,
		'vc-button': Button
	},

	setup() {
		const visible = ref(false);
		const trigger = ref('hover');

		let wait;
		let timer;
		return {
			visible,
			trigger,
			/**
			 * 事件冒泡上来了
			 */
			handleVisible() {
				/**
				 * click模式下，this.visible会一直拿到false
				 */
				if (!wait) {
					visible.value = !visible.value;
				}
			},
			handleClose() {
				console.log('关闭后都会触发');
				wait = 1;
				timer = setTimeout(() => {
					wait = 0;
				}, 200);
			},
			handleCancel() {
				console.log('点击取消这个按钮时回调');
			},
			handleOk(e) {
				return new Promise((resolve, reject) => {
					setTimeout(reject, 1000);
				});
			},
			handleTrigger() {
				trigger.value = trigger.value === 'hover' ? 'click' : 'hover'; 
			},
			handleChange(v) {
				console.log('visible-change', v);
			}
		};
	}
});
</script>
