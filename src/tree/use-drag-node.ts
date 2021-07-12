import { defineComponent, ref, computed, watch, reactive, onMounted, onUpdated, getCurrentInstance } from 'vue';
import { $ } from '@wya/utils';

export default (store, dropIndicator) => {
	const { props, emit, ctx } = getCurrentInstance();
	const state = ref({
		showDropIndicator: false,
		draggingNode: null,
		dropNode: null,
		allowDrop: true,
		dropType: null
	});

	const handleDragStart = (e, treeNode) => {
		if (typeof props.allowDrag === 'function' && !props.allowDrag(treeNode.props.node)) {
			e.preDefault();
			return false;
		}
		e.dataTransfer.effectAllowed = 'move';

		// wrap in try catch to address IE's error when first param is 'text/plain'
		try {
			// setData is required for draggable to work in FireFox
			// the content has to be '' so dragging a node out of the tree won't open a new tab in FireFox
			e.dataTransfer.setData('text/plain', '');
		} catch (error) {
			// TODO
		}
		state.value.draggingNode = treeNode;
		emit('node-drag-start', treeNode.props.node, e);
	};

	const handleDragOver = (e, treeNode) => {
		const dropNode = treeNode;
		const oldDropNode = state.value.dropNode;

		if (oldDropNode && oldDropNode !== dropNode) {
			$(oldDropNode.ctx.$el).removeClass('is-drop-inner');
		}
		const draggingNode = state.value.draggingNode;

		const { node: $draggingNode } = draggingNode.props;
		const { node: $dropNode } = dropNode.props;

		if (!$draggingNode || !$dropNode) return;

		let dropPrev = true;
		let dropInner = true;
		let dropNext = true;
		let userAllowDropInner = true;
		if (typeof props.allowDrop === 'function') {
			dropPrev = props.allowDrop($draggingNode, $dropNode, 'prev');
			userAllowDropInner = props.allowDrop($draggingNode, $dropNode, 'inner');
			dropInner = userAllowDropInner;
			dropNext = props.allowDrop($draggingNode, $dropNode, 'next');
		}
		e.dataTransfer.dropEffect = dropInner ? 'move' : 'none';
		if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
			if (oldDropNode) {
				emit('node-drag-leave', $draggingNode, oldDropNode.props.node, e);
			}
			emit('node-drag-enter', $draggingNode, $dropNode, e);
		}

		if (dropPrev || dropInner || dropNext) {
			state.value.dropNode = dropNode;
		}

		if ($dropNode.nextSibling === $draggingNode) {
			dropNext = false;
		}
		if ($dropNode.previousSibling === $draggingNode) {
			dropPrev = false;
		}
		if ($dropNode.contains($draggingNode, false)) {
			dropInner = false;
		}
		if ($draggingNode === $dropNode || $draggingNode.contains($dropNode)) {
			dropPrev = false;
			dropInner = false;
			dropNext = false;
		}

		const targetPosition = dropNode.ctx.$el.getBoundingClientRect();
		const treePosition = ctx.$el.getBoundingClientRect();

		let dropType;
		const prevPercent = dropPrev ? (dropInner ? 0.25 : (dropNext ? 0.45 : 1)) : -1;
		const nextPercent = dropNext ? (dropInner ? 0.75 : (dropPrev ? 0.55 : 0)) : 1;

		let indicatorTop = -9999;
		const distance = e.clientY - targetPosition.top;
		if (distance < targetPosition.height * prevPercent) {
			dropType = 'before';
		} else if (distance > targetPosition.height * nextPercent) {
			dropType = 'after';
		} else if (dropInner) {
			dropType = 'inner';
		} else {
			dropType = 'none';
		}

		const iconPosition = dropNode.ctx.$el.querySelector('.vc-tree-node__expand-icon').getBoundingClientRect();
		if (dropType === 'before') {
			indicatorTop = iconPosition.top - treePosition.top;
		} else if (dropType === 'after') {
			indicatorTop = iconPosition.bottom - treePosition.top;
		}
		dropIndicator.value.style.top = indicatorTop + 'px';
		dropIndicator.value.style.left = (iconPosition.right - treePosition.left) + 'px';

		if (dropType === 'inner') {
			$(dropNode.ctx.$el).addClass('is-drop-inner');
		} else {
			$(dropNode.ctx.$el).removeClass('is-drop-inner');
		}


		state.value.showDropIndicator = dropType === 'before' || dropType === 'after';
		
		state.value.allowDrop = state.value.showDropIndicator || userAllowDropInner;
		state.value.dropType = dropType;
		emit('node-drag-over', $draggingNode, $dropNode, e);
	};

	const handleDragEnd = (e) => {
		const { draggingNode, dropType, dropNode } = state.value;		
		const { node: $draggingNode } = draggingNode.props;
		const { node: $dropNode } = dropNode.props;

		e.preventDefault();
		e.dataTransfer.dropEffect = 'move';

		if (draggingNode && dropNode) {
			const draggingNodeCopy = { data: $draggingNode.data };
			if (dropType !== 'none') {
				$draggingNode.remove();
			}
			if (dropType === 'before') {
				$dropNode.parent.insertBefore(draggingNodeCopy, $dropNode);
			} else if (dropType === 'after') {
				$dropNode.parent.insertAfter(draggingNodeCopy, $dropNode);
			} else if (dropType === 'inner') {
				$dropNode.insertChild(draggingNodeCopy);
			}
			if (dropType !== 'none') {
				store.registerNode(draggingNodeCopy);
			}

			$(dropNode.ctx.$el).removeClass('is-drop-inner');

			emit('node-drag-end', $draggingNode, $dropNode, dropType, e);
			if (dropType !== 'none') {
				emit('node-drop', $draggingNode, $dropNode, dropType, e);
			}
		}
		if (draggingNode && !dropNode) {
			emit('node-drag-end', $draggingNode, null, dropType, e);
		}

		state.value.showDropIndicator = false;
		state.value.draggingNode = null;
		state.value.dropNode = null;
		state.value.allowDrop = true;
	};

	return {
		state,
		emit: (e, ...rest) => {
			let methods = {
				'drag-start': handleDragStart,
				'drag-over': handleDragOver,
				'drag-end': handleDragEnd,
			};

			return methods[e] && methods[e](...rest);
		}
	};
};