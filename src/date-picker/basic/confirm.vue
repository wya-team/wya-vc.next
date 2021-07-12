<template>
	<div class="vc-date-confirm">
		<!-- 需要一个置灰的控制 -->
		<vc-button 
			v-if="showTime"
			size="small" 
			type="text" 
			class="vc-date-confirm__time"
			@click="handleToggleTime"
		>
			{{ label }}
		</vc-button>
		<vc-button size="small" @click="handleClear">
			清空
		</vc-button>
		<vc-button 
			size="small" 
			type="primary"
			style="margin-left: 5px"
			@click="handleConfirm"
		>
			确定
		</vc-button>
	</div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import Button from '../../button/index';

const getTimeType = (type) => {
	let view;
	switch (type) {
		case 'date':
			view = 'time';
			break;
		case 'month':
		case 'year':
		case 'daterange':
			view = 'timerange';
			break;
		case 'time':
			view = 'date';
			break;
		case 'timerange':	
			view = 'daterange';
			break;
		default:
			break;
	}
	return view;
};

export default defineComponent({
	name: 'vc-date-confirm',
	components: {
		'vc-button': Button
	},
	props: {
		showTime: {
			type: Boolean,
			default: false
		},
		currentView: {
			type: [String, Array],
			default: 'date'
		}
	},
	emits: [
		'toggle-time',
		'ok',
		'clear'
	],
	setup(props, { emit }) {
		const label = computed(() => {
			if (Array.isArray(props.currentView)) {
				return props.currentView.every(view => view.includes('time')) ? '选择日期' : '选择时间';
			}
			return props.currentView.includes('date') ? '选择时间' : '选择日期';
		});

		const handleToggleTime = (e) => {
			let view;

			if (Array.isArray(props.currentView)) {
				view = [getTimeType(props.currentView[0]), getTimeType(props.currentView[1])];
			} else {
				view = getTimeType(props.currentView);
			}
			emit('toggle-time', view);
		};
		
		const handleConfirm = (e) => {
			emit('ok', e);
		};

		const handleClear = (e) => {
			emit('clear', e);
		};

		return {
			label,
			handleToggleTime,
			handleConfirm,
			handleClear
		};
	}
});
</script>

<style lang="scss">
@import '../../style/vars.scss';

$block: vc-date-confirm;

@include block($block) {
	border-top: 1px solid #e8eaec;
    text-align: right;
    padding: 8px;
    clear: both;
	@include element(time) {
		float: left;
	}
}
</style>
