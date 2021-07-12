<template>
	<h1>Memory Test in non-trace mode（close vue-devtools）</h1>
	<button 
		@click="useComponent = !useComponent"
	>
		useComponent: {{ useComponent }}
	</button>
	<h3>
		Current Status：{{ runTip }}
	</h3>
	 
	<button @click="start">
		Start
	</button>  
	<br>
	<br>
	<button @click="stop">
		Stop
	</button> 
	<div ref="root" />
</template>

<script>
import { h, ref, createApp, onUnmounted, nextTick, defineComponent } from "vue";

/* eslint-disable-next-line vue/one-component-per-file */
const WrapperComponent = defineComponent({
	name: 'vc-wrapper',
	props: {
		rootTag: String
	},
	emits: ['click'],
	setup(props, { slots }) {
		return () => h(
			props.rootTag,
			Array
				.from({ length: 10000 })
				.map(
					() => h(
						'p', 
						{ onClick: console.log }, 
						slots
					)
				)
		);
	} 
});

const WrapperFunction = (props, { slots }) => h(
	props.rootTag,
	Array
		.from({ length: 10000 })
		.map(
			() => h(
				'p', 
				{ onClick: console.log }, 
				slots
			)
		)
);
/* eslint-disable-next-line vue/one-component-per-file */
export default {
	name: 'vc-portal-memory-basic',
	setup() {
		let timer;
		const runTip = ref('Not Started');
		const root = ref(null);
		const useComponent = ref(true);
		
		const start = () => {
			clearInterval(timer);
			timer = setInterval(() => {
				runTip.value = 'Running';
				
				const container = document.createElement('div');
				const app = createApp(
					() => h(
						useComponent.value ? WrapperComponent : WrapperFunction, 
						{ 
							rootTag: 'h4',
							onClick: console.log 
						}, 
						{
							default: (props) => `useComponent: ${useComponent.value} - ${Math.random()}`
						}
					)
				);
				// mount
				app.mount(container);

				// 使用children的目的是不需要用container多包裹一层
				Array
					.from(container.children)
					.forEach(i => root.value.appendChild(i));
				
				// unmount
				setTimeout(app.unmount, 0);
				
				/**
				 * 不需要设置 `container = null`
				 * 不需要 removeChild，但container.children多个子节点时，unmount是无法卸载的;
				 */
			}, 50);
		};

		const stop = () => {
			clearInterval(timer);
			runTip.value = 'Stop';
		};

		onUnmounted(stop);
		return {
			useComponent,
			runTip,
			root,
			start,
			stop
		};
	}
};
</script>