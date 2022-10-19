<template>
	<div class="demo">
		<vc-recycle-list 
			class="list" 
			:page-size="pageSize" 
			:load-data="loadData"
		>
			<template #placeholder>
				<div class="loading">
					<h4 />
				</div>
			</template>
			<template #default="{ row }">
				<div 
					:id="row.id" 
					:style="{
						height: `${row.height + (dynamicSize || 0) }px`
					}"
					class="item" 
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
	name: "vc-tpl-basic",
	components: {
		'vc-recycle-list': RecycleList
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
					}, Math.floor(Math.random() * 10000));
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
}
.item {
	display: flex;
	width: 100%;
	text-align: left;
	padding: 0 20px;
	/*background: rgba(0, 0, 0, .1);*/
}

.loading {
	padding: 20px;
}
.loading h4 {
	background-color: #ededed;
	background: linear-gradient(
		100deg,
		rgba(255, 255, 255, 0) 40%,
		rgba(255, 255, 255, .5) 50%,
		rgba(255, 255, 255, 0) 60%
	) #ededed;
	background-size: 200% 100%;
	background-position-x: 180%;
	animation: 1s loading ease-in-out infinite;
}

@keyframes loading {
	to {
		background-position-x: -20%;
	}
}

.loading h4 {
	min-height: 20px;
	border-radius: 4px;
	animation-delay: .05s;
} 
</style>
