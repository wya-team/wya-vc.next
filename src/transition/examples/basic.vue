<template>
	<div style="padding: 100px">
		<h3 v-if="!isGroup" @click="handleClick">
			点击触发: {{ isVisible }}
		</h3>
		<template v-else-if="isGroup">
			<h3 @click="handleAdd">
				添加: {{ colors.length }}
			</h3>
			<h3 @click="handleDel">
				删除: {{ colors.length }}
			</h3>
		</template>
		

		<h3 @click="handleGroup">
			切换为组合: {{ isGroup }}
		</h3>
		<div style="display: flex; align-items: center">
			<select v-model="transitionName">
				<option 
					v-for="item in transitionOptions" 
					:key="item" 
					v-text="item" 
				/>
			</select>
			<select v-if="transitionName === 'slide'" v-model="slideModeName">
				<option 
					v-for="item in slideModeOptions" 
					:key="item" 
					v-text="item" 
				/>
			</select>
			<select v-if="transitionName === 'scale'" v-model="scaleModeName">
				<option 
					v-for="item in scaleModeOptions" 
					:key="item" 
					v-text="item" 
				/>
			</select>
			<select v-if="transitionName === 'zoom'" v-model="zoomModeName">
				<option 
					v-for="item in zoomModeOptions" 
					:key="item" 
					v-text="item" 
				/>
			</select>
		</div>
		<div v-if="!isGroup">
			<component 
				:is="`vc-transition-${transitionName}`" 
				:mode="mode"
				:appear="true"
				@before-enter="handleEnter"
			>
				<div v-show="isVisible" style="background: #f5f6f7">
					<p>test</p>
					<p>test</p>
					<p>test</p>
					<p>test</p>
					<p>test</p>
					<p>test</p>
					<p>test</p>
					<p>test</p>
					<p>test</p>
				</div>
			</component>
		</div>
		<div v-else>
			<component 
				:is="`vc-transition-${transitionName}`" 
				:mode="mode"
				group 
				tag="div"
				style="display: flex; flex-wrap: wrap"
				@before-enter="handleEnter"
			>
				<div 
					v-for="(item, index) in colors" 
					:key="item.id" 
					:style="{ background: `#ff33${item.id}${item.id}` }"
					style="width: 48px; line-height: 4; color: #e6e6e6; margin: 10px"
				>
					{{ index }}: {{ item.id }}
				</div>
			</component>
		</div>
	</div>
</template>
<script>
import { defineComponent, computed, ref } from 'vue';
import Transition from '..';

let count = 0;
export default defineComponent({
	name: "vc-transtion-basic",
	components: {
		'vc-transition-fade': Transition.Fade,
		'vc-transition-scale': Transition.Scale,
		'vc-transition-slide': Transition.Slide,
		'vc-transition-zoom': Transition.Zoom,
		'vc-transition-collapse': Transition.Collapse
	},
	setup() {
		const isVisible = ref(true);
		const isGroup = ref(false);
		const transitionName = ref('collapse');
		const transitionOptions = ref([
			'fade',
			'scale',
			'slide',
			'zoom',
			'collapse'
		]);
		const slideModeName = ref('left-part');
		const slideModeOptions = ref(['left-part', 'right-part', 'down-part', 'up-part', 'left', 'right', 'down', 'up']);
		const zoomModeName = ref('x');
		const zoomModeOptions = ref(['x', 'y', 'center']);

		const scaleModeName = ref('both');
		const scaleModeOptions = ref(['both', 'part']);

		const colors = ref(Array.from({ length: 5 }, () => ({ id: count++ })));

		const mode = computed(() => {
			switch (transitionName.value) {
				case 'scale':
					return scaleModeName.value;
				case 'slide':
					return slideModeName.value;
				case 'zoom':
					return zoomModeName.value;
				default:
					return '';
			}
		});

		return {
			mode,
			isVisible,
			isGroup,
			transitionName,
			transitionOptions,
			slideModeName,
			slideModeOptions,
			zoomModeName,
			zoomModeOptions,

			scaleModeName,
			scaleModeOptions,

			colors,
			handleEnter(el) {
				console.log('enter');
			},
			handleClick() {
				isVisible.value = !isVisible.value;
			},
			handleGroup() {
				isGroup.value = !isGroup.value;
			},
			handleAdd() {
				colors.value.push({ id: count++ });
			},
			handleDel() {
				colors.value.splice(Math.floor(Math.random() * colors.value.length), 1);
			}
		};
	}
});
</script>
