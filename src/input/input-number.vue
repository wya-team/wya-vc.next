<template>
	<vc-input
		ref="input"
		v-bind="binds"
		:model-value="formatterValue"
		:clearable="clearable"
		:prepend="prepend"
		:append="append"
		:type="type"
		class="vc-input-number"
		v-on="listeners"
	>
		<template v-if="$slots.prepend" #prepend>
			<slot name="prepend" />
		</template>
		<template v-if="step" #append>
			<slot name="append">
				<div class="vc-input-number__icon">
					<div 
						:disabled="plusDisabled && 'disabled'" 
						class="vc-input-number__up"
						@click="handleStepper(1)"
					>
						<vc-icon type="up" />
					</div>
					<div 
						:disabled="minusDisabled && 'disabled'" 
						class="vc-input-number__down"
						@click="handleStepper(-1)" 
					>
						<vc-icon type="down" />
					</div>	
				</div>
			</slot>
		</template>
	</vc-input>
</template>

<script>
import { defineComponent, ref } from 'vue';

import inputMixin from './input-mixin';
import inputNumberMixin from './input-number-mixin';

import Icon from '../icon/index';
import Input from './input';
import useInherit from './use-inherit';
import useInputNumber from './use-input-number';
import useNativeEmitter from './use-native-emitter';

export default defineComponent({
	name: 'vc-input-number',
	components: {
		'vc-icon': Icon,
		'vc-input': Input
	},
	mixins: [inputMixin, inputNumberMixin],
	setup() {
		const input = ref(null);
		const { click, focus, blur } = useNativeEmitter(input);
		const { formatterValue, listeners, plusDisabled, minusDisabled, handleStepper } = useInputNumber();
		const { binds } = useInherit();

		return {
			input,
			formatterValue,

			click, 
			focus, 
			blur,

			listeners,
			binds,

			plusDisabled,
			minusDisabled,
			handleStepper
		};
	}
});
</script>

<style lang="scss">
@import '../style/vars.scss';

$block: vc-input-number;

@include block($block) {
	@include pseudo(hover) {
		.vc-input__append{
			z-index: 1;
		}
		@include element(icon){
			display: block;
		}
	}
	@include element(icon) {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		font-size: 12px;
		color: #999;
		width: 20px;
		height: 28px;
		display: none;
		&:hover {
			color: #57a3f3;
			cursor: pointer;
		}
	}
	@include share-rule(icon) {
		height: 14px;
		line-height: 14px;
		background-color: #fff;
		@include commonBorder1PX(left); // 不占边距
		&[disabled="disabled"] {
			background-color: #f3f3f3;
			cursor: not-allowed;
			pointer-events: none;
			color: #ccc;
		}
		@include when(disabled) {
			display: none;	
		}
		> i {
			transform: scale(0.6);
		}

	}

	@include element(up) {
		@include extend-rule(icon);
		@include commonBorder1PX(bottom); // 不占边距
	}
	@include element(down) {
		@include extend-rule(icon);
	}

	.vc-input__append.is-disabled {
		display: none;
	}
}
</style>


