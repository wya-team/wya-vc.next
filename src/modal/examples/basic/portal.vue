<template>
	<vc-modal
		ref="target"
		v-model="isVisible"
		title="title2"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<p v-for="i in items" :key="i"> 
			每2秒后高度随机变化 {{ data }} 
		</p>
	</vc-modal>
</template>

<script>
import { defineComponent, onMounted, ref, onUnmounted } from 'vue';
import Modal from '../..';
import PortalCtor from '../../../portal/index';

const wrapper = defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-modal': Modal
	},
	props: {
		data: Object
	},
	emits: ['portal-fulfilled', 'portal-rejected'],
	setup(props, { emit }) {
		let target = ref(null);
		let isVisible = ref(false);
		let items = ref([1]);
		let timer;

		onMounted(() => {
			isVisible.value = true;
			timer = setInterval(() => {
				items.value = Array.from({ length: Math.ceil(Math.random() * 30) + 20 }, (e, i) => i);
				target.value?.resetOrigin();
			}, 2000);
		});

		onUnmounted(() => {
			clearInterval(timer);
		});

		return {
			target,
			isVisible,
			items,
			/**
			 * v-model会默认被触发，要由该组件控制，给组件i-modal传值 loading: true
			 */
			handleOk() {
				emit('portal-fulfilled');
			},
			handleCancel() {
				emit('portal-rejected');
			}
		};
	}
});

export default wrapper;
export const Portal = new PortalCtor(wrapper, {});
</script>
