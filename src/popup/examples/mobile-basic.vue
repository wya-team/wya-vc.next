<template>
	<div>
		<vcm-popup 
			v-for="(item, index) in placements" 
			:key="`popup__${item}`" 
			v-model="visibles[index]"
			:placement="item"
		>
			<vcm-form>
				<vcm-form-item>
					<vcm-input v-model="value" type="text" clearable />
				</vcm-form-item>
				<vcm-form-item>
					<vcm-input v-model="value" type="text" clearable />
				</vcm-form-item>
				<vcm-form-item>
					<vcm-input v-model="value" type="text" clearable />
				</vcm-form-item>
				<vcm-form-item>
					<vcm-input v-model="value" type="text" clearable />
				</vcm-form-item>
			</vcm-form>
			{{ item }}
		</vcm-popup>
		
		<vcm-button 
			v-for="(item, index) in placements" 
			:key="`button__${item}`"
			:placement="item"
			@click="handleNormal(item, index)"
		>
			normal: {{ item }} {{ visibles[index] }}
		</vcm-button>
		
		<vcm-button 	
			v-for="(item, index) in placements" 
			:key="`portal__${item}`"
			:placement="item"
			@click="handlePortal(item, index)"
		>
			portal: {{ item }}
		</vcm-button>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<br>
		<div>2222</div>
	</div>
</template>
<script>
import { defineComponent, ref, onMounted } from 'vue'; 
import { Device } from '@wya/utils';
import { Tip } from './tip/tip';
import MPopup from '../index.m';
import MButton from '../../button/index.m';
import MInput from '../../input/index.m';
import MForm from '../../form/index.m';

export default defineComponent({
	name: "vcm-popup-basic",
	components: {
		'vcm-popup': MPopup,
		'vcm-button': MButton,
		'vcm-input': MInput,
		'vcm-form': MForm,
		'vcm-form-item': MForm.Item,
	},
	setup(props, context) {
		const value = ref('');
		const placements = ref(['top', 'bottom', 'center', 'left', 'right']);
		const visibles = ref([false, false, false, false, false]);

		onMounted(() => {
			// hack for wechat, 测试碳层下输入框
			if (!Device.ios 
				|| !Device.wechat 
				|| !Device.wechatVersion >= '6.7.4'
			) return;

			let handleFn = (e) => {
				document.body.scrollTop = document.body.scrollTop + 0; // eslint-disable-line
				e.target.removeEventListener('blur', handleFn);
			};

			document.addEventListener('click', (e) => {
				let tag = e.target.nodeName.toLowerCase();
				if (!/^(input|textarea)$/.test(tag)) return;
				e.target.addEventListener('blur', handleFn);
			}, true);
		});

		return {
			value,
			placements,
			visibles,
			handleNormal(placement, index) {
				visibles.value.splice(index, 0, !visibles.value[index]);
			},
			async handlePortal(placement, index) {
				await Tip.popup({
					param: {
						placement
					}
				});
				console.log('success');
			},
		};
	}
});

</script>
