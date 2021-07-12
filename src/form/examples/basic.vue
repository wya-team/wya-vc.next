<template>
	<vc-form 
		ref="form"
		:model="formValidate" 
		:rules="ruleValidate"
		:label-width="96"
		style="padding-left: 56px; margin-top: 21px"
		@submit.prevent
	>
		<vc-form-item prop="input1" label="input：">
			<input v-model="formValidate.input1" style="width: 300px">
		</vc-form-item>
		<vc-form-item>
			<vc-form-item prop="input2" label="嵌套input：">
				<input v-model="formValidate.input2" style="width: 300px">
			</vc-form-item>
		</vc-form-item>
		<vc-form-item prop="array" label="array：">
			<vc-array v-model="formValidate.array" />
		</vc-form-item>
		<template
			v-for="(item, index) in formValidate.items"
			:key="item.id"
		>
			<vc-form-item 
				:label="'Item ' + item.index + '：'"
				:prop="'items.' + index + '.value'"
				:rules="{
					required: true, 
					message: 'Item ' + item.index +' can not be empty', 
					trigger: 'change'
				}"
			>
				<vc-tpl 
					v-model="item.value" 
					type="text" 
					placeholder="Enter something..."
				>
					<span @click="handleRemove(index)">Delete - {{ index }}</span>
				</vc-tpl>
			</vc-form-item>
		</template>
		<vc-form-item>
			<div @click="handleAdd">
				Add item
			</div>
		</vc-form-item>
		<vc-form-item>
			<vc-button type="primary" @click="handleSubmit">
				Submit
			</vc-button>
			<vc-button style="margin-left: 8px" @click="handleReset">
				Reset
			</vc-button>
			<vc-button style="margin-left: 8px" @click="handleSort">
				乱序
			</vc-button>
			<vc-button style="margin-left: 8px" @click="handleOnly">
				独立验证
			</vc-button>
		</vc-form-item>
	</vc-form>
</template>
<script>
import { ref, reactive, toRefs, onMounted, watchEffect } from 'vue';
import { shuffle } from 'lodash';
import Form from '..';
import { getUid } from '../../utils/index';
import Tpl from './basic/tpl'; // 可以使用trigger
import FakeArray from './basic/array'; // 可以使用trigger
import Button from '../../button';

export default {
	name: "vc-tpl-basic",
	components: {
		'vc-form': Form,
		'vc-form-item': Form.Item,
		'vc-tpl': Tpl,
		'vc-array': FakeArray,
		'vc-button': Button,
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
