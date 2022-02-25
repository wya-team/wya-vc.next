
import { defineComponent, provide, ref, computed, watch, reactive, onMounted, onUpdated, getCurrentInstance } from 'vue';
import { $ } from '@wya/utils';
import TreeStore from './model/tree-store';
import { getNodeKey as $getNodeKey } from './model/util';
import TreeNode from './tree-node';
import useDragNode from './use-drag-node';
import useCollectNode from './use-collect-node';

export default () => {
	const { vnode } = getCurrentInstance();
	const treeItems = ref(null);
	const checkboxItems = ref([]);
	const treeItemArray = computed(() => {
		return Array.prototype.slice.call(treeItems.value);
	});

	const initTabIndex = () => {
		treeItems.value = vnode.el.querySelectorAll('.is-focusable[role=treeitem]');
		checkboxItems.value = vnode.el.querySelectorAll('input[type=checkbox]');
		const checkedItem = vnode.el.querySelectorAll('.is-checked[role=treeitem]');
		if (checkedItem.length) {
			checkedItem[0].setAttribute('tabindex', 0);
			return;
		}
		treeItems.value[0] && treeItems.value[0].setAttribute('tabindex', 0);
	};

	const handleKeydown = (ev) => {
		const currentItem = ev.target;
		if (currentItem.className.indexOf('vc-tree-node') === -1) return;
		const keyCode = ev.keyCode;
		treeItems.value = vnode.el.querySelectorAll('.is-focusable[role=treeitem]');
		const currentIndex = treeItemArray.value.indexOf(currentItem);
		let nextIndex;
		if ([38, 40].indexOf(keyCode) > -1) { // up、down
			ev.preventDefault();
			if (keyCode === 38) { // up
				nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0;
			} else {
				nextIndex = (currentIndex < treeItemArray.value.length - 1) ? currentIndex + 1 : 0;
			}
			treeItemArray.value[nextIndex].focus(); // 选中
		}
		if ([37, 39].indexOf(keyCode) > -1) { // left、right 展开
			ev.preventDefault();
			currentItem.click(); // 选中
		}
		const hasInput = currentItem.querySelector('[type="checkbox"]');
		if ([13, 32].indexOf(keyCode) > -1 && hasInput) { // space enter选中checkbox
			ev.preventDefault();
			hasInput.click();
		}
	};

	watch(
		() => checkboxItems.value,
		(v) => {
			Array.prototype.forEach.call(v, (checkbox) => {
				checkbox.setAttribute('tabindex', -1);
			});
		}
	);

	onMounted(() => {
		initTabIndex();
		vnode.el.addEventListener('keydown', handleKeydown);
	});

	onUpdated(() => {
		treeItems.value = vnode.el.querySelectorAll('[role=treeitem]');
		checkboxItems.value = vnode.el.querySelectorAll('input[type=checkbox]');

		vnode.el.removeEventListener('keydown', handleKeydown);
	});

	return {
		treeItems,
		treeItemArray,
	};
};