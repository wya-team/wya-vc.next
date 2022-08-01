<template>
	<div>
		<h1>点击图标复制</h1>
		<h1 @click="handleShuffle">
			乱序测试: <vc-icon :type="items[0]" />
		</h1>
		<h2 @click="handleClick">
			点我切换 prefix: {{ mobile ? 'vcm-' : 'vc-' }}
		</h2>
		<div class="vc-icon-basic">
			<!-- index 仅用于乱序测试 -->
			<div 
				v-for="(item, index) in items" 
				:key="index" 
				:value="`<vc${m}-icon type=&quot;${item}&quot; />`"
			>
				<vc-icon 
					:type="item" 
					inherit 
					@click="(e) => handleIconClick(item, e)" 
				/>
				<p>{{ item }}</p>
			</div>
		</div>
	</div>
</template>
<script>
import { defineComponent, onMounted, reactive, ref, computed, watch } from 'vue';
import { shuffle } from 'lodash';
import { Storage } from '@wya/utils';
import Icon from '..';
// import Clipboard from '../../clipboard';
import IconManager from '../manager';

window.IconManager = IconManager;

export default defineComponent({
	name: "vc-icon-basic",
	components: {
		'vc-icon': Icon,
		// 'vc-clipboard': Clipboard
	},

	setup(props, context) {
		const items = ref([]);
		const mobile = ref(!!(Storage.get('@wya/vc/demo/icon') || {}).status);
		const m = computed(() => (mobile.value ? 'm' : ''));

		onMounted(async () => {
			await new Promise(_ => setTimeout(_, 0));
			await Promise.all([
				IconManager.basicStatus,
				IconManager.load('//at.alicdn.com/t/font_1169912_ith92i2hims.js'),
				IconManager.load('//at.alicdn.com/t/font_1096960_8zo6tsnmj3p.js'),
				IconManager.load('//at.alicdn.com/t/font_1096957_cypkws8poed.js')
			]);

			items.value = Object.keys(IconManager.icons);
		});

		const handleClick = () => {
			mobile.value = !mobile.value;
			Storage.set('@wya/vc/demo/icon', { status: mobile });
		};

		const handleShuffle = () => {
			items.value = shuffle(items.value);
		};

		const handleIconClick = (item, e) => {
			console.log(item, e);
		};

		return {
			m,
			mobile,
			items,
			handleClick,
			handleShuffle,
			handleIconClick
		};
	}
});
</script>
<style lang="scss">
.vc-icon-basic {
	display: flex;
	flex-wrap: wrap;
	div {
		width: 200px;
		padding: 20px;
		text-align: center;
		cursor: pointer;
	}
	i {
		font-size: 30px
	}
	svg {
		width: 1em;
		height: 1em;
		fill: currentColor;
		overflow: hidden;
	}
}
</style>
