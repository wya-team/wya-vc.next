<template>
	<div :class="{ 'is-alphabetical': alphabetical }" class="vcm-cascader-col">
		<div class="vcm-cascader-col__list vc-hack-scroll">
			<div 
				v-for="(item, $index) in dataSource"
				:id="item.isFirst && item[alphabetKey]"
				:key="$index"
				:class="{ 'is-select': value === item.value }"
				class="vcm-cascader-col__item"
				@click="handleClick(item.value, $index)"
			>
				<span class="vcm-cascader-col__label">
					<span 
						v-if="alphabetical" 
						class="vcm-cascader-col__letter"
					>
						{{ item.isFirst ? item[alphabetKey] : '' }}
					</span>
					{{ item.label }}
				</span>
				<vcm-spin v-if="value === item.value && item.loading" :size="16" />
				<vcm-icon v-else-if="value === item.value" class="vcm-cascader-col__select" type="select-checked" />
			</div>
		</div>

		<vcm-alphabet 
			v-if="alphabetical" 
			v-model="currentLetter"
			:alphabet="alphabet"
			@change="handleLetterChange"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, getCurrentInstance } from 'vue';
import type { PropType } from 'vue';
import { $ } from '@wya/utils';
import MIcon from '../../icon/index.m';
import MSpin from '../../spin/index.m';
import MToast from '../../toast/index.m';
import Alphabet from './alphabet.vue';
import type { TreeData, TreeValue } from '../../utils/types';

export default defineComponent({
	name: 'vcm-cascader-col',
	components: {
		'vcm-icon': MIcon,
		'vcm-spin': MSpin,
		'vcm-alphabet': Alphabet
	},
	props: {
		dataSource: {
			type: Array as PropType<TreeData[]>,
			default: () => ([] as TreeData[])
		},
		value: {
			type: [String, Number]
		},
		loading: {
			type: Boolean,
			default: false
		},
		index: {
			type: Number
		},
		alphabetical: {
			type: Boolean,
			default: false
		},
		alphabet: {
			type: Array,
			default: () => ([])
		},
		alphabetKey: {
			type: String,
			default: 'char'
		}
	},
	emits: ['change'],
	setup(props, { emit }) {
		const instance = getCurrentInstance() as any;
		const currentLetter = ref(props.alphabet[0]);

		watch(
			() => props.index,
			() => {
				// 滚动到初始位置
				let $instance = props.dataSource.findIndex((i: TreeData) => props.value == i.value);

				$(instance.vnode.el).scrollIntoView({ to: $instance * 40 });
			}
		);

		const handleClick = (value: TreeValue, rowIndex: number) => {
			const { index: colIndex } = props;
			emit('change', { value, rowIndex, colIndex });
		};

		const handleLetterChange = (letter: string) => {
			MToast.destroy();
			MToast.info(letter, 0.8);
			const el = instance.node.el.querySelector(`#${letter}`);
			el && el.scrollIntoView();
		};

		return {
			currentLetter,
			handleClick,
			handleLetterChange
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vcm-cascader-col;

@include block($block) {
	overflow: hidden;
	position: relative;
	display: flex;
	flex-direction: column;
	flex: 1;
	-webkit-overflow-scrolling: touch;
	overflow-scrolling: touch;
	background-color: #fff;
	@include when(alphabetical) {
		@include element(list) {
			padding-right: 36px;
		}
	}
	@include element(list) {
		overflow: auto;
		height: 100%;
		flex: 1;
	}
	@include element(item) {
		padding: 10px 12px;
		display: flex;
		justify-content: space-between;
	}
	@include element(label) {
		flex: 1;
		font-size: 14px;
		line-height: 20px;
		color: #000;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
	@include element(letter) {
		margin-right: 2px;
		display: inline-block;
		width: 1em;
		font-size: 14px;
		line-height: 20px;
		color: #666;
	}
	@include element(select) {
		flex-shrink: 0;
		color: #5495f6;
	}
}
</style>
