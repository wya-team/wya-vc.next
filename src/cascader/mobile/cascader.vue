<template>
	<div class="vcm-picker" @click="handleClick">
		<slot 
			v-if="$slots.default" 
			:label="formatterValue" 
		/>
		<vcm-list-item 
			v-else 
			:label="label" 
			:label-width="labelWidth" 
			:extra="formatterValue"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, inject, watch, computed, ref, onBeforeUnmount } from 'vue';
import { isEqualWith, pick } from 'lodash';
import Core, { Func } from './core.vue';
import List from '../../list/index.m';
import { getSelectedData } from '../../utils/index';
import { VcError } from '../../vc/index';

export default defineComponent({
	name: "vcm-cascader",
	components: {
		'vcm-list-item': List.Item
	},
	props: {
		...pick(List.Item.props, [
			'label',
			'labelWidth'
		]),
		...Core.props,
		loadData: Function,
		extra: {
			type: String,
			default: '请选择'
		},
		formatter: {
			type: Function,
			default: (v: any[]) => (!v ? v : v.join(',')) 
		}
	},
	emits: ['update:modelValue', 'ok', 'cancel', 'change', 'close'],
	setup(props, { emit }) {
		const formItem = inject('form-item', {});
		const currentValue = ref([]);

		const formatterValue = computed(() => {
			let { label = [] } = getSelectedData(currentValue.value, props.dataSource);
			if (props.header && label.length) {
				label = label.slice(1);
			}
			return props.formatter(label) || props.extra;
		});

		watch(
			() => props.modelValue,
			(v) => {
				// 数组情况下同值会重新set
				if (isEqualWith(v, currentValue.value)) {
					return;
				}

				currentValue.value = v;
			},
			{ immediate: true }
		);

		let pickerInstance;

		const sync = (label) => {
			emit('update:modelValue', currentValue.value, label);
			emit('change', currentValue.value, label);
			// form表单
			formItem.change?.(currentValue.value);
		};

		const handleClick = async () => {
			try {
				if ((!props.dataSource || props.dataSource.length === 0) && props.loadData) {
					// 数据加载完成后，用户需要绑定到dataScource
					await props.loadData();
				}
				/**
				 * 有待优化，dataSource源数据异步
				 */
				let { 
					dataSource, 
					loadData, 
					title, 
					cancelText, 
					okText, 
					showToolbar, 
					modelValue, 
					show, 
					alphabetical, 
					alphabetKey, 
					changeOnSelect,
					header 
				} = props;
				Func.popup({
					dataSource,
					title,
					cancelText,
					showToolbar,
					show,
					okText,
					modelValue,
					loadData,
					alphabetical,
					alphabetKey,
					changeOnSelect,
					header,
					onClose: () => {
						emit('close');
					},
					onOk: (v, label, data) => {
						currentValue.value = v;
						emit('ok', v, label, data);

						sync(label);
					},
					onCancel: res => {
						emit('cancel');
					},
					getInstance: vm => pickerInstance = vm
				});
			} catch (e) {
				throw new VcError('m-cascader', e);
			}
		};

		onBeforeUnmount(() => {
			pickerInstance && pickerInstance.destroy();
		});

		return {
			currentValue,
			formatterValue,
			handleClick
		};
	}
});

</script>