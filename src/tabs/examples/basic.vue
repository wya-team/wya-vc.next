<template>
	<div style="background: #f7f6f6">
		<vc-button @click="animated = !animated">
			animated: {{ animated }}
		</vc-button>
		<vc-button @click="type = type === 'line' ? 'card' : 'line'">
			type: {{ type }}
		</vc-button>
		<br>
		<br>
		<vc-tabs 
			v-model="value"
			:animated="animated" 
			:type="type"
			closable 
			@click="handleClick"
			@tab-remove="handleRemove"
		>
			<template #extra>
				<div>extra</div>
			</template>
			<vc-tabs-pane :label="renderLabel">
				<div v-for="item in list" :key="item">
					<div>标签一的内容</div>
					<div>标签一的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签二">
				<div v-for="item in list" :key="item">
					<div>标签二的内容</div>
					<div>标签二的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签三">
				<div v-for="item in list" :key="item">
					<div>标签三的内容</div>
					<div>标签三的内容</div>
					<div>标签三的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签四">
				<div v-for="item in list" :key="item">
					<div>标签四的内容</div>
					<div>标签四的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签五">
				<div v-for="item in list" :key="item">
					<div>标签五的内容</div>
					<div>标签五的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签六">
				<div v-for="item in list" :key="item">
					<div>标签六的内容</div>
					<div>标签六的内容</div>
					<div>标签六的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签七">
				<div v-for="item in list" :key="item">
					<div>标签七的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签八">
				<div v-for="item in list" :key="item">
					<div>标签八的内容</div>
					<div>标签八的内容</div>
				</div>
			</vc-tabs-pane>
			<vc-tabs-pane label="标签九">
				<div v-for="item in list" :key="item">
					<div>标签九的内容</div>
					<div>标签九的内容</div>
					<div>标签九的内容</div>
				</div>
			</vc-tabs-pane>
		</vc-tabs>
	</div>
</template>
<script lang="jsx">
import { defineComponent, ref } from 'vue';
import Tabs from '..';
import Button from '../../button';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-tabs': Tabs,
		'vc-tabs-pane': Tabs.Pane,
		'vc-button': Button
	},
	setup(props) {
		const value = ref(2);
		const animated = ref(false);
		const type = ref('line');
		const list = ref(Array.from({ length: 200 }, (_, i) => i));

		return {
			value,
			animated,
			type,
			list,
			handleClick() {
				console.log('click');
			},
			handleRemove() {
				console.log('remove');
			},
			renderLabel({ it, index }) {
				return (
					<span>{ it.name } { index }</span>
				);
			}
		};
	}
});
</script>
