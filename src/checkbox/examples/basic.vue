<template>
	<div>
		<vc-checkbox v-model="single">
			{{ single }}
		</vc-checkbox>
		<vc-checkbox-group v-model="social">
			<vc-checkbox label="twitter">
				<span>Twitter</span>
			</vc-checkbox>
			<vc-checkbox label="facebook">
				<span>Facebook</span>
			</vc-checkbox>
			<vc-checkbox label="github" disabled>
				<span>Github</span>
			</vc-checkbox>
			<vc-checkbox label="snapchat" disabled>
				<span>Snapchat</span>
			</vc-checkbox>
		</vc-checkbox-group>
		<vc-checkbox-group v-model="fruit">
			<vc-checkbox label="香蕉" />
			<vc-checkbox label="苹果" />
			<vc-checkbox label="西瓜" />
		</vc-checkbox-group>

		<!-- indeterminate -->
		<div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
			<vc-checkbox
				:indeterminate="indeterminate"
				:model-value="checkAll"
				@click.prevent="handleCheckAll"
			>
				全选
			</vc-checkbox>
		</div>
		<vc-checkbox-group v-model="checkAllGroup" @change="handleChange">
			<vc-checkbox label="香蕉" />
			<vc-checkbox label="苹果" />
			<vc-checkbox label="西瓜" />
		</vc-checkbox-group>
	</div>
</template>
<script>
import { defineComponent, onUpdated, ref } from 'vue';
import Checkbox from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-checkbox': Checkbox,
		'vc-checkbox-group': Checkbox.Group,
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
