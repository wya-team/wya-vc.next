<template>
	<div :class="classes" class="vcm-textarea">
		<div class="vcm-textarea__wrapper">
			<div :class="{ 'is-right': right }" :style="contentStyle" class="vcm-textarea__content">
				<textarea
					ref="textarea"
					v-bind="binds"
					:value="currentValue"
					:maxlength="currentMaxlength"
					:style="[textareaStyle, calcTextareaStyle]"
					v-on="listeners"
				/>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import TextareaMixin from '../textarea-mixin';
import useTextarea from '../use-textarea';
import useMaxlength from '../../input/use-maxlength';

export default defineComponent({
	name: 'vcm-textarea',
	mixins: [TextareaMixin],
	props: {
		right: {
			type: Boolean,
			default: false
		},
		// rows: {
		// 	type: Number,
		// 	default: 1
		// }
	},
	setup(props, context) {
		const textarea = ref(null);
		const { currentMaxlength, handlePaste } = useMaxlength(textarea);

		const { 
			focus, 
			blur, 
			currentValue,
			isFocus,
			isOnComposition,
			classes,
			contentStyle,
			listeners,
			binds,
			calcTextareaStyle
		} = useTextarea(textarea);

		return {
			textarea,
			classes,
			contentStyle,
			calcTextareaStyle,

			// indicatorNum,
			// indicateInline,
			currentValue,
			currentMaxlength,

			isFocus,
			isOnComposition,

			listeners,
			binds,

			focus, 
			blur,
		};
	}
});
</script>
<style lang="scss">
@import '../../style/vars.scss';

$block: vcm-textarea;

@include block($block) {
	position: relative;
	width: 100%;
	display: inline-block;
	cursor: text;
	min-height: 24px; // 动态计算
	line-height: 1.5;
	@include element(wrapper) {
		display: flex;
		align-items: center;
		flex: 1;
	}
	@include element(content){
		flex: 1;
		textarea {
			position: relative;
			display: block; // 两个文本框默认情况下上下会有一个间距
			width: 100%;
			background-color: $white;
			outline: 0;
			color: #000;
			font-size: 16px;
			padding-left: 7px;
			padding-right: 7px;

			overflow: auto;
			resize: none;  // 不形式拖拽按钮
			min-height: 24px;

			&::placeholder {
				color: #999;
			}
			&[disabled] {
				background-color: #f3f3f3;
				opacity: 1;
				cursor: not-allowed;
				color: #ccc;
			}
		}
		@include when(right) {
			textarea {
				text-align: right;
				color: #999;
			}
		}
	}
}
</style>