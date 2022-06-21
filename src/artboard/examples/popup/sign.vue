<template>
	<vc-modal
		v-model="isActive"
		title="签名"
		size="large"
		@cancel="handleCancel"
		@ok="handleOk"
	>
		<vc-artboard 
			ref="artboard" 
			:options="{ strokeStyle: 'red', shadowColor: 'red' }"
			:width="300"
			:height="200"
		/>
	</vc-modal>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import VcArtboard from '../..';
import VcModal from '../../../modal';

const emit = defineEmits(['portal-rejected', 'portal-fulfilled']);

const isActive = ref(false);

const artboard = ref(null);

const handleCancel = () => {
	emit('portal-rejected');
};
const handleOk = async () => {
	isActive.value = false;
	emit('portal-fulfilled');
};

onMounted(() => {
	isActive.value = true;
});
</script>
<style lang='scss'>

</style>