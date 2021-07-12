<template>
	<vc-transition-collapse :duration="{ enter: 0.2, leave: 0.2 }">
		<component :is="tag" v-show="isActive">
			<!-- 是否删除节点 -->
			<slot v-if="!remove || (remove && isActive)" />
		</component>
	</vc-transition-collapse>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import { VcInstance } from '../vc/index';
import Transition from '../transition/index';

export default defineComponent({
	name: "vc-expand",
	components: {
		'vc-transition-collapse': Transition.Collapse
	},
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		modelValue: {
			type: Boolean,
			default: false
		},
		remove: {
			type: Boolean,
			default: false
		},
	},
	setup(props) {
		const isActive = ref(false);
		// const externalExpand = inject('vc-expand');

		watch(
			() => props.modelValue,
			(v) => {
				isActive.value = v;
				
				// TODO: 目前@wya/ps移除，跨组件通信
				// VcInstance.emit('vc-expand', { visible: v });
			},
			{ immediate: true }
		);

		return { isActive };
	}
});
</script>
