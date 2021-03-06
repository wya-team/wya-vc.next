## 更新`3.x`注意事项
- 变更方法: `onSure -> onFulfilled`
- 变更方法: `onClose -> onRejected`
- 变更事件: `sure -> portal-fulfilled`
- 变更事件: `close -> portal-rejected`
- 变更属性 `data -> dataSource`,
- 变更属性 `$slots -> slots`,
- 变更属性 `$parent -> parent`,
- 变更默认值: `aliveKey`, 'visible' -> 'isVisible'`
- 变更暴露属性 `vm -> app`, `app.wrapper`同`2.x`
- 变更取值`onBefore: () => response.data -> response`
- 变更属性: `parent -> uses(TODO)`
- 新增属性: `fragment: false`

## 传送门（Portal）
渲染到组件内改变其他地方的DOM结构。

### 何时使用
组件在表示层和其他组件没有任何差异，但是在渲染的时候需要出现在其他地方时使用。
- 比如`Modal`、`Message`组件

### 基础用法

:::RUNTIME
```html
<template>
	<vc-modal
		v-model="isVisible"
		title="Common Modal dialog box title"
		@ok="handleOk"
		@cancel="handleCancel"
	>
		<p>Content of dialog</p>
		<p>Content of dialog</p>
		<p>Content of dialog</p>
	</vc-modal>
</template>
<script>
import { Modal, Portal } from '@wya/vc';

const wrapper = {
	name: "vc-tpl-basic",
	components: {
		'vc-modal': Modal
	},
	data() {
		return {
			isVisible: false
		};
	},
	mounted() {
		this.isVisible = true;
	},
	methods: {
		handleOk() {
			this.$emit('portal-fulfilled');
		},
		handleCancel() {
			this.$emit('portal-rejected');
		}
	}
};
export default wrapper;

export const PModalWithBefore = new Portal(wrapper, {
	onBefore() {
		return new Promise((resolve, reject) => {
			setTimeout(resolve, 1000);
		});
	}
});

export const PModal = new Portal(wrapper, {});
</script>
```
:::

### 调用

:::RUNTIME
```html
<template>
	<div>
		<div @click="handleClickWithBefore">
			点我(带延迟)
		</div>
		<div @click="handleClick">
			点我(不带延迟)
		</div>
	</div>
</template>
<script>
import { PModal, PModalWithBefore } from './examples/basic/modal.vue';

export default {
	name: "vc-tpl-basic",
	methods: {
		handleClickWithBefore() {
			PModalWithBefore.popup({

			}).then((res) => {
				console.log(res);
			}).catch((res) => {
				console.log(res);
			});
		},
		handleClick() {
			PModal.popup({

			}).then((res) => {
				console.log(res);
			}).catch((res) => {
				console.log(res);
			});
		}
	}
};
</script>
```
:::

### 组件 - `Portal.View`

:::RUNTIME
```html
<template>
	<vc-portal-view>
		<div>placeholder</div>
	</vc-portal-view>
</template>
<script>
import { Portal } from '@wya/vc';

export default {
	name: "vc-tpl-basic",
	components: {
		'vc-portal-view': Portal.View
	},
};
</script>
```
:::

## API

### new Portal参数
属性 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
wrapper | 要传送的组件 | `Object` | - | -
registerOptions | 配置项 | `Object` | - | -

#### registerOptions参数
属性 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
tag | 外层标签 | `String` | - | `div` 
el | 组件插入的目标元素 | `String` | - | `body` 
cName | 组件`name`：用于标识卸载 | `String` | - | 传入的`wapper`组件`name`
alive | 是否缓存组件不消毁 | `Boolean` | - | `false`
aliveRegExp | 实例以外且该数组内的, 不销毁 | `Object` | - | `{ className: /(vc-hack-alive|vc-hack-cp)/ }`
multiple | 多个实例共存 | `Boolean` | - | `false`
promise | 使用`promise`形式调用 | `Boolean` | - | `false`
onBefore | 初始化组件前操作，可以是ajax | - | `Function` | -
aliveKey | 控制组件显示隐藏字段 | `String` | - | `isVisible` 
leaveDelay | 延迟关闭，单位`s` | `Number` | - | 0.3
autoDestroy | 自动销毁 | `Boolean` | - | `true`
getInstance | 获取组件实例 | `Function` | - | -
parent | 依赖注入使用 like store, router, Life cycle，methods, mixins, .... | `Object` | - | -
components | 动态注入组件 | `Object` | - | -
data | props数据 | `Object` | - | -

### [Viewer].popup参数
属性 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
options | 配置参数，同上`registerOptions` | `Object` | - | 默认字段同`registerOptions`参数

## TODO
- 支持`SSR`，可以借 `<RootPortals />`; 通知插入以及删除组件
- HRM
