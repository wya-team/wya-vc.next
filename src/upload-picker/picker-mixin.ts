export default {
	props: {
		picker: {
			type: Array,
			default: () => (['image'])
		},
		sortable: {
			type: Boolean,
			default: false
		},
		mask: {
			type: Boolean,
			default: false
		},
		/**
		 * vc-upload组件的属性
		 */
		uploadOptions: {
			type: Object,
			default() {
				return {};
			}
		},
		/**
		 * 数据源['xxx.jpg', ....]
		 */
		modelValue: {
			type: Array,
			default: () => ([]),
		},
		/**
		 * 可上传的最大值,跟upload内的Max不同，有可能是对象类型，对应的Upload做限制
		 */
		max: {
			type: [Number, Object],
			default: Number.MAX_SAFE_INTEGER
		},
		disabled: {
			type: Boolean,
			default: false
		},
		/**
		 * 上传成功后对数据的格式化
		 */
		formatter: Function,
		// TODO 下面两个重复了，需删除
		/**
		 * 盒子className
		 */
		boxClassName: String,
		imagePreviewOptions: {
			type: Object,
			default: () => ({})
		},
		imageClassName: String,
		videoClassName: String,
		audioClassName: String,
		fileClassName: String,
		urlKey: {
			type: String,
			default: 'url'
		},
		compressOptions: {
			type: Object,
			default: () => {
				return {
					compress: false, // 是否开启图片压缩
					width: 0, // 图片缩放最大宽度，为0默认源图片宽度
					height: 0, // 图片缩放最大高度，为0默认源图片高度
					filetype: 'image/jpeg', // 文件类型
					encoderOptions: 0.92 // 在指定图片格式为 image/jpeg 或 image/webp的情况下，可以从 0 到 1 的区间内选择图片的质量。如果超出取值范围，使用默认值 0.92
				};
			}
		}
	},
	emits: [
		'update:modelValue',
		'file-success',
		'file-start',
		'success',
		'error',
		'complete',
		'change',
		'remove-before'
	]
};