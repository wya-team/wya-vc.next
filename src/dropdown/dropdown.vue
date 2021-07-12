<template>
	<vc-popover
		v-bind="attrs"
		:model-value="isActive"
		:placement="placement"
		:trigger="trigger"
		:arrow="arrow"
		:portal-class-name="['is-padding-none', portalClassName]"
		:class="inherit.calss"
		:style="inherit.style"
		class="vc-dropdown"
		@ready="$emit('ready')"
		@close="$emit('close')"
		@visible-change="handleChange"
	>
		<slot />
		<template #content>
			<slot name="list" />
		</template>
	</vc-popover>
</template>
<script lang="ts">
import { defineComponent, watch, computed, ref, provide } from 'vue';
import { pick } from 'lodash';
import Popover from "../popover/index";
import { getUid } from '../utils/index';
import { useAttrs } from '../hooks';

export default defineComponent({
	name: "vc-dropdown",
	components: {
		'vc-popover': Popover
	},
	inheritAttrs: false,
	props: {
		...pick(Popover.props, [
			'modelValue',
			'portalClassName'
		]),
		placement: {
			type: String,
			default: 'bottom'
		},
		trigger: {
			type: String,
			default: 'hover'
		},
		arrow: {
			type: Boolean,
			default: false
		}
	},
	emits: ['update:modelValue', 'ready', 'close', 'visible-change', 'click'],
	setup(props, context) {
		const { emit } = context;
		const its = useAttrs({ standard: false });
		const isActive = ref(false);
		const dropdownId = ref(getUid('dropdown'));

		const inherit = computed(() => {
			return {
				style: its.value.style,
				class: its.value.class,
			};
		});

		const attrs = computed(() => {
			return its.value.attrs;
		});



		watch(
			() => props.modelValue,
			(v) => {
				isActive.value = v;
			},
			{ immediate: true }
		);

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			emit('update:modelValue', isActive.value);
			emit('visible-change', isActive.value);
		};

		const handleChange = (v) => {
			isActive.value = v;
			sync();
		};

		const close = () => {
			isActive.value = false;
			sync();
		};

		return {
			attrs,
			inherit,
			isActive,
			handleChange,
			dropdownId,
			close
		};
	}
});
</script>
<style lang="scss">
@import '../style/vars.scss';
$block: vc-dropdown;

@include block($block) {
	display: inline-block;
}
</style>