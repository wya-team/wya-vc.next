// 第三方不存在d.ts时，用于忽略
declare module '@wya/utils'
declare module '@wya/http'
declare module 'normalize-wheel'

/**
 * import的时候要带上.vue
 * `| {}` 解决 `is not module`的问题（https://github.com/vuejs/vetur/issues/1187#issuecomment-671002994）
 *
 * 其他问题：.vue暴露出去的类型都一致了，不会含有props等类型预设（TODO）
 */
declare module '*.vue' {
	import { App, defineComponent } from 'vue';

	const component: Options<typeof defineComponent> & { install(app: App): void };

	export default component;
	export const Func: any;
}

