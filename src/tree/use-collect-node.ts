import { inject, provide, getCurrentInstance } from 'vue';

export default () => {
	const { props } = getCurrentInstance();
	const parentNodeMap = inject('tree-node-map', null);

	const currentNodeMap = {
		treeNodeExpand: node => {
			if (props.node && props.node !== node) {
				props.node.collapse();
			}
		},
		children: []
	};

	if (parentNodeMap) {
		parentNodeMap.children.push(currentNodeMap);
	}

	provide('tree-node-map', currentNodeMap);

	return {
		broadcast: (node) => {
			if (!props.accordion) return;
			for (const childNode of currentNodeMap.children) {
				childNode.treeNodeExpand(node);
			}
		},
	};
};
