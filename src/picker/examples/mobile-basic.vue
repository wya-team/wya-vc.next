<template>
	<div class="vcm-picker-basic" style="height: 100%; overflow: auto;">
		<!-- 使用v-model -->
		<vcm-picker
			v-model="value"
			:data-source="dataSource" 
			:cascade="true" 
			:cols="3"
			@change="handleChange" 
		/>
		<br>
		<br>
		<br>
		<!-- 不使用v-model -->
		<vcm-picker
			:data-source="dataSource" 
			:cascade="true" 
			:cols="3" 
		/>
		<br>
		<br>
		<br>
		<!-- 自定义展示 -->
		<vcm-picker
			v-model="valueAsync" 
			:data-source="dataAsyncSource" 
			:cascade="true"
			:cols="3"
			:load-data="loadData"
		>
			<template #default="it">
				<h2>
					{{ it.label }}
				</h2>
			</template>
		</vcm-picker>
		<br>
		<br>
		<vcm-picker
			v-model="value"
			:data-source="dataAsyncSource1" 
			:cascade="true" 
			:cols="3" 
		/>
		<br>
		<!-- 非联动选择 -->
		<vcm-picker
			v-model="valueSeasons" 
			:data-source="dataSeasons" 
			:cascade="false"
			:cols="2"
			extra="非联动选择"
		/>
		<br>
		<br>
		<br>
		<h3 @click="handleClick">
			点击直接调用(空数据)
		</h3>
		<h3 @click="handleClick1">
			点击直接调用（默认数据）
		</h3>
		<br>
		<br>
		<br>
		<!-- 表单 -->
		<h2>表单</h2>
		<vcm-form
			ref="form"
			:show-message="true"
			:model="formValidate" 
			:rules="ruleValidate"
			@submit.prevent
		>
			<vcm-form-item prop="addr" label="选择">
				<vcm-picker
					v-model="formValidate.addr" 
					:data-source="dataSource" 
					:cascade="true" 
					:cols="3"
				/>
			</vcm-form-item>
			<vcm-form-item>
				<vcm-button @click="handleSubmit">
					提交表单
				</vcm-button>
			</vcm-form-item>
		</vcm-form>

		<vcm-picker-view 
			v-model="formValidate.addr" 
			:data-source="dataSource" 
			:cascade="true" 
			:cols="3"
		/>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
	</div>
</template>
<script>
import { defineComponent, ref, reactive, onMounted } from 'vue';
import { cloneDeep } from 'lodash';
import Form from '../../form/index.m';
import MToast from '../../toast/index.m';
import Button from '../../button/index.m';
import MPicker from '../index.m';
import { cascadeData, seasons } from './basic/mock';

export default defineComponent({
	name: "vcm-picker-basic",
	components: {
		'vcm-picker': MPicker,
		'vcm-picker-view': MPicker.View,
		'vcm-form': Form,
		'vcm-form-item': Form.Item,
		'vcm-button': Button,
	},
	setup(props, context) {
		const form = ref(null);
		const show = ref(false);
		const dataSource = ref(cloneDeep(cascadeData));
		const dataAsyncSource = ref([]);
		const dataAsyncSource1 = ref([]);
		const value = ref(["330000", "330100", "330105"]);
		const valueAsync = ref(["330000", "330100", "330105"]);
		const valueView = ref(["330000", "330100", "330105"]);
		const valueSeasons = ref([]);
		const dataSeasons = ref(cloneDeep(seasons));

		const formValidate = reactive({
			addr: [],
		});

		const ruleValidate = reactive({
			addr: [
				{ 
					required: true, 
					type: 'array', 
					message: '请选择地址', 
					trigger: 'change' 
				}
			],
		});

		onMounted(() => {
			setTimeout(() => {
				dataAsyncSource1.value = cloneDeep(cascadeData);
			}, 3000);
		});

		const loadData = () => {
			MToast.info('异步加载中');
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					dataAsyncSource.value = cloneDeep(cascadeData);
					resolve();
				}, 3000);
			});
		};

		const handleClick = () => {
			MPicker.open({
				dataSource: cloneDeep(cascadeData),
				value: [],
				cols: 3,
				title: '222',
				onOk: (v, label) => {
					MToast.info(label.join(','));
				},
				onCancel: () => {
					MToast.info('value');
				}
			});
		};

		const handleClick1 = () => {
			MPicker.open({
				dataSource: cloneDeep(cascadeData),
				value: ["330000", "330100", "330105"],
				cols: 3,
				onOk: (v, label) => {
					MToast.info(label.join(','));
				},
				onCancel: () => {
					MToast.info('value');
				}
			});
		};

		const handleChange = (v, label, selectData) => {
			console.log(value, label, selectData);
		};

		const handleSubmit = (name) => {
			form.value.proxy.validate()
				.then(() => {
					MToast.info('Success!');
				}).catch(() => {

				});
		};

		return {
			show,
			dataSource,
			dataAsyncSource,
			dataAsyncSource1,
			value,
			valueAsync,
			valueView,
			valueSeasons,
			dataSeasons,

			formValidate,
			ruleValidate,

			handleChange,
			handleClick1,
			handleClick,
			handleSubmit,
			loadData
		};
	}
});

</script>