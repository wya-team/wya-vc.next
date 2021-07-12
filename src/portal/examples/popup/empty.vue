<template>
	<div>
		<component :is="renderTitle" />
		<div @click="handleOk">
			确定
		</div>
		<div @click="handleCancel">
			取消
		</div>
	</div>
</template>
<script lang="tsx">
import { defineComponent, onUnmounted } from 'vue';
import Portal from '../..';

const wrapperComponent = defineComponent({
	name: "vc-tpl-basic",
	props: {
		title: String
	},
	emits: ['portal-fulfilled', 'portal-rejected'],
	setup(props) {
		return {
			handleOk(e) {
				this.$emit('portal-fulfilled', { status: 1, title: props.title });
			},
			handleCancel(e) {
				this.$emit('portal-rejected', { status: 0, title: props.title });
			},
			renderTitle() {
				return (
					<h1>{ props.title }</h1>
				);
			}
		};
	}
});

export default wrapperComponent;
export const Empty = new Portal(wrapperComponent, {

});
</script>
