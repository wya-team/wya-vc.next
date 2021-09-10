import { defineComponent, Fragment, h, Teleport } from 'vue';
import type { DefineComponent } from 'vue';
/**
 * 写法不同，但与vue@2.x 保持一致
 */
const PortalView: DefineComponent = defineComponent({
	setup(_props, { slots }) {
		return () => {
			/**
			 * 考虑占位的情况下需要渲染default
			 */
			return h(
				Fragment,
				[
					h('div', { class: 'vc-portal-view' }, slots?.default?.()),
					h(Teleport as any, { to: 'body' }, slots?.content?.())
				]
			);
		};
	}
});

export default PortalView;