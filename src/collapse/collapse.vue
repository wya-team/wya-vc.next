<template>
	<component :is="tag" class="vc-collapse">
		<slot />
	</component>
</template>
<script lang="ts">
import { defineComponent, watch, ref, getCurrentInstance, provide, onMounted, nextTick } from 'vue';

export default defineComponent({
	name: "vc-collapse",
	props: {
		tag: {
			type: String,
			default: 'div'
		},
		accordion: {
			type: Boolean,
			default: false
		},
		modelValue: {
			type: [Array, String, Number]
		},
		remove: {
			type: Boolean,
			default: false
		},
	},
	emits: ['update:moodelValue', 'change'],
	setup(props, { emit }) {
		const instance = getCurrentInstance();
		const currentValue = ref();
		const items = ref([]);

		/**
		 * v-model 同步, 外部的数据改变时不会触发
		 */
		const sync = () => {
			emit('update:moodelValue', currentValue.value);
			emit('change', currentValue.value);
		};

		const getActiveKey = () => {
			let activeKey = currentValue.value || [];
			const accordion = props.accordion;
			if (!Array.isArray(activeKey)) {
				activeKey = [activeKey];
			}
			if (accordion && activeKey.length > 1) {
				activeKey = [activeKey[0]];
			}
			for (let i = 0; i < activeKey.length; i++) {
				activeKey[i] = activeKey[i].toString();
			}
			return activeKey;
		};

		const setActive = () => {
			const activeKey = getActiveKey();

			// onMounted优先与add中nextTick执行
			nextTick(() => {
				items.value.forEach((child, index) => {
					const name = child.props.name || index.toString();
					child.proxy.isActive = activeKey.indexOf(name) > -1;
				});
			});
		};

		const toggle = (data) => {
			const name = data.name.toString();
			let result = [];
			if (props.accordion) {
				if (!data.isActive) {
					result.push(name);
				}
			} else {
				let activeKey = getActiveKey();
				const nameIndex = activeKey.indexOf(name);
				if (data.isActive) {
					if (nameIndex > -1) {
						activeKey.splice(nameIndex, 1);
					}
				} else if (nameIndex < 0) {
					activeKey.push(name);
				}
				result = activeKey;
			}
			currentValue.value = result;
			sync();
		};

		// 添加元素
		const add = item => {
			if (!item) return;
			// vnode动态时排序
			nextTick(() => {
				if (instance.vnode.el) {
					let index = Array
						.from(instance.vnode.el.children)
						.filter(i => /vcm?-collapse-item/.test(i.className))
						.indexOf(item.vnode.el);
					if (index != -1) {
						items.value.splice(index, 0, item);
						typeof item.proxy.index === 'undefined' && (
							item.proxy.index = index
						);
						return;
					}
				}
				items.value.push(item);
				typeof item.proxy.index === 'undefined' && (
					item.proxy.index = items.value.length - 1
				);
			});
		};

		// 删除元素
		const remove = item => {
			if (!item) return;
			items.value.splice(items.value.indexOf(item), 1);
			// v-if的影响
			items.value.forEach((i, index) => (i.proxy.index = index));
		};

		provide('collapse', {
			props,
			toggle,
			add,
			remove
		});

		watch(
			() => props.modelValue,
			(v) => {
				currentValue.value = v;
			},
			{ immediate: true }
		);

		watch(
			() => currentValue.value,
			setActive
		);

		onMounted(setActive);

		return {
			currentValue,
			toggle
		};
	}
});
</script>
