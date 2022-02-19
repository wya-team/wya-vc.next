import { defineComponent } from 'vue';

export default defineComponent({
	props: {
		min: {
			type: Number,
			default: 0,
		},
		max: {
			type: Number,
			default: Number.MAX_SAFE_INTEGER,
		},
		step: {
			type: [Number, Boolean],
			default: 1, // 为0时不展示
		},
		required: {
			type: Boolean,
			default: false
		},
		precision: {
			type: Number,
			// default: Number.MAX_SAFE_INTEGER,
			default: 0,
		},
		formatter: {
			type: Function,
			default: (v: string, precision: number) => (/^(-|)$/.test(v) ? '' : Number(v).toFixed(precision))
		},

		/**
		 * 失焦的情况下，会强制把value, 转化为number类型
		 * input事件实时输入只能是string
		 * 等价于@blur="value = arguments[1]"
		 * :output="Number" -> output="number"功能相同
		 */
		output: {
			type: [Function, String], // Number, String, (v) => v, 'number', 'string'
			// default: v => v 
			default: 'number'
		}
	}
});
