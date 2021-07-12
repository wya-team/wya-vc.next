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
		<vcm-date-picker-view 
			ref="target"
			v-model="currentValue"
			:mode="mode"
			:min-date="minDate"
			:max-date="maxDate"
			:start-hour="startHour"	
			:end-hour="endHour"	
			:allow-dispatch="false"
			@picker-change="(v, index) => $emit('picker-change', v, index)"
		/>
	</vcm-picker-popup>
</template>

<script>
import { defineComponent, watch, inject, ref, onUnmounted, onMounted, computed, getCurrentInstance } from 'vue';
import { pick } from 'lodash';
import MPicker from '../../picker/index.m';	
import MDatePickerView from './date-picker-view';	
import Portal from '../../portal/index';
import { isBefore } from '../utils';

const wrapperComponent = defineComponent({
	name: 'vcm-picker-core',
	components: {
		'vcm-picker-popup': MPicker.Popup,
		'vcm-date-picker-view': MDatePickerView
	},
	// inheritAttrs: false, Portal暂时无法使用
	props: {
		...pick(MPicker.Popup.props, [
			'title',
			'cancelText',
			'okText',
			'showToolbar'
		]),
		...pick(MDatePickerView.props, [
			'mode',
			'minDate',
			'maxDate',
			'startHour',
			'endHour',
			'modelValue'
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
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		const isActive = ref(false);
		const currentValue = ref('');

		const defaultValue = computed(() => {
			const now = new Date();
			return isBefore(now, props.minDate) ? props.minDate : now;
		});

		/**
		 * 对值进行校正，如超出边界值时更正为边界值
		 * force 是否在没有初始值时强制赋予默认值
		 */
		const correct = (target, force = false) => {
			// TODO: 季度模式数据校正处理
			if (props.mode === 'quarter') return target;
			if (!target) return force ? defaultValue.value : target;
			if (isBefore(target, props.minDate)) return props.minDate;
			if (isBefore(props.maxDate, target)) return props.minDate;
			return target;
		};

		/**
		 * ok兼容
		 */
		const ok = (it) => {
			it = it ? correct(it) : props.minDate;
			currentValue.value = it;
			const onOk = instance.vnode.props.onOk || props.onOk;
			onOk ? onOk(it) : emit('ok', it);
		};
		/**
		 * 取消兼容
		 */
		const cancel = () => {
			const onCancel = instance.vnode.props.onCancel || props.onCancel;
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

			isActive.value = false;

			ok(currentValue.value);
			// 普通组件
			emit('change', currentValue.value);
		};

		const handleCancel = (v) => {
			isActive.value = false;
			cancel();
		};

		watch(
			() => props.modelValue,
			(v) => {
				currentValue.value = correct(v, true);
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

		return {
			isActive,
			currentValue,
			defaultValue,
			handleOk,
			handleCancel,
			handleClose
		};
	}
});

export default wrapperComponent;
export const Func = new Portal(wrapperComponent, {
	promise: false
});
</script>

<style lang="scss">
</style>
