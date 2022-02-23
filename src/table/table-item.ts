import { defineComponent, h, Fragment } from 'vue';

/**
 * 写法不同，但与vue@2.x 保持一致
 * 对于v3可用可不用
 */
export default defineComponent({
	setup(props, { slots }) {
		return () => h(Fragment, slots?.default?.());
	}
});