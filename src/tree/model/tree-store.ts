import { reactive } from 'vue';
import { isEqualWith, difference } from 'lodash';
import { Utils } from '@wya/utils';
import Node from './node';
import { getNodeKey } from './util';

export default class TreeStore {
	constructor(options) {
		this.currentNode = null;
		this.currentNodeKey = null;
		
		for (let option in options) {
			if (Utils.hasOwn(options, option)) {
				this[option] = options[option];
			}
		}

		this.nodesMap = {};

		this.root = reactive(
			new Node({
				data: this.data,
				store: this
			})
		);
		// 不处理自动加载一次
		this._initDefaultCheckedNodes();
	}

	filter(value) {
		const filterNode = this.filterNode;
		const lazy = this.lazy;
		const traverse = function (node) {
			const childNodes = node.root ? node.root.childNodes : node.childNodes;

			childNodes.forEach((child) => {
				child.visible = filterNode.call(child, value, child.data, child);

				traverse(child);
			});

			if (!node.visible && childNodes.length) {
				let allHidden = true;

				childNodes.forEach((child) => {
					if (child.visible) allHidden = false;
				});

				if (node.root) {
					node.root.visible = allHidden === false;
				} else {
					node.visible = allHidden === false;
				}
			}
			if (!value) return;

			if (node.visible && !node.isLeaf && !lazy) node.expand();
		};

		traverse(this);
	}

	setData(newVal) {
		const instanceChanged = newVal !== this.root.data;
		if (instanceChanged) {
			this.root.setData(newVal);
			this._initDefaultCheckedNodes();
		} else {
			this.root.updateChildren();
		}
	}

	getNode(data) {
		if (data instanceof Node) return data;
		const key = typeof data !== 'object' ? data : getNodeKey(this.key, data);
		return this.nodesMap[key] || null;
	}

	insertBefore(data, refData) {
		const refNode = this.getNode(refData);
		refNode.parent.insertBefore({ data }, refNode);
	}

	insertAfter(data, refData) {
		const refNode = this.getNode(refData);
		refNode.parent.insertAfter({ data }, refNode);
	}

	remove(data) {
		const node = this.getNode(data);

		if (node && node.parent) {
			if (node === this.currentNode) {
				this.currentNode = null;
			}
			node.parent.removeChild(node);
		}
	}

	append(data, parentData) {
		const parentNode = parentData ? this.getNode(parentData) : this.root;

		if (parentNode) {
			parentNode.insertChild({ data });
		}
	}

	_initDefaultCheckedNodes() {
		const checkedKeys = this.checkedKeys || [];
		const nodesMap = this.nodesMap;

		checkedKeys.forEach((checkedKey) => {
			const node = nodesMap[checkedKey];

			if (node) {
				node.setChecked(true, !this.checkStrictly);
			}
		});
	}

	_initDefaultCheckedNode(node) {
		const checkedKeys = this.checkedKeys || [];

		if (checkedKeys.indexOf(node.key) !== -1) {
			node.setChecked(true, !this.checkStrictly);
		}
	}

	setCheckedKeys(newVal) {
		if (!isEqualWith(newVal, this.checkedKeys)) {
			// 额外处理, 移除checkbox
			difference(this.checkedKeys, newVal).forEach((key) => {
				this.nodesMap[key] 
					&& this.nodesMap[key].setChecked(false, !this.checkStrictly);
			});

			this.checkedKeys = newVal;
			this._initDefaultCheckedNodes();
		}
	}

	registerNode(node) {
		const key = this.key;
		if (!key || !node || !node.data) return;

		const nodeKey = node.key;
		if (nodeKey !== undefined) this.nodesMap[node.key] = node;
	}

	deregisterNode(node) {
		const key = this.key;
		if (!key || !node || !node.data) return;

		node.childNodes.forEach(child => {
			this.deregisterNode(child);
		});

		delete this.nodesMap[node.key];
	}

	getCheckedNodes(leafOnly = false, includeHalfChecked = false) {
		const checkedNodes = [];
		const traverse = function (node) {
			const childNodes = node.root ? node.root.childNodes : node.childNodes;

			childNodes.forEach((child) => {
				if ((child.checked || (includeHalfChecked && child.indeterminate)) && (!leafOnly || (leafOnly && child.isLeaf))) {
					checkedNodes.push(child.data);
				}

				traverse(child);
			});
		};

		traverse(this);

		return checkedNodes;
	}

	getCheckedKeys(leafOnly = false) {
		return this.getCheckedNodes(leafOnly).map((data) => (data || {})[this.key]);
	}

	getHalfCheckedNodes() {
		const nodes = [];
		const traverse = function (node) {
			const childNodes = node.root ? node.root.childNodes : node.childNodes;

			childNodes.forEach((child) => {
				if (child.indeterminate) {
					nodes.push(child.data);
				}

				traverse(child);
			});
		};

		traverse(this);

		return nodes;
	}

	getHalfCheckedKeys() {
		return this.getHalfCheckedNodes().map((data) => (data || {})[this.key]);
	}

	_getAllNodes() {
		const allNodes = [];
		const nodesMap = this.nodesMap;
		for (let nodeKey in nodesMap) {
			if (Utils.hasOwn(nodesMap, nodeKey)) {
				allNodes.push(nodesMap[nodeKey]);
			}
		}

		return allNodes;
	}

	updateChildren(key, data) {
		const node = this.nodesMap[key];
		if (!node) return;
		const childNodes = node.childNodes;
		for (let i = childNodes.length - 1; i >= 0; i--) {
			const child = childNodes[i];
			this.remove(child.data);
		}
		for (let i = 0, j = data.length; i < j; i++) {
			const child = data[i];
			this.append(child, node.data);
		}
	}

	_setCheckedKeys(key, leafOnly = false, checkedKeys) {
		const allNodes = this._getAllNodes().sort((a, b) => b.level - a.level);
		const cache = Object.create(null);
		const keys = Object.keys(checkedKeys);
		allNodes.forEach(node => node.setChecked(false, false));
		for (let i = 0, j = allNodes.length; i < j; i++) {
			const node = allNodes[i];
			const nodeKey = node.data[key].toString();
			let checked = keys.indexOf(nodeKey) > -1;
			if (!checked) {
				if (node.checked && !cache[nodeKey]) {
					node.setChecked(false, false);
				}
			} else {
				let parent = node.parent;
				while (parent && parent.level > 0) {
					cache[parent.data[key]] = true;
					parent = parent.parent;
				}
				if (node.isLeaf || this.checkStrictly) {
					node.setChecked(true, false);
				} else {
					node.setChecked(true, true);

					if (leafOnly) {
						node.setChecked(false, false);
						const traverse = function (node) {
							const childNodes = node.childNodes;
							childNodes.forEach((child) => {
								if (!child.isLeaf) {
									child.setChecked(false, false);
								}
								traverse(child);
							});
						};
						traverse(node);
					}
				}
			}
		}
	}

	setCheckedNodes(array, leafOnly = false) {
		const key = this.key;
		const checkedKeys = {};
		array.forEach((item) => {
			checkedKeys[(item || {})[key]] = true;
		});

		this._setCheckedKeys(key, leafOnly, checkedKeys);
	}

	setExpandedKeys(keys) {
		keys = keys || [];
		this.expandedKeys = keys;

		keys.forEach((key) => {
			const node = this.getNode(key);
			if (node) node.expand(null, this.autoExpandParent);
		});
	}

	setChecked(data, checked, deep) {
		const node = this.getNode(data);

		if (node) {
			node.setChecked(!!checked, deep);
		}
	}

	getCurrentNode() {
		return this.currentNode;
	}

	setCurrentNode(currentNode) {
		const prevCurrentNode = this.currentNode;
		if (prevCurrentNode) {
			prevCurrentNode.isCurrent = false;
		}
		this.currentNode = currentNode;
		this.currentNode.isCurrent = true;
	}

	setUserCurrentNode(node) {
		const key = node[this.key];
		const currNode = this.nodesMap[key];
		this.setCurrentNode(currNode);
	}

	setCurrentNodeKey(key) {
		if (key === null || key === undefined) {
			this.currentNode.isCurrent = false;
			this.currentNode = null;
			return;
		}
		const node = this.getNode(key);
		if (node) {
			this.setCurrentNode(node);
		}
	}
}
