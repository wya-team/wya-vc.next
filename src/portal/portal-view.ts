import { defineComponent, Fragment, h, Teleport } from 'vue';
import Portal from './portal';

/**
 * 写法不同，但与vue@2.x 保持一致
 */
export default defineComponent({
	setup(props, { slots }) {
		return () => {
			/**
			 * 考虑占位的情况下需要渲染default
			 */
			return h(
				Fragment,
				[
					h('div', { class: 'vc-portal-view' }, slots?.default?.()),
					h(Teleport, { to: 'body' }, slots?.content?.())
				]
			);
		};
	}
});