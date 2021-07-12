<!-- 开发使用的版本，如各种操作改变属性值 -->
<template>
	<div style="padding: 20px; display: flex; flex-direction: column-reverse;">
		<div @click="handleClick">
			唤起ActionSheet
		</div>
	</div>
</template>
<script>
import { defineComponent } from 'vue';
import MActionSheet from '..';

export default defineComponent({
	name: "vc-tpl-basic",
	setup(props, context) {
		const handleClick = async () => {

			const onClick = (action) => {
				return new Promise(r => setTimeout(r, 2000));
			};

			try {
				const res = await MActionSheet.popup({
					title: '我是标题',
					description: '我是描述我是描述我是描述我是描述',
					cancelText: '取消',
					actions: [
						{
							name: '选项一',
							subName: '我是第二级标题',
							onClick
						},
						{
							name: '选项二',
							disabled: true,
							onClick
						},
						{ 
							name: 'DELETE', 
							className: 'test',
							style: `color: #ff0000`, 
							onClick 
						}
					]
				});
				console.log('sure', res);
			} catch {
				console.log('close');
			}
		};
		return {
			handleClick
		};
	}
});
</script>
