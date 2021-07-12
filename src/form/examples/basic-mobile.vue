<template>
	<vcm-form 
		ref="form"
		:model="formValidate" 
		:rules="ruleValidate"
		:label-width="96"
		style="padding-left: 56px; margin-top: 21px"
		@submit.prevent
	>
		<vcm-form-item prop="input1" label="input：">
			<input v-model="formValidate.input1" style="width: 300px">
		</vcm-form-item>
		<vcm-form-item>
			<vcm-form-item prop="input2" label="嵌套input：">
				<input v-model="formValidate.input2" style="width: 300px">
			</vcm-form-item>
		</vcm-form-item>
		<vcm-form-item prop="array" label="array：">
			<vcm-array v-model="formValidate.array" />
		</vcm-form-item>
		<template
			v-for="(item, index) in formValidate.items"
			:key="item.id"
		>
			<vcm-form-item 
				:label="'Item ' + item.index + '：'"
				:prop="'items.' + index + '.value'"
				:rules="{
					required: true, 
					message: 'Item ' + item.index +' can not be empty', 
					trigger: 'change'
				}"
			>
				<vcm-tpl 
					v-model="item.value" 
					type="text" 
					placeholder="Enter something..."
				>
					<span @click="handleRemove(index)">Delete - {{ index }}</span>
				</vcm-tpl>
			</vcm-form-item>
		</template>
		<vcm-form-item>
			<div @click="handleAdd">
				Add item
			</div>
		</vcm-form-item>
		<vcm-form-item>
			<vcm-button type="primary" @click="handleSubmit">
				Submit
			</vcm-button>
			<vcm-button style="margin-left: 8px" @click="handleReset">
				Reset
			</vcm-button>
			<vcm-button style="margin-left: 8px" @click="handleSort">
				乱序
			</vcm-button>
			<vcm-button style="margin-left: 8px" @click="handleOnly">
				独立验证
			</vcm-button>
		</vcm-form-item>
	</vcm-form>
</template>
<script>
import { ref, reactive, toRefs, onMounted, watchEffect } from 'vue';
import { shuffle } from 'lodash';
import MForm from '../index.m';
import { getUid } from '../../utils/index';
import Tpl from './basic/tpl'; // 可以使用trigger
import FakeArray from './basic/array'; // 可以使用trigger
import Button from '../../button';

export default {
	name: "vcm-tpl-basic",
	components: {
		'vcm-form': MForm,
		'vcm-form-item': MForm.Item,
		'vcm-tpl': Tpl,
		'vcm-array': FakeArray,
		'vcm-button': Button,
	},
	setup() {
		const form = ref(null);
		const formValidate = reactive({
			input1: '',
			input2: '',
			array: [],
			items: [
				{
					id: getUid(),
					value: '',
					index: 1
				}
			]
		});

		const ruleValidate = reactive({

		});

		watchEffect(() => console.log('*.input1', formValidate.input1));
		watchEffect(() => console.log('*.input2', formValidate.input2));
		watchEffect(() => console.log('*.array', formValidate.array));

		let refs = {};
		let index = 1;
		return {
			form,
			formValidate,
			ruleValidate,
			async handleSubmit(name) {
				try {
					await form.value?.validate();
				} catch (e) {
					console.log(e);
				}
			},

			handleOnly(name) {
				form.value?.validateField('items.0.value', { scroll: true }).then(() => {

				}).catch((error) => {
					console.log(error);
				});
			},

			handleReset(name) {
				form.value?.resetFields();
			},

			handleAdd() {
				index++;

				formValidate.items.push({
					id: getUid(),
					value: '',
					status: 1,
					index
				});
			},

			handleRemove(i) {
				formValidate.items.splice(i, 1);
			},

			handleSort(i) {
				formValidate.items = shuffle(formValidate.items);
			}
		};
	}
};
</script>
