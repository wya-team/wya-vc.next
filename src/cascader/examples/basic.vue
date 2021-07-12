<template>
	<div style="margin: 40px">
		<vc-button @click="handleTestingStart">
			内存测试
		</vc-button>
		<vc-button @click="handleTestingEnd">
			取消测试
		</vc-button>
		<div style="margin: 40px 0 ">
			<vc-cascader 
				v-model="value1" 
				:data-source="bigData"
				clearable
				@change="handleChange"
			>
				<template #default="{ label, value }"> 
					<div>
						{{ label }}, {{ value }}
					</div>
				</template>
			</vc-cascader>
		</div>
		<div style="margin: 40px 0 ">
			<vc-cascader v-model="value2" :data-source="dataSource" clearable />
		</div>
		<div style="margin: 40px 0 ">
			<vc-cascader v-model="valueAlone" :data-source="dataSourceAlone" clearable />
		</div>
		<div style="margin: 40px 0 ">
			<vc-cascader v-model="value3" :data-source="dataAsyncSource1" clearable />
		</div>
		<div style="margin: 40px 0 ">
			<vc-cascader v-model="value4" :data-source="dataAsyncSource2" :load-data="loadData" clearable />
		</div>
		<!-- form -->
		<div style="margin: 40px 0 ">
			<vc-form 
				ref="form" 
				:model="formValidate" 
				:rules="ruleValidate" 
				:label-width="196"
				position="left"
				@submit.prevent
			>
				<vc-form-item label="设置1：" prop="value">
					<vc-cascader v-model="formValidate.value" :data-source="dataSource" clearable />
				</vc-form-item>
				<vc-form-item label="设置2：" prop="value1">
					<vc-cascader v-model="formValidate.value1" :data-source="dataSource" clearable />
				</vc-form-item>
			</vc-form>
		</div>
	</div>
</template>
<script>
import { defineComponent, ref, reactive } from 'vue';
import Cascader from '../cascader';
import $bigData from './basic/big-data';
import Button from '../../button';
import Form from '../../form';

export default defineComponent({
	name: "vc-cascader-basic",
	components: {
		"vc-cascader": Cascader,
		'vc-button': Button,
		'vc-form': Form,
		'vc-form-item': Form.Item,
	},

	setup() {
		const value1 = ref([1, 110000, 110100, 110101]);
		const value2 = ref([]);
		const value3 = ref(['jiangsu', 'nanjing']);
		const value4 = ref([]);
		const valueAlone = ref([]);
		const bigData = ref($bigData);
		const dataSource = ref([
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
		const dataSourceAlone = ref([
			{
				value: 'beijing',
				label: '北京'
			},
			{
				value: 'suzhou',
				label: '苏州'
			}
		]);

		const dataAsyncSource1 = ref([]);
		const dataAsyncSource2 = ref([
			{
				value: 'beijing',
				label: '北京',
				children: []
			}
		]);
		const formValidate = reactive({
			value: ['beijing', 'gugong'],
			value1: [],
			value2: []
		});
		const ruleValidate = reactive({
			value: [
				{
					required: true,
					trigger: 'change',
				}
			],
			value1: [
				{
					required: true,
					trigger: 'change'
				}
			]
		});

		setTimeout(() => {
			dataAsyncSource1.value = dataSource.value;
		}, 2000);

		let timer;
		return {
			value1,
			value2,
			value3,
			value4,
			valueAlone,
			bigData,
			dataSource,
			dataSourceAlone,
			dataAsyncSource1,
			dataAsyncSource2,
			formValidate,
			ruleValidate,
			handleTestingStart() {
				clearInterval(timer);
				timer = setInterval(() => {
					document.querySelector('.vc-cascader input').click();
				}, 50);
				// Message.info(Math.random().toString(), { mask: false, duration: 110000 });
			},
			handleTestingEnd() {
				clearInterval(timer);
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
			handleChange(v, l) {
				console.log(v, l);
			}
		};
	}
});
</script>
