<template>
	<div style="margin: 100px;">
		<vc-upload-picker
			v-model="dataSource"
			:picker="['image', 'video', 'audio', 'file']"
		>
			<!-- 限制大小上传以及api -->
		</vc-upload-picker>
		<div>图片压缩</div>
		<vc-upload-picker
			v-model="dataSource"
			:picker="['image']"
			:compress-opts="{compress: true}"
		>
			<!-- 限制大小上传以及api -->
		</vc-upload-picker>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import { random } from 'lodash';
import Message from '../../message';
import Upload from '../../upload/index';
import UploadPicker from '../index';
import { VcInstance } from '../../vc/index';

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
	},
	// UploadPicker: {
	// 	/**
	// 	 * 全局的上传文件类型识别器
	// 	 * 返回 image | video | file 
	// 	 */
	// 	recognizer: (url, defaultRecognizer) => {
	// 		if (/\.(jpe?g|png|gif|bmp|webp)/g.test(url)) {
	// 			return 'image';
	// 		} else {
	// 			return defaultRecognizer(url);
	// 		}
	// 	}
	// }
});


export default defineComponent({
	name: "vc-upload-basic",
	components: {
		'vc-upload-picker': UploadPicker
	},
	setup() {
		const list = ref([]);
		const dataSource = ref([
			'https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/172/20191226/2007790743/test_video.mp4', 
			'https://wyatest.oss-cn-hangzhou.aliyuncs.com/image/172/20200306/0936814587/O1CN01STX58I1HIDIUHqYwP_!!2885750734.jpg!4-4',
			'https://thirdwx.qlogo.cn/mmopen/vi_32/IUeRRqTWdyoMOkveehFRrbogiaFuk9U9kBgRMvP4A8U6GjYhiaboDsBf5WEEhV7Cfjr8a0Tz91Hal0oUaDsOslvg/132'
		]);

		return {
			list,
			dataSource
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
