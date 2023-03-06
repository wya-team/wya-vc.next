<!-- 选项卡（disabled应用） -->
<template>
	<Tabs 
		:model-value="type" 
		:animated="false"
		class="demo"
		@click="handleChange"
	>
		<Tabs.Pane 
			v-for="(item) in tabs"
			:key="item.value"
			:label="item.label" 
			:name="item.value"
		>
			<RecycleList
				class="list" 
				:disabled="type != item.value"
				:page-size="pageSize"
				:load-data="loadData"
			>
				<template #default="{ row }">
					<div 
						:id="row.id" 
						class="item" 
						:style="{
							height: `${row.height + (dynamicSize || 0) }px`,
							background: row.background
						}"
						@click="handleClick(row)"
					>
						id: {{ row.id }}
						page: {{ row.page }}
						type: {{ row.type }}
						height: {{ row.height + (dynamicSize || 0) }}
					</div>
				</template>
			</RecycleList>
		</Tabs.Pane>
	</Tabs>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue';
import Tabs from '../../tabs/index.m';
import RecycleList from '..';

const dynamicSize = ref(0);
const type = ref('1');

const pageSize = ref(20);

const tabs = ref([
	{ label: 'A', value: '1' }, 
	{ label: 'B', value: '2' }
]);

const handleChange = async (v) => {
	type.value = v;
};

let count = 0;
let total = 10;

const rendomColor = () => Math.floor(Math.random() * 255);
const RGBA_MAP = Array
	.from({ length: (pageSize.value * total + 1) * 2 })
	.reduce((colors, _, index) => {
		colors[index] = `rgba(${rendomColor()}, ${rendomColor()}, ${rendomColor()}, ${Math.random()})`;
		return colors;
	}, {});

const loadData = (page, pageSize$) => {
	let list = [];
	return new Promise((resolve) => {
		if (page == total + 1) {
			resolve(false);
			return;
		}

		if (page == total) {
			pageSize$ = 4;
		}
		for (let i = 0; i < pageSize$; i++) {
			list.push({
				id: count++,
				page,
				type: type.value,
				height: ((i % 10) + 1) * 20,
				background: RGBA_MAP[count]
			});
		}
		setTimeout(() => resolve(list), 1000);
	});
};

const handleClick = (data) => {
	console.log(data);
	dynamicSize.value = Math.floor(Math.random() * 20);
};
</script>

<style>
.demo {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	width: 100%;
}
.list {
	height: calc(100vh - 45px);
	margin: 0 auto;
	padding: 0;
	border: 1px solid #ddd;
	list-style-type: none;
	text-align: center;
	background: #eee;
}
.item {
	display: flex;
	line-height: 20px;
	width: 100%;
	text-align: left;
}
</style>