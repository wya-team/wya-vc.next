<!-- 仅展示最基本的用法 -->
<template>
	<div class="demo">
		<vc-recycle-list 
			class="list" 
			:page-size="pageSize" 
			:load-data="loadData"
		>
			<template #default="{ row }">
				<div 
					:id="row.id" 
					class="item" 
					:style="{
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
		let count = 0;
		let dynamicSize = ref(0);
		let pageSize = ref(20);

		return {
			pageSize,
			dynamicSize,
			loadData(page, pageSize$) {
				let list = [];
				return new Promise((resolve) => {
					if (page == 10) {
						resolve(false);
						return;
					}
					setTimeout(() => {
						for (let i = 0; i < 50; i++) {
							list.push({
								id: count++,
								page,
								height: ((i % 10) + 1) * 20
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
	padding: 10px 0;
	width: 100%;
	text-align: left;
}
</style>