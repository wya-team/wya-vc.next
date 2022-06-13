<template>
	<vc-form
		ref="form"
		:model="formValidate" 
		:rules="ruleValidate" 
		@submit.prevent
	>
		<vc-form-item prop="value">
			<!-- :options="options" -->
			<vc-editor 
				ref="editor"
				v-model="formValidate.value"
				:disabled="disabled"
				:options="editorOption"
				:preview="false"
				style="width: 100%;height: 500px"
				@change="handleInput"
			/>
		</vc-form-item>
		<vc-editor-view :value="formValidate.value" />
		<vc-button @click="handleSubmit">
			提交
		</vc-button>
	</vc-form>
</template>
<script>
import { defineComponent, ref, reactive } from 'vue';
import Form from '../../form';
import Input from '../../input';
import Button from '../../button';
import Editor from '../index';
import Toolbar from '../toolbar';
import { VcInstance } from '../../vc/index';

VcInstance.init({
	Upload: {
		url: 'https://api.github.com/users/wya-team',
		onPostBefore: ({ options }) => {
			return new Promise((resolve, reject) => {
				// if (random(0, 10) > 10) {
				// 	throw new Error('异常处理');
				// }
				resolve({
					...options,
					param: {
						...options.param,
						timestamp: new Date()
					},
					type: 'GET',
					credentials: 'omit', //  cors下关闭
					headers: {
					},
				});
			});
		},
		onPostAfter: ({ response, options }) => { // eslint-disable-line
			const { file } = options.param;
			return new Promise((resolve) => {
				
				// 模拟强制返回
				resolve({
					status: 1,
					data: {
						url: 'https://avatars2.githubusercontent.com/u/34465004?v=4',
						type: `.${file.name && file.name.split('.').pop()}`,
						uid: file.uid,
						title: file.name,
						size: file.size
					},
					...response
				});
			});
		}
	}
});

export default defineComponent({
	name: "vc-editor-basic",
	components: {
		"vc-editor": Editor,
		"vc-editor-view": Editor.View,
		'vc-button': Button,
		'vc-form': Form,
		'vc-form-item': Form.Item,
	},
	setup(props) {
		const form = ref();
		const options = ref({
			modules: {
				toolbar: {
					container: [
						['bold', 'italic', 'underline', 'strike'],
						[{ 'header': [1, 2, 3, 4, 5, 6, 7, false] }],
						['link'],
						[{ 'color': [] }, { 'background': [] }],
						[{ 'align': [] }],
						[{ 'lineHeight': ['1', '2.2', '3', '5'] }],
						[{ 'letterSpacing': ['1px', '2px', '3px', '12px'] }],
						[{ 'size': ['18px', '20px', '22px', '49px'] }]
					],
				},
			}
		});
		const editorOption = ref({
			modules: {
				ImageExtend: {
					upload: {
						showTips: false,
						size: 88888,
						max: 2,
						multiple: false
					}
				},
				toolbar: "#toolbar",
			}
		});
		const disabled = ref(false);
		/* eslint-disable */
		const formValidate = reactive({
			// value: '<p><video src="https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/172/20200109/1404367119/17秒视屏.mp4?x-oss-process=video/snapshot,t_0,f_png,w_0,h_0,m_fast" style="width: auto; max-width: 100%;" contenteditable="true"></video></p>'
			value: '<p><img src="https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/172/20200106/1508941171/timg.jpeg!4-4" contenteditable="true" ></p>'
		});
		/* eslint-enable */
		const ruleValidate = reactive({
			value: [
				{ required: true, message: '请输入内容' }
			],
		});

		return {
			form,
			options,
			editorOption,
			disabled,
			ruleValidate,
			formValidate,
			async handleSubmit(name) {
				await form.value.validate();
				console.log('Success!');
			},

			handleInput(e) {

			}
		};
	}
});
</script>
