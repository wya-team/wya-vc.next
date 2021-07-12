import { ref, watch, getCurrentInstance, inject } from 'vue';
import { isEqualWith } from 'lodash';

export default () => {
	const instance = getCurrentInstance();
	const formItem = inject('form-item', {});
	const { props, emit } = instance;

	const currentValue = ref([]);
	const dragging = ref(false);
	let eleDrag = null;
	let timer = null;

	watch(
		() => props.modelValue,
		(v) => {
			if (isEqualWith(v, currentValue.value)) {
				return;
			}
			currentValue.value = v;
		},
		{ immediate: true }
	);

	/**
	 * v-model 同步, 外部的数据改变时不会触发
	 */
	const sync = () => {
		emit('change', currentValue.value);
		emit('update:modelValue', currentValue.value);
		formItem.change?.('currentValue.value');
	};

	const getDraggable = (item) => {
		let value = item ? item[props.draggableKey] : undefined;
		return !!(typeof value === 'undefined' || value);
	};

	/**
	 * 获取左移、右移、拖拽、删除后的列表
	 */
	const getSortList = (current) => {
		const { item, index, type } = current; // id:移动对象，i：目标位置，type：类型
		let isObject = typeof item === 'object';
		const arr = currentValue.value.filter(it => {
			if (isObject) {
				return it[props.valueKey] !== item[props.valueKey];
			}
			return it !== item;
		});

		let targetIndex;
		switch (type) {
			case 'left':
				arr.splice(index - 1, 0, currentValue.value[index]);
				break;
			case 'right':
				arr.splice(index + 1, 0, currentValue.value[index]);
				break;
			case 'drag':
				targetIndex = currentValue.value.findIndex(it => it === item); // 这个id元素对应的下标
				arr.splice(index, 0, currentValue.value[targetIndex]);
				break;
			default: // 删除
				break;
		}
		return arr;
	};

	const handleClick = (e, current) => {
		currentValue.value = getSortList(current);
		sync();
	};

	/**
	 * 拖拽开始
	 */
	const handleDragStart = (e, item) => {
		// 定义拖动数据 - 拖到别的输入框展示的内容
		e.dataTransfer.setData('text', item);

		// 拖放效果
		e.dataTransfer.effectAllowed = "move";
		e.target.style.opacity = 0;

		// 嵌套时，作用于目标元素上，避免被覆盖
		eleDrag = e.target;
		eleDrag.item = e.target.item 
			? e.target.item 
			: item;

		dragging.value = true;
	};

	/**
	 * 拖拽元素进入目标元素头上的时候
	 */
	const handleDragEnter = (e, index, _item) => {
		if (!getDraggable(_item)) return;
		e.preventDefault();

		const { item } = eleDrag || {};

		/**
		 * 嵌套：拖动A.a -> B.a（此时item为空）
		 * 自己忽略
		 */
		if (!item || _item === item) {
			return;
		}

		// 嵌套下，父子，托动子元素，会触发父层的drag-enter（包在内部）;
		if (typeof item === 'object' && !item[props.valueKey]) return;
		
		// 频率控制			
		if (timer) return;
		clearTimeout(timer);
		timer = setTimeout(() => {
			timer = null;
		}, 300);

		currentValue.value = getSortList({ item, index, type: 'drag' });
	};

	const handleDragOver = (e, index, _item) => {
		if (!getDraggable(_item)) return;
		e.preventDefault();
	};

	/**
	 * 拖拽结束
	 */
	const handleDragEnd = (e) => {
		e.dataTransfer.clearData("text");

		e.target.style.opacity = 1;
		eleDrag = null;
		dragging.value = false;

		sync();
	};


	return {
		currentValue,
		dragging,
		getDraggable,
		handleDragStart,
		handleDragEnter,
		handleDragOver,
		handleDragEnd,
		handleClick
	};
};