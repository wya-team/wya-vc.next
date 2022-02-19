<template>
	<vc-table-item>
		<vc-table-column
			fixed="left"
			prop="date"
			:label="label"
			sortable
			:filters="filters"
			:filtered-value="filteredValue"
			:filter-multiple="true"
			:filter="handleFilter"
			min-width="180"
		/>
		<vc-table-column
			prop="name"
			label="姓名"
			width="180"
			sortable
		/>
		<vc-table-column
			prop="address"
			label="地址"
			width="180"
		/>
		<vc-table-column
			prop="date"
			label="日期"
			sortable
			:filters="filters"
			:filtered-value="filteredValue"
			:filter-multiple="true"
			:filter="handleFilter"
			min-width="180"
		/>
		<vc-table-column
			prop="name"
			label="姓名"
			width="180"
			sortable
		/>
		<vc-table-column
			prop="address"
			label="地址"
			width="180"
		/>
		<vc-table-column
			fixed="right"
			prop="name2"
			label="姓名"
		>
			<template #default="{ row }">
				<div>{{ row.name }}</div>
			</template>
		</vc-table-column>
	</vc-table-item>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { random } from 'lodash';
import Table from '../..';

export default defineComponent({
	components: {
		'vc-table-item': Table.Item,
		'vc-table-column': Table.Column,
	},
	setup(props, context) {
		const defaultSort = ref({ prop: 'date', order: 'descending' });
		const filters = ref([
			{ label: '代理升级', value: 1 },
			{ label: '代理加入', value: 2, disabled: true }
		]);

		const label = ref('日期');
		const filteredValue = ref([]);

		return {
			label,
			filters,
			filteredValue,
			handleFilter(value) {
				filteredValue.value = value;

				label.value = Math.random().toString();
			}
		};
	}
});
</script>