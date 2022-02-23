<template>
	<vc-input
		ref="input"
		v-bind="binds"
		:model-value="currentValue"
		:clearable="clearable"
		:prepend="prepend"
		:type="type"
		:afloat="false"
		class="vc-input-search"
		v-on="listeners"
	>
		<template v-if="$slots.prepend" #prepend>
			<slot name="prepend" />
		</template>
		<template #append>
			<slot name="append">
				<div :class="{ 'is-disabled': binds.disabled }" class="vc-input-search__content">
					<vc-icon 
						v-if="enterText === true" 
						:type="append || 'search'"
						@click="handleSearch"
					/>
					<template v-else>
						{{ enterText }}
					</template>
				</div>
			</slot>
		</template>
	</vc-input>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watchEffect } from 'vue';
import inputMixin from './input-mixin';
import inputSearchMixin from './input-search-mixin';

import Icon from '../icon/index';
import Input from './input';
import useInherit from './use-inherit';
import useInputSearch from './use-input-search';
import useNativeEmitter from './use-native-emitter';

export default defineComponent({
	name: 'vc-input-search',
	components: {
		'vc-icon': Icon,
		'vc-input': Input
	},
	mixins: [inputMixin, inputSearchMixin],
	setup() {
		const input = ref(null);
		const { click, focus, blur } = useNativeEmitter(input);
		const { currentValue, isFocus, listeners, handleSearch } = useInputSearch();
		const { binds } = useInherit();

		return {
			input,
			currentValue,
			click, 
			focus, 
			blur,

			isFocus,
			listeners,
			binds,
			handleSearch
		};
	}

});
</script>

<style lang="scss">
@import '../style/vars.scss';

$block: vc-input-search;

@include block($block) {
	@include element(content) {
		cursor: pointer;
		font-size: 14px;
		padding: 0 8px;
		color: #b2b2b2;
		transition: all .2s ease-in-out;
		position: relative;
		text-align: center;
		line-height: 28px;
		white-space: nowrap;
		@include when(disabled) {
			cursor: not-allowed;
			opacity: .4;
		}
	}
}
</style>


