<template>
	<div style="padding: 50px">
		<h2>基础</h2>
		<vc-time-picker 
			v-model="time"
			clearable
			placeholder="Select time" 
			style="width: 168px"
		/>
		<vc-time-picker 
			v-model="time_1"
			type="timerange" 
			placeholder="Select timerange" 
			style="width: 200px"
		/>
		<h2>带确认栏</h2>
		<vc-time-picker 
			v-model="time1"
			confirm
			placeholder="Select time" 
			style="width: 168px"
		/>
		<h2>时间格式</h2>
		<vc-time-picker 
			v-model="time2"
			format="HH点mm分"
			placeholder="Select time" 
			style="width: 168px"
		/>
		<h2>Steps</h2>
		<vc-time-picker 
			v-model="time3"
			:steps="[1, 15, 15]"
			placeholder="Select time" 
			style="width: 168px"
		/>
		<h2>不可选时间</h2>
		<vc-time-picker 
			v-model="time3"
			:disabled-hours="[1,5,10]"
			:disabled-minutes="[0,10,20]"
			placeholder="Select time" 
			style="width: 168px"
		/>
		<h2>Form表单校验</h2>
		<vc-form
			ref="form"
			:model="formValidate" 
			:rules="ruleValidate" 
		>
			<vc-form-item prop="time">
				<vc-time-picker 
					v-model="formValidate.time"
					placeholder="Select time" 
					style="width: 168px"
				/>
			</vc-form-item>
			<div @click="handleSubmit">
				提交
			</div>
		</vc-form>
	</div>
</template>
<script>
import { defineComponent, ref, reactive } from 'vue';
import Message from '../../message';
import Form from '../../form';
import TimePicker from '..';

export default {
	name: "vc-time-picker-basic",
	components: {
		'vc-time-picker': TimePicker,
		'vc-form': Form,
		'vc-form-item': Form.Item,
	},
	setup(props) {
		const form = ref(null);

		const time = ref('');
		const time_1 = ref('');
		const time1 = ref('');
		const time2 = ref('');
		const time3 = ref('');
		const formValidate = reactive({
			time: ''
		});
		const ruleValidate = reactive({
			time: [
				{ required: true, message: '请选择时间', trigger: 'change' }
			],
		});
		const handleSubmit = async (name) => {
			await form.value.validate();
			Message.success('Success!');
		};

		return {
			form,
			time,
			time_1,
			time1,
			time2,
			time3,
			formValidate,
			ruleValidate,
			handleSubmit,
		};
	}
};
</script>
