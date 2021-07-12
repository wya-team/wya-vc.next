<template>
	<div>
		<!-- single -->
		<vcm-form 
			ref="formValidate" 
			:model="formValidate" 
			:rules="ruleValidate"
			:label-width="96"
			label-position="left"
			@submit.prevent
		>
			<vcm-form-item prop="animal" label="动物：">
				<vcm-radio-group v-model="formValidate.animal" vertical>
					<vcm-radio label="金斑蝶" />
					<vcm-radio label="爪哇犀牛" />
					<vcm-radio label="印度黑羚" />
				</vcm-radio-group>
			</vcm-form-item>
			<vcm-form-item prop="animal" label="动物：">
				<vcm-radio-group v-model="formValidate.animal">
					<vcm-radio label="金斑蝶" />
					<vcm-radio label="爪哇犀牛" />
					<vcm-radio label="印度黑羚" />
				</vcm-radio-group>
			</vcm-form-item>
		</vcm-form>
		
		<vcm-radio-group v-model="formValidate.animal" style="width: 100%">
			<vcm-list :border="false">
				<vcm-list-item :arrow="false">
					<template #label>
						<vcm-radio label="金斑蝶" />
					</template>
				</vcm-list-item>
				<vcm-list-item :arrow="false">
					<template #label>
						<vcm-radio label="爪哇犀牛" />
					</template>
				</vcm-list-item>
			</vcm-list>
		</vcm-radio-group>	
	</div>
</template>
<script>
import { defineComponent, onUpdated, ref, reactive } from 'vue';
import MRadio from '../index.m';
import MForm from '../../form/index.m';
import MList from '../../list/index.m';

export default defineComponent({
	name: "vcm-radio-basic",
	components: {
		'vcm-radio': MRadio,
		'vcm-radio-group': MRadio.Group,
		'vcm-form': MForm,
		'vcm-form-item': MForm.Item,
		'vcm-list': MList,
		'vcm-list-item': MList.Item,
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
