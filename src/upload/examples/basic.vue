<template>
	<div>
		<vc-upload>简单版上传</vc-upload>
		<br>
		<vc-upload
			:size="2"
			:max="8"
			:show-tips="true"
			:parallel="false"
			accept="image/*"
			@error="handleError"
			@begin="handleBegin"
			@complete="handleComplete"
			@file-before="handleFileBefore"
			@file-start="handleFileStart"
			@file-error="handleFileError"
			@file-success="handleFileSuccess"
			@file-progress="handleFileProgress"
		>
			限制大小上传以及api
		</vc-upload>

		<div style="display: flex; flex-wrap: wrap">
			<div 
				v-for="(item, index) in list"  
				:key="index"
				:style="{ backgroundImage: `url(${item})` }"
				class="image"
			/>
		</div>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import { ajax } from '@wya/http';
import { random } from 'lodash';
import Message from '../../message';
import Upload from '../index';
import { VcInstance } from '../../vc/index';

window.vc = VcInstance;
VcInstance.init({
	Upload: {
		url: 'https://api.github.com/users/wya-team',
		onPostBefore: ({ options }) => {
			return new Promise((resolve, reject) => {
				if (random(0, 10) > 10) {
					throw new Error('异常处理');
				}
				resolve({
					...options,
					param: {
						...options.param,
						timestamp: new Date().getTime()
					},
					type: 'GET',
					credentials: 'omit', //  cors下关闭
					headers: {

					}
				});
			});
		},
		onPostAfter: ({ response, options }) => { // eslint-disable-line
			const { file } = options.param;
			return new Promise((resolve) => {
				// 模拟强制返回
				resolve({
					...response,
					status: 1,
					data: {
						url: 'https://avatars2.githubusercontent.com/u/34465004?v=4',
						type: `.${file.name.split('.').pop()}`,
						uid: file.uid,
						title: file.name,
						size: file.size
					},
				});
			});
		}
	}
});

export default defineComponent({
	name: "vc-upload-basic",
	components: {
		'vc-upload': Upload
	},

	setup() {
		const list = ref([]);

		return {
			list,
			handleError(error) {
				console.error(error.message);
			},
			/**
			 * 总线
			 */
			handleBegin(files) {
				console.log(files);
				Message.loading({
					content: `上传中`
				});
			},
			handleComplete(info = {}) {
				console.log(`Error: ${info.error}, Success: ${info.success}, 总数：${info.total}`);
				console.log(info.imgs);
				Message.destroy();
			},
			/**
			 * 单个文件
			 */
			handleFileBefore(file, fileList) {
				console.log(`上传之前`);
				return new Promise((resolve, reject) => {
					resolve(file);
				});
			},
			handleFileStart(file) {
				console.log(`开始上传`);
			},
			handleFileSuccess(res, file) {
				console.log(`Success：${file.current}, 总数：${file.total}`);
				console.log(res);
				Message.destroy();
				Message.success({
					content: `上传成功`
				});

				list.value.push(res.data.url);
			},
			handleFileProgress(e, file) {
				console.log(`Progress: 当前：${file.current}, 总数：${file.total}`);
				console.log(e.percent);
			},
			handleFileError(res, file) {
				console.log(`Error: 当前：${file.current}, 总数：${file.total}`);
				console.log(res);
				Message.destroy();
				Message.error({
					content: res.msg || 'test'
				});
			},
		};
	}
});
</script>
<style lang="scss">
	.image {
		background-size: cover;
		width: 120px;
		height: 120px;
		border-radius: 3px;
		margin: 3px;
	}
</style>
