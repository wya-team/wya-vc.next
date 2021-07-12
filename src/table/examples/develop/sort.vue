<template>
	<div
		class="vc-table-sort"
		style="display: flex; align-items: center"
		@click="handleToggle"
	>
		<slot />
		<span style="display: flex; flex-direction: column;">
			<vc-icon
				:style="{ 'color': currentValue === 'ascending' ? 'blue' : '#ccc' }"
				style="margin-bottom: -2px"
				type="triangle-up"
				class="vc-table-sort__ascending"
			/>
			<vc-icon
				:style="{ 'color': currentValue === 'descending' ? 'blue' : '#ccc' }"
				style="margin-top: -2px"
				type="triangle-down"
				class="vc-table-sort__descending"
			/>
		</span>
	</div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
import Icon from '../../../icon';

export default defineComponent({
	name: 'vc-table-sort',
	components: {
		'vc-icon': Icon,
	},
	props: {
		modelValue: {
			type: String,
			default: 'none'
		}
	},
	setup(props, context) {
		const { emit } = context;
		const currentValue = ref('');

		watch(
			() => props.modelValue,
			(v) => {
				currentValue.value = v;
			},
			{ immediate: true }
		);

		const handleToggle = () => {
			currentValue.value = currentValue.value === 'ascending' ? 'descending' : 'ascending';
			emit('change', currentValue.value); 
		};

		return {
			currentValue
		};
	}
});
</script>

<style lang="scss">

</style>
