<template>
	<vcm-picker-popup
		v-model="isActive"
		:title="title"
		:cancel-text="cancelText"
		:ok-text="okText"
		:show-toolbar="showToolbar"	
		class="vcm-cascader-picker-popup"
		@ok="handleOk"
		@cancel="handleCancel"
		@close="handleClose"
	>
		<vcm-cascader-view
			ref="view"
			v-model="currentValue"
			:data-source="dataSource"
			:load-data="loadData"
			:allow-dispatch="false"
			:alphabetical="alphabetical"
			:alphabet-key="alphabetKey"
			:change-on-select="changeOnSelect"
			:header="header"
		/>
	</vcm-picker-popup>
</template>

<script lang="ts">
import { defineComponent, ref, watch, getCurrentInstance, onMounted } from 'vue';
import { pick } from 'lodash';
import MPicker from '../../picker/index.m';
import MCascaderView from './cascader-view.vue';
import Portal from '../../portal/index';
import { getSelectedData } from '../../utils/index';

import type { TreeData, TreeValue, TreeLabel } from '../../utils/types';

const WrapperComponent = defineComponent({
	name: 'vcm-cascader-core',
	components: {
		'vcm-picker-popup': MPicker.Popup,
		'vcm-cascader-view': MCascaderView
	},
	// inheritAttrs: false, Portal暂时无法使用
	props: {
		...pick(MPicker.Popup.props, [
			'title',
			'cancelText',
			'okText',
			'showToolbar'
		]),
		...pick(MCascaderView.props, [
			'modelValue',
			'dataSource',
			'loadData',
			'alphabetical',
			'alphabetKey',
			'changeOnSelect',
			'header'
		]),
		visible: { // sync
			type: Boolean,
			default: true
		},
		/**
		 * 兼容portal设计, 实现Promise方式
		 */
		onOk: {
			type: Function
		},
		onCancel: {
			type: Function
		}
	},
	emits: [
		'update:modelValue',
		'update:visible',
		'visible-change',
		'ok',
		'cancel',
		'change', 
		'portal-fulfilled',
		'close'
	], 
	setup(props, context) {
		const { emit } = context;
		const instance = getCurrentInstance() as any;
		const isActive = ref(false);
		const currentValue = ref([] as TreeValue[]);

		watch(
			() => props.modelValue,
			(v) => {
				/**
				 * 不使用currentValue.value = v; 避免同步修改源数据，这里有取消操作
				 * @type {[type]}
				 */
				currentValue.value = v && v.length > 0 ? [...v] : [];
			},
			{ immediate: true }
		);

		watch(
			() => isActive.value,
			(v) => {
				emit('visible-change', v);
			}
		);

		onMounted(() => {
			isActive.value = true;
		});

		/**
		 * 取消兼容
		 */
		const ok = (value: TreeValue[], label: TreeLabel[], data: TreeData[]) => {
			const { onOk } = instance.vnode.props || props;
			onOk ? onOk(value, label, data) : emit('ok', value, label, data);
		};

		/**
		 * 取消兼容
		 */
		const cancel = () => {
			const { onCancel } = instance.vnode.props || props;
			onCancel ? onCancel() : emit('cancel');
		};

		const handleClose = () => {
			isActive.value = false;

			emit('close');
			emit('portal-fulfilled'); // 兼容portal关闭
			// 普通组件
			emit('update:visible', false);
		};

		const handleOk = () => {

			let { label, data } = getSelectedData(currentValue.value, props.dataSource);

			isActive.value = false;

			ok(currentValue.value, label, data);
			// 普通组件
			emit('update:modelValue', currentValue.value, label, data);
			emit('change', currentValue.value, label, data);
		};

		const handleCancel = () => {
			isActive.value = false;
			cancel();
		};

		return {
			isActive,
			currentValue,
			handleOk,
			handleCancel,
			handleClose
		};
	}
});

export default WrapperComponent;
export const Func = new Portal<typeof WrapperComponent>(WrapperComponent, {
	promise: false
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

@include block(vcm-cascader-picker-popup) {
	.vcm-popup__wrapper {
		max-height: 80vh;
		height: 80vh;
		display: flex;
		flex-direction: column;
	}
}
</style>
