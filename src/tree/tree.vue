<template>
	<div
		:class="{
			'vc-tree--highlight-current': highlightCurrent,
			'is-dragging': !!dragState.draggingNode,
			'is-drop-not-allow': !dragState.allowDrop,
			'is-drop-inner': dragState.dropType === 'inner'
		}"
		class="vc-tree"
		role="tree"
	>
		<vc-tree-node
			v-for="child in root.childNodes"
			:key="getNodeKey(child)"
			:node="child"
			:tree-props="treeProps"
			:render-after-expand="renderAfterExpand"
			:show-checkbox="showCheckbox"
			:render-content="renderContent"
			:accordion="accordion"
			:allow-dispatch="allowDispatch"
			@node-expand="handleNodeExpand"
		/>
		<div v-if="isEmpty" class="vc-tree__empty-block">
			<span class="vc-tree__empty-text">{{ emptyText }}</span>
		</div>
		<div
			v-show="dragState.showDropIndicator"
			ref="dropIndicator"
			class="vc-tree__drop-indicator"
		/>
	</div>
</template>

<script lang="ts">
import { defineComponent, provide, ref, computed, watch, reactive, onMounted, onUpdated, getCurrentInstance } from 'vue';
import { $ } from '@wya/utils';
import TreeStore from './model/tree-store';
import { getNodeKey as $getNodeKey } from './model/util';
import TreeNode from './tree-node';
import useDragNode from './use-drag-node';
import useKeydown from './use-keydown';
import useCollectNode from './use-collect-node';

export default defineComponent({
	name: 'vc-tree',
	components: {
		'vc-tree-node': TreeNode
	},
	props: {
		dataSource: {
			type: Array
		},
		emptyText: {
			type: String,
			default: '暂无数据'
		},
		renderAfterExpand: {
			type: Boolean,
			default: true
		},
		checkStrictly: {
			type: Boolean,
			default: false
		},
		defaultExpandAll: Boolean,
		expandOnClickNode: {
			type: Boolean,
			default: true
		},
		checkOnClickNode: Boolean,
		checkDescendants: {
			type: Boolean,
			default: false
		},
		autoExpandParent: {
			type: Boolean,
			default: true
		},
		// checkedKeys -> modelValue
		modelValue: {
			type: Array,
			default: () => ([])
		},
		expandedKeys: {
			type: Array,
			default: () => ([])
		},
		currentNodeKey: [String, Number],
		renderContent: Function,
		showCheckbox: {
			type: Boolean,
			default: false
		},
		draggable: {
			type: Boolean,
			default: false
		},
		allowDrag: Function,
		allowDrop: Function,
		lazy: {
			type: Boolean,
			default: false
		},
		highlightCurrent: Boolean,
		loadData: Function,
		filterNode: Function,
		accordion: Boolean,
		indent: {
			type: Number,
			default: 18
		},
		iconClassName: String,
		treeProps: {
			type: Object,
			default: () => ({
				children: 'children',
				label: 'label',
				value: 'value',
				disabled: 'disabled',
				isLeaf: 'isLeaf'
			})
		},
		allowDispatch: {
			type: Boolean,
			default: true
		}
	},
	emits: [
		'update:modelValue',
		'change',
		'check-change',
		'current-change',
		'node-click',
		'node-contextmenu',
		'node-collapse',
		'node-expand',
		'check',
		'node-drag-start',
		'node-drag-end',
		'node-drop',
		'node-drag-leave',
		'node-drag-enter',
		'node-drag-over'
	],
	setup(props, context) {
		const instance = getCurrentInstance();
		const { ctx, emit } = instance;
		const store = new TreeStore({
			key: props.treeProps.value,
			data: props.dataSource,
			lazy: props.lazy,
			props: props.treeProps,
			loadData: props.loadData,
			currentNodeKey: props.currentNodeKey,
			checkStrictly: props.checkStrictly,
			checkDescendants: props.checkDescendants,
			checkedKeys: [...props.modelValue], // 避免浅拷贝修改
			expandedKeys: [...props.expandedKeys],
			autoExpandParent: props.autoExpandParent,
			defaultExpandAll: props.defaultExpandAll,
			filterNode: props.filterNode
		});
		const root = store.root;
		const currentNode = ref(null);
		const dropIndicator = ref(null);

		const drag = useDragNode(store, dropIndicator);
		const collector = useCollectNode();

		const isEmpty = computed(() => {
			const { childNodes } = root;
			return !childNodes || childNodes.length === 0 || childNodes.every(({ visible }) => !visible);
		});

		watch(
			() => props.modelValue,
			(v) => {
				/**
				 * [...v], 避免同一引用
				 */
				store.setCheckedKeys([...v]);
			}
		);

		watch(
			() => props.expandedKeys,
			(v) => {
				/**
				 * [...v], 避免同一引用
				 */
				store.setExpandedKeys([...v]);
			}
		);

		watch(
			() => props.dataSource,
			(v) => {
				store.setData(v);
			}
		);

		watch(
			() => props.checkStrictly,
			(v) => {
				store.checkStrictly = v;
			}
		);

		const filter = (value) => {
			if (!props.filterNode) throw new Error('[Tree] filterNode is required when filter');
			store.filter(value);
		};

		const getNodeKey = (node) => {
			return $getNodeKey(props.treeProps.value, node.data);
		};

		const getNodePath = (data) => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in getNodePath');
			const node = store.getNode(data);
			if (!node) return [];
			const path = [node.data];
			let parent = node.parent;
			while (parent && parent !== root) {
				path.push(parent.data);
				parent = parent.parent;
			}
			return path.reverse();
		};

		const getCheckedNodes = (leafOnly, includeHalfChecked) => {
			return store.getCheckedNodes(leafOnly, includeHalfChecked);
		};

		const getCheckedKeys = (leafOnly) => {
			return store.getCheckedKeys(leafOnly);
		};

		const getCurrentNode = () => {
			const $currentNode = store.getCurrentNode();
			return $currentNode ? $currentNode.data : null;
		};

		const getCurrentKey = () => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in getCurrentKey');
			const $currentNode = getCurrentNode();
			return $currentNode ? $currentNode[props.treeProps.value] : null;
		};

		const setCheckedNodes = (nodes, leafOnly) => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in setCheckedNodes');
			store.setCheckedNodes(nodes, leafOnly);
		};

		const setCheckedKeys = (keys, leafOnly) => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in setCheckedKeys');
			store.setCheckedKeys(keys, leafOnly);
		};

		const setChecked = (data, checked, deep) => {
			store.setChecked(data, checked, deep);
		};

		const getHalfCheckedNodes = () => {
			return store.getHalfCheckedNodes();
		};

		const getHalfCheckedKeys = () => {
			return store.getHalfCheckedKeys();
		};

		const setCurrentNode = (node) => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in setCurrentNode');
			store.setUserCurrentNode(node);
		};

		const setCurrentKey = (key) => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in setCurrentKey');
			store.setCurrentNodeKey(key);
		};

		const getNode = (data) => {
			return store.getNode(data);
		};

		const remove = (data) => {
			store.remove(data);
		};

		const append = (data, parentNode) => {
			store.append(data, parentNode);
		};

		const insertBefore = (data, refNode) => {
			store.insertBefore(data, refNode);
		};

		const insertAfter = (data, refNode) => {
			store.insertAfter(data, refNode);
		};

		const handleNodeExpand = (nodeData, node, $instance) => {
			collector.broadcast(node);
			emit('node-expand', nodeData, node, $instance);
		};

		const updateKeyChildren = (key, data) => {
			if (!props.treeProps.value) throw new Error('[Tree] treeProps.value is required in updateKeyChild');
			store.updateChildren(key, data);
		};

		useKeydown();
		provide('tree', {
			props,
			store,
			root,
			emit,
			currentNode,
			drag,
			instance
		});

		return {
			// el
			dropIndicator,

			root,
			store,
			
			currentNode,

			dragState: drag.state,
			isEmpty,

			// methods
			filter,
			getNodeKey,
			getNodePath,
			getCheckedNodes,
			getCheckedKeys,
			getCurrentNode,
			getCurrentKey,
			setCheckedNodes,
			setCheckedKeys,
			setChecked,
			getHalfCheckedNodes,
			getHalfCheckedKeys,
			setCurrentNode,
			setCurrentKey,
			getNode,
			remove,
			append,
			insertBefore,
			insertAfter,
			handleNodeExpand,
			updateKeyChildren,
		};
	}
});
</script>
