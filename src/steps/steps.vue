<template>
	<div :class="stepsClasses" class="vc-steps">
		<slot />
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, watch, computed, getCurrentInstance, nextTick, provide } from 'vue';
import { debounce } from 'lodash';

export default defineComponent({
	name: "vc-steps",
	props: {
		current: [Number, String], // 当前位置
		vertical: {
			type: Boolean,
			defualt: false,
		},
		size: {
			type: String,
			defualt: 'default',
			validator(value) {
				return ['default', 'small'].includes(value);
			}
		},
		// 当初步骤的状态 
		status: {
			type: String,
			default: 'process',
			validator(value) {
				return ['wait', 'process', 'finish', 'error'].includes(value);
			}
		}
	},
	setup(props) {
		const instance = getCurrentInstance();
		const items = ref([]);
		const stepsClasses = computed(() => {
			return { 
				'is-vertical': props.vertical,
				'is-small': props.size === 'small'
			};
		});

		const add = item => {
			if (!item) return;
			// vnode动态时排序
			nextTick(() => {
				let index = items.value.length;
				if (instance.vnode.el) {
					let $index = Array
						.from(instance.vnode.el.children)
						.filter(i => /vcm?-steps-step/.test(i.className))
						.indexOf(item.vnode.el);
					index = $index !== -1 ? $index : index;
				}
				items.value.splice(index, 0, item);

				item.proxy.stepNumber = index + 1;
				item.proxy.total = items.value.length;
			});
		};

		const remove = item => {
			if (!item) return;
			items.value.splice(items.value.indexOf(item), 1);

			// 重置排序
			items.value.forEach((i, index) => {
				i.proxy.stepNumber = index + 1;
				i.proxy.total = items.value.length;
			});
		};

		provide('steps', {
			props,
			add,
			remove
		});

		return {
			stepsClasses
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';

@include block(vc-steps) {
    display: flex;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    color: rgba(0,0,0,.85);
    font-size: 14px;
    line-height: 1.5715;
    list-style: none;
    width: 100%;
    font-size: 0;
    text-align: initial;
	@include when(vertical) {
		flex-direction: column;
		.vc-steps-step {
			padding-left: 0;
		}
		.vc-steps-step__tail {
			display: block;
		}
		.vc-steps-step__title {
			&::after {
				display: none
			}
		}
	}
	@include when(small) {
		.vc-steps-step__icon {
			width: 24px;
			height: 24px;
			margin: 0 8px 0 0;
			font-size: 12px;
			line-height: 24px;
			text-align: center;
			border-radius: 24px;
		}
		.vc-steps-step__title { 
			padding-right: 12px;
			font-size: 14px;
			line-height: 24px;
			&::after {
				top: 12px;
			}
		}
	}
}
</style>