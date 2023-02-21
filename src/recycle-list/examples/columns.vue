<!-- 仅展示最基本的用法 -->
<template>
	<div class="demo" style="padding: 0 10px">
		<vc-recycle-list 
			class="list" 
			:cols="3"
			:gutter="10"
			:page-size="pageSize" 
			:load-data="loadData"
		>
			<template #default="{ row }">
				<div 
					:key="row.id" 
					class="item" 
					:style="{
						background: row.background,
						height: `${row.height + (dynamicSize || 0) }px`
					}"
					@click="handleClick(row)"
				>
					id: {{ row.id }}
					page: {{ row.page }}
					height: {{ row.height + (dynamicSize || 0) }}
				</div>
			</template>
		</vc-recycle-list>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import RecycleList from '..';


export default defineComponent({
	name: "vc-divider-basic",
	components: {
		'vc-recycle-list': RecycleList,
	},
	setup() {
		const dynamicSize = ref(0);
		const pageSize = ref(30);

		let count = 0;
		let total = 2;

		const rendomColor = () => Math.floor(Math.random() * 255);
		const RGBA_MAP = Array
			.from({ length: pageSize.value * total + 1 })
			.reduce((colors, _, index) => {
				colors[index] = `rgba(${rendomColor()}, ${rendomColor()}, ${rendomColor()}, ${Math.random()})`;
				return colors;
			}, {});
		return {
			pageSize,
			dynamicSize,
			loadData(page, pageSize$) {
				let list = [];
				return new Promise((resolve) => {
					if (page == total + 1) {
						resolve(false);
						return;
					}

					if (page == total) {
						pageSize$ = 4;
					}
					setTimeout(() => {
						for (let i = 0; i < pageSize$; i++) {
							list.push({
								id: count++,
								page,
								height: ((i % 10) + 1) * Math.floor(Math.random() * 20 + 20),
								background: RGBA_MAP[count]
							});
						}
						resolve(list);
					}, 1000);
				});
			},
			handleClick(data) {
				console.log(data);
				dynamicSize.value = Math.floor(Math.random() * 20);
			}
		};
	}
});
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
	height: 100%;
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