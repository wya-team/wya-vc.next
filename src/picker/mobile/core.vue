<template>
	<vcm-picker-popup
		v-model="isActive"
		:title="title"
		:cancel-text="cancelText"
		:ok-text="okText"
		:show-toolbar="showToolbar"	
		@ok="handleOk"
		@cancel="handleCancel"
		@close="handleClose"
	>
		<vcm-picker-view 
			v-model="currentValue"
			:data-source="dataSource"
			:cols="cols"
			:item-style="itemStyle"
			:cascade="cascade"
			:allow-dispatch="false"
			@picker-change="(v, index) => $emit('picker-change', v, index)"
		/>
	</vcm-picker-popup>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed, onMounted, getCurrentInstance } from 'vue';
import { pick } from 'lodash';
import MPickerPopup from './picker-popup';	
import MPickerView from './picker-view';	
import Portal from '../../portal/index';
import { getSelectedData } from '../../utils/index';

const wrapperComponent = defineComponent({
	name: 'vcm-picker-core',
	components: {
		'vcm-picker-popup': MPickerPopup,
		'vcm-picker-view': MPickerView
	},
	// inheritAttrs: false, Portal暂时无法使用
	props: {
		...pick(MPickerPopup.props, [
			'title',
			'cancelText',
			'okText',
			'showToolbar'
		]),
		...pick(MPickerView.props, [
			'modelValue',
			'dataSource',
			'itemStyle',
			'cols',
			'cascade'	
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
		'change',
		'cancel',
		'ok',
		'close',
		'portal-fulfilled',
		'picker-change', 
		'visible-change'
	],
	setup(props, context) {
		const instance = getCurrentInstance();
		const { emit } = context;
		const isActive = ref(false);
		const currentValue = ref([]);

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
			},
		);

		onMounted(() => {
			isActive.value = true;
		});

		const handleClose = () => {
			isActive.value = false;

			emit('close');
			emit('portal-fulfilled'); // 兼容portal关闭

			// 普通组件
			emit('update:visible', false);
		};

		/**
		 * 取消兼容
		 * TODO: v3.x可直接使用onOk
		 */
		const ok = (value, label, data) => {
			const { onOk } = instance.vnode.props;
			onOk ? onOk(value, label, data) : emit('ok', value, label, data);
		};

		/**
		 * 取消兼容
		 * TODO: v3.x可直接使用onCancel
		 */
		const cancel = () => {
			const { onCancel } = instance.vnode.props;
			onCancel ? onCancel() : emit('cancel');
		};

		const handleOk = () => {

			let { label, data } = getSelectedData(currentValue.value, props.dataSource);

			isActive.value = false;

			ok(currentValue.value, label, data);
			// 普通组件
			emit('change', currentValue.value, label, data);
			emit('update:modelValue', currentValue.value, label, data);
		};

		const handleCancel = (v) => {
			isActive.value = false;
			cancel();
		};

		return {
			isActive,
			currentValue,
			handleClose,
			handleCancel,
			handleOk,
		};
	}
});

export default wrapperComponent;
export const Func = new Portal(wrapperComponent, {
	promise: false
});
</script>
