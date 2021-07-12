<template>
	<div style="padding: 20px">
		<p>基础用法</p>
		<vc-slider 
			ref="slider"
			:model-value="value1" 
			show-tip="always"
			@after-change="handleChange"
		/>
		<vc-slider v-model="value11" show-tip="never" />
		<vc-slider v-model="value12" />
		<vc-slider v-model="value2" range />
		<vc-slider v-model="value3" range disabled />
		<p>离散值</p>
		<vc-slider v-model="value4" :step="0.01" />
		<vc-slider v-model="value5" :step="10" range />
		<p>显示中间断点</p>
		<vc-slider v-model="value6" :step="10" show-stops />
		<vc-slider v-model="value7" :step="10" show-stops range />
		<p>带有输入框</p>
		<vc-slider v-model="value8" show-input />
		<p>自定义提示</p>
		<vc-slider v-model="value9" :tip-format="format" />
		<vc-slider v-model="value10" :tip-format="hideFormat" />
		<vc-form
			ref="form"
			:model="formValidate" 
			:rules="ruleValidate" 
			style="padding: 20px"
		>
			<vc-form-item prop="value" @on-form-change="handleFormChange">
				<vc-slider v-model="formValidate.value" :clickable="false" />
			</vc-form-item>
			<div @click="handleSubmit">
				提交
			</div>
		</vc-form>
	</div>
</template>
<script>
import { defineComponent, ref, reactive } from 'vue';
import Slider from '..';
import Form from '../../form';

export default defineComponent({
	name: "vc-slider-basic",
	components: {
		'vc-slider': Slider,
		'vc-form': Form,
		'vc-form-item': Form.Item,
	},
	setup() {
		const value1 = ref(25);
		const value2 = ref([20, 50]);
		const value3 = ref([20, 50]);
		const value4 = ref(30);
		const value5 = ref([20, 50]);
		const value6 = ref(30);
		const value7 = ref([20, 50]);
		const value8 = ref(25);
		const value9 = ref(25);
		const value10 = ref(25);
		const value11 = ref(25);
		const value12 = ref(25);
		const formValidate = reactive({
			value: 25,
		});
		const ruleValidate = reactive({
			value: [
				{ 
					validator(rule, value, callback, source, options) {
						if (value < 25) {
							callback("价格不能低于25");
							return;
						}
						callback();
					},
					type: 'number', 
					trigger: 'change',
				}
			],
		});

		return {
			value1,
			value2,
			value3,
			value4,
			value5,
			value6,
			value7,
			value8,
			value9,
			value10,
			value11,
			value12,
			formValidate,
			ruleValidate,
			handleChange(val, reset) {
				value1.value = 25;
				reset(25);
			},
			handleFormChange(val) {
				console.log(val);
			},
			format(val) {
				return 'Progress: ' + val + '%';
			},
			hideFormat() {
				return null;
			},
			handleSubmit() {

			}
		};
	}
});
</script>
