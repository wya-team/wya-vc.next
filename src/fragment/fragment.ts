import { defineComponent, h, Fragment } from 'vue';

/**
 * 原生支持Fragment, 这里仅作为语义化 
 * 写法不同，但与vue@2.x 保持一致
 */
export default defineComponent({
	setup(props, { slots }) {
		return () => h(Fragment, slots?.default?.());
	}
});