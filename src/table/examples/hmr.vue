<template>
	<div style="padding: 30px">
		<h1>hmr 排查热更新溢出情况</h1>
		<vc-table 
			:height="500"
			:data-source="dataSource"
			:default-sort="defaultSort"
			@sort-change="handleSort"
		>
			<vc-item />
		</vc-table>
	</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { random } from 'lodash';
import Item from './develop/item';
import Table from '..';

export default defineComponent({
	components: {
		'vc-table': Table,
		'vc-item': Item
	},
	setup(props, context) {
		const defaultSort = ref({ prop: 'date', order: 'descending' });
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
			dataSource,
			handleSort(sortInfo) {
				defaultSort.value = sortInfo;
			}
		};
	}
});
</script>