<template>
	<div style="margin: 40px;">
		<vc-button @click="handleTestingStart">
			内存测试
		</vc-button>
		<vc-button @click="handleTestingEnd">
			取消测试
		</vc-button>
		<vc-button @click="disabled = !disabled">
			disabled: {{ disabled }}
		</vc-button>

		<!-- 基本 -->
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="value1"
				:disabled="disabled"
				clearable 
				search
				style="width: 200px"
				@change="handleChange"
				@ready="handleReady"
				@close="handleClose"
				@visible-change="handleVisibleChange"
			>
				<vc-option 
					v-for="(item, index) in cityList" 
					:key="item.value" 
					:value="item.value"
					:disabled="index == 1"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>

			<vc-select 
				v-model="value1"
				:data-source="cityList"
				:disabled="disabled"
				clearable 
				search
				style="width: 200px"
				@change="handleChange"
				@ready="handleReady"
				@close="handleClose"
				@visible-change="handleVisibleChange"
			/>
		</div>

		<!-- 基本分组 -->
		<div style="margin: 40px 0 ">
			<vc-select v-model="value1" style="width: 200px" search>
				<vc-option-group label="Hot Cities">
					<vc-option v-for="item in cityList1" :key="item.value" :value="item.value">
						{{ item.label }}
					</vc-option>
				</vc-option-group>
				<vc-option-group label="Other Cities">
					<vc-option v-for="item in cityList2" :key="item.value" :value="item.value">
						{{ item.label }}
					</vc-option>
				</vc-option-group>
			</vc-select>
		</div>

		<!-- 基本多选 -->
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="value2" 
				:max="5" 
				:disabled="disabled"
				style="width: 200px" 
				search
			>
				<vc-option-group label="Hot Cities">
					<vc-option v-for="item in cityList1" :key="item.value" :value="item.value">
						{{ item.label }}
					</vc-option>
				</vc-option-group>
				<vc-option-group label="Other Cities">
					<vc-option v-for="item in cityList2" :key="item.value" :value="item.value">
						{{ item.label }}
					</vc-option>
				</vc-option-group>
			</vc-select>
		</div>

		<!-- 搜索单选 -->
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="value3" 
				:load-data="handleSearch" 
				style="width: 200px"
				search
			>
				<vc-option 
					v-for="(item, index) in searchData" 
					:key="index" 
					:value="item.value"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
		</div>

		<!-- 搜索多选 -->
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="value4" 
				:max="5" 
				:load-data="handleSearch" 
				style="width: 200px"
				search
			>
				<vc-option-group v-if="searchData1.length" label="Hot Cities">
					<vc-option 
						v-for="(item, index) in searchData1" 
						:key="index" 
						:value="item.value"
					>
						{{ item.label }}
					</vc-option>
					<vc-option
						:filterable="false"
						value="不会被过滤"
						label="不会被过滤"
					/>
				</vc-option-group>
				<vc-option-group v-if="searchData2.length" label="Other Cities">
					<vc-option 
						v-for="(item, index) in searchData2" 
						:key="index" 
						:value="item.value"
					>
						{{ item.label }}
					</vc-option>
				</vc-option-group>
			</vc-select>
		</div>
		
		<!-- 基本异步 -->
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="value5"
				clearable 
				searchable
				search-placeholder="请输入"
				style="width: 200px"
			>
				<vc-option 
					v-for="(item, index) in cityListAsync" 
					:key="item.value" 
					:value="item.value"
					:disabled="index == 1"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
		</div>

		<!-- 基本异步value -->
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="valueAsync"
				clearable 
				searchable
				style="width: 200px"
			>
				<vc-option 
					v-for="(item, index) in cityList" 
					:key="item.value" 
					:value="item.value"
					:disabled="index == 1"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
		</div>

		<!-- form -->

		<vc-form 
			ref="form" 
			:model="formValidate" 
			:rules="ruleValidate" 
			:label-width="196"
			position="left"
			@submit.prevent
		>
			<vc-form-item label="设置单选：" prop="value">
				<vc-select
					v-model="formValidate.value"
					clearable
					style="width: 300px;"
				>
					<vc-option
						v-for="(item, index) in cityList"
						:key="index"
						:value="item.value"
					>
						{{ item.label }}
					</vc-option>
				</vc-select>
			</vc-form-item>
			<vc-form-item label="设置多选：" prop="value1">
				<vc-select
					v-model="formValidate.value1"
					:max="5"
					clearable
					style="width: 300px;"
				>
					<vc-option
						v-for="(item, index) in cityList"
						:key="index"
						:value="item.value"
					>
						{{ item.label }}
					</vc-option>
				</vc-select>
			</vc-form-item>

			<vc-form-item label="搜索设置单选：" prop="value1">
				<vc-select 
					v-model="value3" 
					:load-data="handleSearch" 
					style="width: 200px"
					searchable
				>
					<vc-option 
						v-for="(item, index) in searchData" 
						:key="index" 
						:value="item.value"
					>
						{{ item.label }}
					</vc-option>
				</vc-select>
			</vc-form-item>
		</vc-form>

		<!-- 清空数据和options时，currentLable 不会消失 -->
		<div style="margin: 40px 0 ">
			<p>清空数据和options时，currentLable 不会消失</p><br>
			<vc-select 
				v-model="formValidate.value3"
				clearable 
				search
				style="width: 200px"
				@change="handleClear"
			>
				<vc-option 
					v-for="(item) in cityList" 
					:key="item.value" 
					:value="item.value"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
			<vc-select 
				v-model="formValidate.value4"
				clearable 
				search
				style="width: 200px"
			>
				<vc-option 
					v-for="(item) in cityList" 
					:key="item.value" 
					:value="item.value"
				>
					{{ item.label }}
				</vc-option>
			</vc-select>
		</div>
		<div style="margin: 40px 0 ">
			<vc-select 
				v-model="formValidate.value4"
				clearable 
				search
				style="width: 200px"
				:data-source="cityTree"
			/>
		</div>
	</div>
</template>
<script>
import { defineComponent, ref, onMounted, reactive } from 'vue';
import Select from '..';
import Button from '../../button';
import Option from '../option';
import OptionGroup from '../option-group';
import Form from '../../form';

import { 
	cityList as $cityList, 
	cityList1 as $cityList1, 
	cityList2 as $cityList2, 
	searchData as $searchData,
	cityTree as $cityTree,
} from './basic/data';
import { VcInstance } from '../../vc/index';

window.vc = VcInstance;

export default defineComponent({
	name: "vc-select-basic",
	components: {
		'vc-select': Select,
		'vc-option-group': OptionGroup,
		'vc-option': Option,
		'vc-button': Button,
		'vc-form': Form,
		'vc-form-item': Form.Item
	},
	setup() {
		const form = ref(null);
		const disabled = ref(false);

		const cityList = ref($cityList);
		const cityList1 = ref($cityList1);
		const cityList2 = ref($cityList2);
		const cityTree= ref($cityTree);
		const value1 = ref(1);
		const extra1 = ref('');
		const value2 = ref(['1', '4']);
		const extra2 = ref([]);

		const value3 = ref('');
		const value4 = ref([]);
		const searchData = ref([]);
		const searchData1 = ref([]);
		const searchData2 = ref([]);

		const value5 = ref('1');
		const extra5 = ref('');
		const cityListAsync = ref([]);

		const valueAsync = ref('');

		const formValidate = reactive({
			value: '',
			value1: [],
			value2: '',
			value3: '',
			value4: ''
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

		onMounted(() => {
			setTimeout(() => {
				cityListAsync.value = $cityList;

				valueAsync.value = '1';
			}, 2000);
		});

		let timer;
		return {
			form,
			disabled,

			cityList,
			cityList1,
			cityList2,
			cityTree,
			value1,
			extra1,
			value2,
			extra2,

			value3,
			value4,
			searchData,
			searchData1,
			searchData2,

			value5,
			extra5,
			cityListAsync,

			valueAsync,
			formValidate,
			ruleValidate,
			handleClear(id) {
				if (!id) {
					formValidate.value4 = '';
					cityList.value = [];
				}
			},
			handleTestingStart() {
				clearInterval(timer);
				timer = setInterval(() => {
					document.querySelector('.vc-select input').click();
				}, 50);
			},
			handleTestingEnd() {
				clearInterval(timer);
				timer = null;
			},
			handleSearch() {
				return new Promise((resolve) => {
					setTimeout(() => {
						searchData.value = $searchData; 

						searchData1.value = $cityList1; 
						searchData2.value = $cityList2; 
						resolve();
					}, 1000);
				});
			},
			handleChange(v) {
				!timer && console.log(v);
			},
			handleReady() {
				!timer && console.log('ready');
			},
			handleClose() {
				!timer && console.log('close');
			},
			handleVisibleChange(v) {
				!timer && console.log('visible-change', v);
			}
		};
	}
});
</script>
