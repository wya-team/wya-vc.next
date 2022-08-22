<template>
	<div class="vcm-picker-view">
		<vcm-picker-col
			v-for="(item, index) in cols"
			:key="index"
			:index="index"
			:data-source="rebuildData[index]"
			:value="currentValue[index]"
			:cascade="cascade"
			:item-style="itemStyle"
			:render-label="renderLabel"
			@change="v => handleColChange(v, index)" 
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, getCurrentInstance, inject, ref, computed, watch } from 'vue';
import { isEqualWith } from 'lodash';
import Col from './col';
import { getSelectedData } from '../../utils/index';
import Extends from '../../extends';

export default {
	name: "vcm-picker-view",
	components: {
		'vcm-picker-col': Col
	},
	props: {
		modelValue: {
			type: Array,
		},
		dataSource: Array,
		cols: {
			type: Number,
			default: 1
		},
		itemStyle: Object,
		cascade: {
			type: Boolean,
			default: true
		},
		allowDispatch: {
			type: Boolean,
			default: true
		},
		renderLabel: Function
	},
	emits: ['update:modelValue', 'change', 'picker-change'],
	setup(props, context) {
		const { emit } = context;
		const currentValue = ref([]);
		const rebuildData = ref([]);

		const formItem = inject('form-item', {});

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			const { label, data } = getSelectedData(currentValue.value, props.dataSource);
			emit('update:modelValue', currentValue.value, label, data);
			emit('change', currentValue.value, label, data);

			props.allowDispatch && formItem?.change?.(currentValue.value);
		};


		/**
		 * 单列数据
		 * @param  {Array} source 数据源
		 */
		const makeData = (source) => {
			let data = source && source.map(i => ({
				value: i.value,
				label: i.label,
				hasChildren: !!(i.children && (i.children.length > 0)),
				loading: false
			}));
			return data;
		};

		/**
		 * index 之后的数据
		 */
		const makeRebuildData = (colIndex = 0) => {
			if (!props.dataSource.length) return [];
			if (!props.cascade || props.cols === 1) return props.dataSource;

			let temp = props.dataSource;
			let data = Array.from({ length: props.cols }).reduce((pre, cur, index) => {
				pre[index] = makeData(temp) || [];
				temp = ((temp && temp.find(i => i.value == currentValue.value[index])) || temp[0] || {}).children;
				return pre; 
			}, []);

			return data.slice(colIndex);
		};

		const resetDefault = (colIndex = 0) => {
			rebuildData.value.slice(0).forEach((item, index) => {
				if (index >= colIndex) {
					currentValue.value.splice(index, 1, currentValue.value[index] || item[0].value);
				}
			});
		};


		/**
		 * @param  {[Number, String]} v 当前选种值
		 * @param  {[Number]} index 当前第几列
		 */
		const handleColChange = (v, index) => {
			currentValue.value.splice(index, 1, v.value);
			if (props.cascade && index < props.cols) {
				currentValue.value.splice(index + 1, props.cols - index); // 需要清理，用于resetDefault
				rebuildData.value.splice(index + 1, props.cols - index, ...makeRebuildData(index + 1));
				resetDefault(index + 1);
			}

			// 普通组件
			emit('picker-change', v.value, index);

			sync();
		};

		watch(
			() => props.dataSource,
			() => {
				rebuildData.value = makeRebuildData();

				resetDefault();
			},
			{ immediate: false }
		);

		watch(
			() => props.modelValue,
			(v) => {
				// 数组情况下同值会重新set
				if ((v && v.length !== 0) && isEqualWith(v, currentValue.value)) {
					return;
				}
				
				currentValue.value = v;
				rebuildData.value = makeRebuildData();

				resetDefault();
			},
			{ immediate: true }
		);

		return {
			currentValue,
			rebuildData,
			handleColChange
		};
	}
};

</script>

<style lang='scss'>
@import '../../style/vars.scss';

@include block(vcm-picker-view) {
	display: flex;
	align-items: center;
	flex-direction: row;
	align-items: center;
	flex: 1;
	box-sizing: border-box;
	overflow: hidden;
	background-color: #fff;
}
</style>
