<template>
	<div>
		<!-- single -->
		<vc-radio v-model="single" @change="handleChange">
			{{ single }}
		</vc-radio>

		<!-- group -->
		<vc-radio-group v-model="phone">
			<vc-radio label="apple" disabled>
				<span>Apple</span>
			</vc-radio>
			<vc-radio label="android">
				<span>Android</span>
			</vc-radio>
			<vc-radio label="windows">
				<span>Windows</span>
			</vc-radio>
		</vc-radio-group>
		<vc-radio-group v-model="animal" vertical>
			<vc-radio label="金斑蝶" />
			<vc-radio label="爪哇犀牛" />
			<vc-radio label="印度黑羚" />
		</vc-radio-group>

		<vc-radio-group v-model="city" type="button" @change="handleChange">
			<vc-radio label="北京" />
			<vc-radio label="上海" disabled />
			<vc-radio label="深圳" />
			<vc-radio label="杭州" />
		</vc-radio-group>
		<vc-form 
			ref="formValidate" 
			:model="formValidate" 
			:rules="ruleValidate"
			:label-width="96"
			style="padding-left: 56px; margin-top: 21px"
			@submit.prevent
		>
			<vc-form-item prop="animal" label="动物：">
				<vc-radio-group v-model="formValidate.animal">
					<vc-radio label="金斑蝶" />
					<vc-radio label="爪哇犀牛" />
					<vc-radio label="印度黑羚" />
				</vc-radio-group>
			</vc-form-item>
			<vc-form-item prop="animal" label="动物：">
				<vc-radio label="金斑蝶" />
			</vc-form-item>
			<vc-form-item prop="input" label="动物：">
				<vc-input style="width: 300px" />
			</vc-form-item>
		</vc-form>
	</div>
</template>
<script>
import { defineComponent, onUpdated, ref, reactive } from 'vue';
import Radio from '..';
import Form from '../../form/index';
import Input from '../../input/index';

export default defineComponent({
	name: "vc-radio-basic",
	components: {
		'vc-radio': Radio,
		'vc-radio-group': Radio.Group,
		'vc-form': Form,
		'vc-form-item': Form.Item,
		'vc-input': Input,
	},
	setup() {
		const single = ref(false);
		const phone = ref('apple');
		const animal = ref('爪哇犀牛');
		const city = ref('北京');
		const formValidate = reactive({});
		const ruleValidate = reactive({});

		onUpdated(() => {
			console.log({
				single: single.value,
				phone: phone.value,
				animal: animal.value,
				city: city.value
			});
		});

		return {
			single,
			phone,
			animal,
			city,
			formValidate,
			ruleValidate,
			handleChange() {
				console.log(arguments[0]);
			}
		};
	}
});
</script>
