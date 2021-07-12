<template>
	<vc-dropdown
		v-model="isVisible"
		trigger="click"
		placement="bottom"
		tag="span"
		portal-class-name="vc-table-extend"
		@visible-change="handleVisibleChange"
	>
		<span>
			<slot />
			<vc-icon :style="{ 'color': !isAllSelected ? '#ccc' : 'blue' }" type="filter" />
		</span>
		<template #list>
			<vc-dropdown-menu>
				<vc-dropdown-item :closable="false">
					<vc-checkbox
						:model-value="isAllSelected"
						:indeterminate="indeterminate"
						:disabled="required && isAllSelected"
						@change="handleToggleAll"
					>
						全部
					</vc-checkbox>
				</vc-dropdown-item>
				<vc-dropdown-item :closable="false">
					<vc-checkbox-group :model-value="filters" @change="handleChange">
						<vc-checkbox 
							v-for="item in dataSource"
							:key="item.value"
							:label="item.value"
							:disabled="required && filters.length === 1 && filters.includes(item.value)"
						>
							{{ item.label }}
						</vc-checkbox>
					</vc-checkbox-group>
				</vc-dropdown-item>
				<vc-dropdown-item :closable="false">
					<vc-button @click="isVisible = false">
						取消
					</vc-button>
					<vc-button
						type="primary"
						@click="handleConfirm"
					>
						确认
					</vc-button>
				</vc-dropdown-item>
			</vc-dropdown-menu>
		</template>
	</vc-dropdown>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import Button from '../../../button';
import Dropdown from '../../../dropdown';
import Checkbox from '../../../checkbox';
import Icon from '../../../icon';

export default {
	name: 'vc-table-filter',
	components: {
		'vc-button': Button,
		'vc-dropdown': Dropdown,
		'vc-dropdown-menu': Dropdown.Menu,
		'vc-dropdown-item': Dropdown.Item,
		'vc-checkbox': Checkbox,
		'vc-checkbox-group': Checkbox.Group,
		'vc-icon': Icon,
	},
	props: {
		// 初始选中的选项value值数组
		modelValue: {
			type: Array,
			default: () => ([])
		},
		// 所有选项
		dataSource: {
			type: Array,
			default: () => ([])
		},
		// 是否至少选一个
		required: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'change', 'select-all', 'select-none'],
	setup(props, context) {
		const { emit } = context; 
		const isVisible = ref(false);
		const isAllSelected = ref(true);
		const filters = ref([]);

		const indeterminate = computed(() => {
			return !isAllSelected.value && !!filters.value.length;
		});


		const checkSelection = (list) => {
			isAllSelected.value = list.length === props.dataSource.length;
		};


		const handleConfirm = () => {
			let hasChanged = false;
			if (props.modelValue.length !== filters.value.length) {
				hasChanged = true;
			} else {
				hasChanged = props.modelValue.some((item, index) => {
					return item !== filters.value[index];
				});
			}
			
			hasChanged && (
				emit('change', [...filters.value]),
				emit('update:modelValue', [...filters.value])
			);
			isAllSelected.value && emit('select-all', [...filters.value]);
			!filters.value.length && emit('select-none');
			isVisible.value = false;
		};

		const handleChange = (list) => {
			checkSelection(list);
			filters.value = list;
		};

		const handleToggleAll = (value) => {
			if (value === isAllSelected.value) return;
			
			filters.value = value ? props.dataSource.map(item => item.value) : [];
			isAllSelected.value = value;
		};

		const handleVisibleChange = (value) => {
			if (value) {
				filters.value = [...props.modelValue];
				checkSelection(props.modelValue);
			}
		};

		checkSelection(props.modelValue);

		return {
			isVisible,
			isAllSelected,
			filters,
			handleChange,
			handleVisibleChange,
			handleConfirm,
			handleToggleAll,
			indeterminate
		};
	}
};
</script>

<style lang="scss">
.vc-table-extend {
	min-width: 144px;
	padding-bottom: 0;

	.vc-checkbox-group {
		overflow-y: auto;
		max-height: 160px;
		.vc-dropdown-item {
			height: 32px;
		}
	}
}
</style>
