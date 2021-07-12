<template>
	<vcm-popup 
		v-model="isVisible" 
		:placement="param.placement" 
		class="vc-popup-basic-tip"
		@visible-change="handleChange"
	>
		<div @click="handleClose">
			点击关闭
		</div>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip <br>
		tip2 <br>
	</vcm-popup>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'; 
import MPopup from '../../index.m';
import Portal from '../../../portal/index';

const wrapperComponent = defineComponent({
	name: 'vc-popup-basic-tip',
	components: {
		'vcm-popup': MPopup
	},
	props: {
		param: Object
	},
	emits: ['portal-fulfilled'],
	setup(props, { emit }) {
		const isVisible = ref(false);
		onMounted(() => {
			isVisible.value = true;
		});

		return {
			isVisible,
			handleClose() {
				isVisible.value = false;
			},
			handleChange(v) {
				emit('portal-fulfilled');
			}
		};
	}
});

export default wrapperComponent;

export const Tip = new Portal(wrapperComponent, {});

</script>

<style lang="scss">

</style>
