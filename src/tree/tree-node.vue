<template>
	<div
		v-show="node.visible"
		ref="node"
		:class="{
			'is-expanded': expanded,
			'is-current': node.isCurrent,
			'is-hidden': !node.visible,
			'is-focusable': !node.disabled,
			'is-checked': !node.disabled && node.checked
		}"
		:aria-expanded="expanded"
		:aria-disabled="node.disabled"
		:aria-checked="node.checked"
		:draggable="tree.props.draggable"
		class="vc-tree-node"
		role="treeitem"
		tabindex="-1"
		@click.stop="handleClick"
		@contextmenu="handleContextMenu($event)"
		@dragstart.stop="handleDragStart"
		@dragover.stop="handleDragOver"
		@dragend.stop="handleDragEnd"
		@drop.stop="handleDrop"
	>	
		<div :style="{ 'padding-left': (node.level - 1) * tree.props.indent + 'px' }" class="vc-tree-node__content">
			<span
				:class="[
					{ 
						'is-expand': !node.isLeaf && expanded,
						'is-leaf': node.isLeaf
					}
				]"
				class="vc-tree-node__expand-icon"
				@click.stop="handleExpandIconClick"
			>
				<vc-icon type="triangle-up" />
			</span>
			<!-- eslint-disable -->
			<vc-checkbox
				v-if="showCheckbox"
				v-model="node.checked"
				:indeterminate="node.indeterminate"
				:disabled="!!node.disabled"
				@click.native.stop
				@change="handleCheckChange"
			/>
			<!-- eslint-enable -->
			<vc-spin 
				v-if="node.loading" 
				:size="12"
				class="vc-tree-node__loading-icon" 
			/>
			<vc-customer 
				v-if="renderContent" 
				:render="renderContent" 
				:node="node"
				:it="node.data"
			/>
			<span v-else>{{ node.label }}</span>
		</div>
		<vc-transition-collapse>
			<div
				v-if="!renderAfterExpand || childNodeRendered"
				v-show="expanded"
				:aria-expanded="expanded"
				class="vc-tree-node__children"
				role="group"
			>
				<vc-tree-node
					v-for="child in node.childNodes"
					:key="getNodeKey(child)"
					:render-content="renderContent"
					:render-after-expand="renderAfterExpand"
					:show-checkbox="showCheckbox"
					:allow-dispatch="allowDispatch"
					:node="child"
					@node-expand="handleChildNodeExpand"
				/>
			</div>
		</vc-transition-collapse>
	</div>
</template>

<script>
import { getCurrentInstance, defineComponent, inject, ref, watch, computed, nextTick, onMounted } from 'vue';
import Transition from '../transition';
import Checkbox from '../checkbox';
import Customer from '../customer';
import Spin from '../spin';
import Icon from '../icon';
import { VcError } from '../vc';
import { getNodeKey as $getNodeKey } from './model/util';
import useCollectNode from './use-collect-node';

export default defineComponent({
	name: 'vc-tree-node',
	components: {
		'vc-transition-collapse': Transition.Collapse,
		'vc-checkbox': Checkbox,
		'vc-customer': Customer,
		'vc-icon': Icon,
		'vc-spin': Spin,
	},
	props: {
		node: {
			type: Object,
			default: () => ({})
		},
		renderContent: Function,
		renderAfterExpand: {
			type: Boolean,
			default: true
		},
		showCheckbox: {
			type: Boolean,
			default: false
		},
		accordion: {
			type: Boolean,
			default: false
		},
		allowDispatch: {
			type: Boolean,
			default: true
		}
	},
	setup(props, context) {
		const instance = getCurrentInstance();
		const { ctx, emit } = instance;
		const collector = useCollectNode();
		
		const tree = inject('tree', {});
		const formItem = inject('form-item', {});

		const expanded = ref(false);
		const childNodeRendered = ref(false);
		const oldChecked = ref(null);
		const oldIndeterminate = ref(null);
	
		const getNodeKey = (node) => {
			return $getNodeKey(tree.props.treeProps.value, node.data);
		};

		const handleSelectChange = (checked, indeterminate) => {
			if (oldChecked.value !== checked && oldIndeterminate.value !== indeterminate) {
				tree.emit('check-change', props.node.data, checked, indeterminate);
			}
			oldChecked.value = checked;
			oldIndeterminate.value = indeterminate;
		};

		const handleCheckChange = (value, ev) => {
			props.node.setChecked(ev.target.checked, !tree.checkStrictly);
			nextTick(() => {
				const store = tree.store;
				let data = {
					checkedNodes: store.getCheckedNodes(),
					checkedKeys: store.getCheckedKeys(),
					halfCheckedNodes: store.getHalfCheckedNodes(),
					halfCheckedKeys: store.getHalfCheckedKeys(),
				};
				tree.emit('check', props.node.data, data);

				// for v-model
				tree.emit('change', data.checkedKeys, data);
				tree.emit('update:modelValue', data.checkedKeys, data);
				props.allowDispatch && formItem?.change?.();
			});
		};

		const handleExpandIconClick = () => {
			if (props.node.isLeaf) return;
			if (expanded.value) {
				tree.emit('node-collapse', props.node.data, props.node, instance);
				props.node.collapse();
			} else {
				props.node.expand();
				emit('node-expand', props.node.data, props.node, instance);
			}
		};

		const handleClick = () => {
			const store = tree.store;
			store.setCurrentNode(props.node);
			tree.emit('current-change', store.currentNode ? store.currentNode.data : null, store.currentNode);

			tree.currentNode.value = instance;

			if (tree.props.expandOnClickNode) {
				handleExpandIconClick();
			}
			if (tree.props.checkOnClickNode && !props.node.disabled) {
				handleCheckChange(null, {
					target: { checked: !props.node.checked }
				});
			}
			tree.emit('node-click', props.node.data, props.node, instance);
		};

		const handleContextMenu = (e) => {
			if (tree.instance.vnode.props['onNodeContextmenu']) {
				e.stopPropagation();
				e.preventDefault();
			}
			tree.emit('node-contextmenu', e, props.node.data, props.node, instance);
		};

		const handleChildNodeExpand = (nodeData, node, $instance) => {
			collector.broadcast(node);
			tree.emit('node-expand', nodeData, node, $instance);
		};

		const handleDragStart = (e) => {
			if (!tree.props.draggable) return;
			tree.drag.emit('drag-start', e, instance);
		};

		const handleDragOver = (e) => {
			if (!tree.props.draggable) return;
			tree.drag.emit('drag-over', e, instance);
			e.preventDefault();
		};

		const handleDrop = (e) => {
			e.preventDefault();
		};

		const handleDragEnd = (e) => {
			if (!tree.props.draggable) return;
			tree.drag.emit('drag-end', e, instance);
		};

		watch(
			() => {
				const childrenKey = tree.props.treeProps.children || 'children';
				return props.node.data[childrenKey];
			},
			(v) => {
				handleSelectChange(props.node.checked, v);
			}
		);

		watch(
			() => props.node.indeterminate,
			(v) => {
				handleSelectChange(props.node.checked, v);
			}
		);

		watch(
			() => props.node.checked,
			(v) => {
				handleSelectChange(v, props.node.indeterminate);
			}
		);

		watch(
			() => props.node.expanded,
			(v) => {
				nextTick(() => expanded.value = v);
				if (v) {
					childNodeRendered.value = true;
				}
			}
		);

		if (props.node.expanded) {
			expanded.value = true;
			childNodeRendered.value = true;
		}

		return {
			tree,
			expanded,
			childNodeRendered,
			oldChecked,
			oldIndeterminate,

			getNodeKey,
			handleSelectChange,
			handleClick,
			handleContextMenu,
			handleExpandIconClick,
			handleCheckChange,
			handleChildNodeExpand,
			handleDragStart,
			handleDragOver,
			handleDrop,
			handleDragEnd,
		};
	}
});
</script>
