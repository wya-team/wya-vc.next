<template>
	<div style="margin-top: 30px;">
		<vcm-cascader
			v-model="value"
			:data-source="dataSource"
			:load-data="loadData"
		/>
		<vcm-cascader
			v-model="value2"
			extra="带有头部"
			header
			:data-source="region"
			:load-data="loadData"
			@change="handelChange"
		/>
		<br>
		<br>
		<div @click="handleClick">
			直接调用
		</div>
		<br>
		<br>
		<vcm-cascader-view
			ref="target"
			v-model="value1"
			:data-source="dataSource2"
			:load-data="loadData"
			@complete="handleComplete"
		/>
	</div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import MCascader from '../index.m';
import $dataSource from './basic/big-data';

export default defineComponent({
	name: 'cascader-picker-basic',
	components: {
		'vcm-cascader': MCascader,
		'vcm-cascader-view': MCascader.View,
	},
	setup() {
		const target = ref(null);
		const dataSource = ref([]);
		const dataSource2 = ref([
			{
				value: 'beijing',
				label: '北京',
				children: [
					{
						value: 'gugong',
						label: '故宫'
					},
					{
						value: 'tiantan',
						label: '天坛'
					},
					{
						value: 'wangfujing',
						label: '王府井'
					}
				]
			}, 
			{
				value: 'jiangsu',
				label: '江苏',
				children: [
					{
						value: 'nanjing',
						label: '南京',
						children: [
							{
								value: 'fuzimiao',
								label: '夫子庙',
							}
						]
					},
					{
						value: 'suzhou',
						label: '苏州'
					}
				],
			}
		]);

		const value = ref([]);
		const value1 = ref([]);
		const region = ref([]);
		const value2 = ref([]);

		onMounted(() => {
			window.vm = target.value;

			setTimeout(() => {
				value1.value = ['jiangsu', 'nanjing'];
			}, 5000);

			region.value = [];
			let chinaData = {
				label: '中国',
				value: 'china',
				children: []
			};
			let overseaData = {
				label: '海外地区',
				value: 'oversea',
				children: []
			};
			dataSource.value.forEach(item => {
				if (item.value === 1) {
					chinaData.children.push(...item.children);
				} else {
					overseaData.children.push(item);
				}
			});
			region.value = [chinaData, overseaData];
		});

		return {
			target,
			dataSource,
			dataSource2,
			value,
			value1,
			region,
			value2,
			handelChange(val) {
				console.log(val);
			},
			loadData() {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve([
							{
								value: 'gugong',
								label: '故宫'
							},
							{
								value: 'tiantan',
								label: '天坛'
							},
							{
								value: 'wangfujing',
								label: '王府井'
							}
						]);
					}, 2000);
				});
			},
			handleClick() {
				MCascader.open({
					dataSource: dataSource2.value,
					value: ['jiangsu', 'nanjing']
				});
			},
			handleComplete() {
				console.log(arguments);
			}
		};
	}
});
</script>