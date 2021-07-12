<template>
	<div class="v-artboard">
		<vc-artboard 
			ref="artboard" 
			:options="{ strokeStyle: 'red', shadowColor: 'red' }"
			:width="300"
			:height="200"
			@change="handleChange" 
		/>	
		<div style="margin-top: 20px;">
			<vc-button @click="handleReset">
				重置画布
			</vc-button>
			<vc-button @click="handleGetImg">
				生成图片
			</vc-button>
			<vc-button @click="handleUndo">
				回退一步
			</vc-button>
			<vc-button @click="handleRedo">
				取消回退
			</vc-button>
		</div>
		<img :src="src" alt="">
	</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import Message from '../../message';
import Button from '../../button';
import Artboard from '../artboard';

export default defineComponent({
	name: 'v-artboard',
	components: {
		'vc-artboard': Artboard,
		'vc-button': Button,
	},
	setup(props) {
		const src = ref('');
		const artboard = ref(null);

		let undo = false;
		let redo = false;
		return {
			src,
			artboard,
			handleUndo() {
				if (!undo) {
					Message.warning("已经没有回退的步骤了");
					return;
				}
				artboard.value.undo();
			},
			handleRedo() {
				if (!redo) {
					Message.warning("已经没有撤销的步骤了");
					return;
				}
				artboard.value.redo();
			},
			handleReset() {
				console.log(artboard);
				artboard.value.reset();
			},
			handleGetImg() {
				src.value = artboard.value.canvas.toDataURL({ 
					type: props.type, 
					encoderOptions: props.encoderOptions 
				});
			},
			handleChange({ snapshots, current }) {
				console.log('snapshots :', snapshots);
				console.log('current :', current);
				if (current === 0) {
					undo = false;
				} else if (current === snapshots.length) {
					undo = true;
					redo = false;
				} else {
					undo = true;
					redo = true;
				}
			}

		};
	}
});
</script>

<style lang="scss">
.v-artboard {
	canvas {
		width: 100%;
		height: 100%;
	}
	img {
		width: 200px;
		height: 200px;
	}
}
</style>
