<template>
	<component :is="tag">
		<div style="position: relative" @click="handleToggle">
			<slot />
			<slot :is-expend="isActive" name="icon" />
		</div>
		<vc-expand 
			v-model="isActive" 
			:remove="remove"
		>
			<div>
				<slot name="content" />
			</div>
		</vc-expand>
	</component>
</template>
<script lang="ts">
import { defineComponent, ref, inject, computed, getCurrentInstance, onBeforeMount, onBeforeUnmount } from 'vue';
import Icon from '../icon/index';
import Expand from '../expand/index';

export default defineComponent({
	name: "vc-collapse-item",
	components: {
		'vc-icon': Icon,
		'vc-expand': Expand
	},
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		name: {
			type: String
		},
	},
	setup(props) {
		const instance = getCurrentInstance();
		const isActive = ref(false);
		const index = ref();

		const collapse = inject('collapse');

		const handleToggle = () => {
			collapse.toggle({
				name: props.name || index.value,
				isActive: isActive.value
			});
		};

		const remove = computed(() => {
			return collapse.props.remove;
		});

		onBeforeMount(() => {
			collapse.add?.(instance);
		});

		onBeforeUnmount(() => {
			collapse.remove?.(instance);
		});

		return {
			index,
			remove,
			isActive,
			handleToggle
		};
	}
});
</script>