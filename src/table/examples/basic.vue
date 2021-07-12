<template>
	<div style="padding: 30px">
		<h1>Basic</h1>
		<vc-table 
			:height="500"
			:data-source="dataSource"
			:default-sort="defaultSort"
			@sort-change="handleSort"
		>
			<vc-table-item>
				<vc-table-column
					fixed="left"
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
					label="姓名2"
				>
					<template #default="{ row }">
						<div>{{ row.name }}</div>
					</template>
				</vc-table-column>
			</vc-table-item>
		</vc-table>
	</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { random } from 'lodash';
import Table from '..';

export default defineComponent({
	components: {
		'vc-table': Table,
		'vc-table-column': Table.Column,
		'vc-table-item': Table.Item
	},
	setup(props, context) {
		const defaultSort = ref({ prop: 'date', order: 'descending' });
		const filters = ref([
			{ label: '代理升级', value: 1 },
			{ label: '代理加入', value: 2, disabled: true }
		]);

		const filteredValue = ref([]);

		const dataSource = ref([
			{
				id: 1,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}, 
			{
				id: 2,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}, 
			{
				id: 3,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			},
			{
				id: 4,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			},
			{
				id: 5,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}, 
			{
				id: 6,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}, 
			{
				id: 7,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			},
			{
				id: 8,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			},
			{
				id: 9,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}, 
			{
				id: 10,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}, 
			{
				id: 11,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			},
			{
				id: 12,
				date: `${new Date().getTime()}`,
				name: `代号 - ${random(0, 10000)}`,
				address: `祥园路${random(0, 10000)}号`,
			}
		]);

		return {
			defaultSort,
			filters,
			filteredValue,
			dataSource,
			handleSort(sortInfo) {
				defaultSort.value = sortInfo;
			},
			handleFilter(value) {
				filteredValue.value = value;
			}
		};
	}
});
</script>