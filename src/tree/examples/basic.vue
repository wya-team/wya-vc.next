<template>
	<div>
		<vc-button @click="lazy = !lazy">
			lazy {{ lazy }}
		</vc-button>
		<vc-button @click="checkStrictly = !checkStrictly">
			单选独立 {{ checkStrictly }}
		</vc-button>
		<vc-tree 
			:key="lazy"
			v-model="value"
			:data-source="data" 
			:load-data="loadData"
			:lazy="lazy"
			:check-strictly="checkStrictly"
			:render-content="renderContent"
			show-checkbox 
			accordion
			draggable
			default-expand-all
			@check-change="handleCheckChange"
		/>
		<vc-tree-select 
			v-model="value"
			:data-source="data"
			:check-strictly="checkStrictly"
			clearable
		/>

		<vc-tree-select 
			v-model="valueAsync"
			:data-source="dataAsync"
			:check-strictly="checkStrictly"
			clearable
		/>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref, onMounted, reactive } from 'vue';
import { random, cloneDeep } from 'lodash';
import Tree from '..';
import Button from '../../button';

const DEFAULT_DATA = [
	{
		value: '1',
		label: '一级 1',
		children: [
			{
				value: '1-1',
				label: '二级 1-1',
				children: [
					{
						value: '1-1-1',
						label: '三级 1-1-1',
						isLeaf: true // 已经是叶子节点
					}
				]
			}
		]
	}, 
	{
		value: '2',
		label: '一级 2',
		children: [
			{
				value: '2-1',
				label: '二级 2-1',
				children: [
					{
						value: '2-1-1',
						label: '三级 2-1-1'
					}
				]
			}, 
			{
				value: '2-2',
				label: '二级 2-2',
				children: [
					{
						value: '2-2-1',
						label: '三级 2-2-1'
					}
				]
			}
		]
	}, 
	{
		value: '3',
		label: '一级 3',
		children: [
			{
				value: '3-1',
				label: '二级 3-1',
				children: [
					{
						value: '3-1-1',
						label: '三级 3-1-1'
					}
				]
			}, 
			{
				value: '3-2',
				label: '二级 3-2',
				children: [
					{
						value: '3-2-1',
						label: '三级 3-2-1'
					}
				]
			}
		]
	}, 
	{
		value: '4',
		label: '一级 4',
		children: []
	}
];
export default defineComponent({
	name: "vc-tree-basic",
	components: {
		'vc-tree': Tree,
		'vc-tree-select': Tree.Select,
		'vc-button': Button,
	},
	setup() {
		const lazy = ref(true);
		const checkStrictly = ref(false);
		const value = ref([]);
		const data = ref(DEFAULT_DATA);
		const valueAsync = ref([]);
		const dataAsync = ref([]);

		onMounted(() => {
			setTimeout(() => {
				valueAsync.value = ['1'];
			}, random(100, 300));	

			setTimeout(() => {
				dataAsync.value = cloneDeep(data.value);
			}, random(100, 300));
		});

		return {
			lazy,
			checkStrictly,
			value,
			data,
			valueAsync,
			dataAsync,

			loadData(parent) {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve([
							{
								value: '4-1',
								label: '二级 4-1',
								children: [
									{
										value: '4-1-1',
										label: '三级 4-1-1'
									}
								],
							}, 
							{
								value: '4-2',
								label: '二级 4-2',
								isLeaf: true
							}, 
							{
								value: '4-3',
								label: '二级 4-3'
							}
						]);
					}, 3000);
				});
			},

			handleCheckChange($data, checked, indeterminate) {
				console.log($data, checked, indeterminate);
			},

			renderContent(props) {
				return (
					<span>{props.it.label} { props.it.value }</span>
				);
			}
		};
	}
});
</script>
