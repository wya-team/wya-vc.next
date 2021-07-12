<template>
	<div 
		class="vcm-input-search"
	>
		<vcm-input
			ref="input"
			v-bind="binds"
			:model-value="currentValue"
			:clearable="clearable"
			:prepend="prepend"
			:type="type"
			class="vcm-input-search__content"
			v-on="listeners"
		>
			<template #prepend>
				<slot name="prepend">
					<vcm-icon type="search" class="vcm-input-search__icon" />
				</slot>
			</template>
		</vcm-input>
		<!-- TODO, 待优化, isFocus隐藏，造成点击事件无效 -->
		<div 
			v-if="isFocus || showCancel" 
			class="vcm-input-search__btn"
			@touchend="handleCancel"
		>
			{{ cancelText }}
		</div>
	</div>
</template>

<script>
import { defineComponent, computed, ref, watchEffect } from 'vue';
import inputMixin from '../input-mixin';
import inputSearchMixin from '../input-search-mixin';
import MIcon from '../../icon/index.m';
import MInput from './input';


import useInherit from '../use-inherit';
import useInputSearch from '../use-input-search';
import useNativeEmitter from '../use-native-emitter';

export default {
	name: 'vcm-input-search',
	components: {
		'vcm-icon': MIcon,
		'vcm-input': MInput
	},
	mixins: [inputMixin, inputSearchMixin],
	props: {
		cancelText: {
			type: String,
			default: '取消'
		},
		type: {
			type: String,
			default: 'search'
		},
		showCancel: { // 强制显示取消
			type: Boolean,
			default: false,
		}
	},
	setup(props, context) {
		const { emit } = context;
		const input = ref(null);
		const { click, focus, blur } = useNativeEmitter(input);
		const { currentValue, isFocus, listeners } = useInputSearch();
		const { binds } = useInherit();

		const handleCancel = (e) => {
			emit('input', '');
			emit('update:modelValue', '');
			emit('cancel');
		};

		return {
			input,
			currentValue,
			click, 
			focus, 
			blur,

			isFocus,
			listeners,
			binds,
			handleCancel
		};
	}
};
</script>

<style lang="scss">
@import '../../style/vars.scss';

/**
 * TODO
 */
$block: vcm-input-search;
$size: 54px;

@include block($block) {
	display: flex;
	align-items: center;
	height: $size;
	padding: 10px;
	.vcm-input {
		height: 34px;
	}
	.vcm-input__prepend {
		line-height: 34px;
	}
	@include element(content) {
		background: white;
		border-radius: 16px;
		overflow: hidden;
		padding-right: 14px;
		input {
			padding-top: 6px ;
			padding-bottom: 5px;
			font-size: 14px;
			&::placeholder {
				font-size: 15px;
				color: #999;
			}
		}
		@include element(icon){
			font-size: 15px;
			margin-left: 14px;
			color: #999;
		}
		@include when(focus) {
			input {
				text-align: left;
			}
		} 
	}
	@include element(btn){
		padding-left: 8px;
		height: $size;
		line-height: $size;
		font-size: 15px;
		color: #333;
		text-align: right;
		white-space: nowrap;
	}
}
</style>


