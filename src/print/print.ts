import { h, defineComponent, getCurrentInstance } from 'vue';

export default {
	name: "vc-print",
	props: {
		value: String,
		tag: {
			type: [String, Object, Function],
			default: 'div'
		}
	},
	setup(props, context) {
		const instance = getCurrentInstance();
		// 执行
		const print = () => {
			// filter
			const $ = [...document.body.children].filter(
				item => item.nodeName === 'DIV' && item.style.display !== 'none'
			);
			// hide it
			$.forEach(item => item.style.display = 'none');

			// regiser print
			let div = document.createElement('div');
			div.appendChild(instance.vnode.el.cloneNode(true));

			document.body.appendChild(div);
			window.print();

			// remove print
			$.forEach(item => item.style.removeProperty('display'));
			document.body.removeChild(div);
		};

		return { print };
	},
	render() {
		return h(
			this.tag, 
			this.value ? { innerHTML: this.value } : {},
			this.$slots?.default?.()
		);
	}
};
