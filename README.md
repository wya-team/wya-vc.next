> 基于`Vue@2.x`的组件库移步[\@wya/vc](https://github.com/wya-team/wya-vc)

# TODO

- 文档建设
- 测试用例覆盖(目前测试用例来自Vue2.x未做修改)
- 适配TS，编译
- 主题建设


## 注意
> `getCurrentInstance()` 以下统一叫`instance`

- `defineComponent` 有助于IDE检查TS（包括Mixin也需要）
- `instance.ctx.$xxx`: Vue2类似相关`this.$xxx`, 如可以使用`ctx.$forceUpdate()`
- `instance.ctx.$el` 与 `instance.vnode.el`相同
- `instance.parent`可以寻找到父层
- `@click`事件作为函数使用的两种方式
	- `instance.vnode.props`: 其中含事件如`onClick`, 可以将事件转化为函数使用
	- `inheritAttrs: false`: `onClick`可以在`attrs`中获取当函数使用
		- `css` 和 `style` 在vue3中需要自行绑定，不存在响应式
		- 其他值和样式转为响应式：使用`hooks/use-attrs`

## 约定

### 语法检查
- ESLint检查无报错
- TS类型检查无报错

### 类型使用

- `import type { Ref } from 'vue'`
- `import type { xxx } from './types'`

### `provide`

```
provide('[组件名]', {
	// 当前组件的props,
	props, 

	// 其他需要传递的字段
	[key: string]: any
})
```

### `hooks` 钩子相关

> 这里指单独未PC和Mobile组件提取hooks时，非公共hooks

- 使用`instance`获取`props`和其他值(这个时候需要自行编写Props类型)

### 组件字段名统一

- TODO
