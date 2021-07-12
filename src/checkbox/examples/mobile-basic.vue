<template>
	<div>
		<vcm-checkbox v-model="single">
			{{ single }}
		</vcm-checkbox>
		<vcm-checkbox-group v-model="social">
			<vcm-checkbox label="twitter">
				<span>Twitter</span>
			</vcm-checkbox>
			<vcm-checkbox label="facebook">
				<span>Facebook</span>
			</vcm-checkbox>
			<vcm-checkbox label="github" disabled>
				<span>Github</span>
			</vcm-checkbox>
			<vcm-checkbox label="snapchat" disabled>
				<span>Snapchat</span>
			</vcm-checkbox>
		</vcm-checkbox-group>
		<vcm-checkbox-group v-model="fruit">
			<vcm-checkbox label="香蕉" />
			<vcm-checkbox label="苹果" />
			<vcm-checkbox label="西瓜" />
		</vcm-checkbox-group>

		<!-- indeterminate -->
		<div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
			<vcm-checkbox
				:indeterminate="indeterminate"
				:model-value="checkAll"
				@click.prevent="handleCheckAll"
			>
				全选
			</vcm-checkbox>
		</div>
		<vcm-checkbox-group v-model="checkAllGroup" @change="handleChange">
			<vcm-checkbox label="香蕉" />
			<vcm-checkbox label="苹果" />
			<vcm-checkbox label="西瓜" />
		</vcm-checkbox-group>
	</div>
</template>
<script>
import { defineComponent, onUpdated, ref } from 'vue';
import Checkbox from '../index.m';

export default defineComponent({
	name: "vcm-tpl-basic",
	components: {
		'vcm-checkbox': Checkbox,
		'vcm-checkbox-group': Checkbox.Group,
	},

	setup() {
		const single = ref(true);
		const social = ref(['facebook', 'github']);
		const fruit = ref(['苹果']);

		const indeterminate = ref(true);
		const checkAll = ref(false);
		const checkAllGroup = ref(['香蕉', '西瓜']);

		onUpdated(() => {
			console.log({
				single: single.value,
				social: social.value,
				fruit: fruit.value,
				checkAll: checkAll.value
			});
		});
		return {
			single,
			social,
			fruit,
			indeterminate,
			checkAll,
			checkAllGroup,
			handleCheckAll() {
				if (indeterminate.value) {
					checkAll.value = false;
				} else {
					checkAll.value = !checkAll.value;
				}
				indeterminate.value = false;

				if (checkAll.value) {
					checkAllGroup.value = ['香蕉', '苹果', '西瓜'];
				} else {
					checkAllGroup.value = [];
				}
			},
			handleChange(data) {
				if (data.length === 3) {
					indeterminate.value = false;
					checkAll.value = true;
				} else if (data.length > 0) {
					indeterminate.value = true;
					checkAll.value = false;
				} else {
					indeterminate.value = false;
					checkAll.value = false;
				}
			}
		};
	}
});
</script>
