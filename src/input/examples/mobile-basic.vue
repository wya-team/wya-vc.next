<template>
	<div style="background: #f2f2f2">
		<div>
			<vcm-input
				v-model="value"
				style="width: 200px"
				clearable
				enter-text="搜索"
				placeholder="显示placeholder"
				@change="handleChange"
				@focus="handleFocus"
				@blur="handleBlur"
				@enter="handleEnter"
			/>
			<div>
				<vcm-input 
					v-model="value"
					clearable
					placeholder="显示placeholder"
					@change="handleChange"
					@focus="handleFocus"
					@blur="handleBlur"
					@enter="handleEnter"
				>
					<template #append>
						<p>
							ico2222n
						</p>
					</template>
				</vcm-input>
			</div>
			<br>
			<br>
			<vcm-input-number :model-value="value2" :max="10" @input="handleInput" />
			<br>
			<br>
			<vcm-form>
				<vcm-form-item>
					<vcm-input-number 
						v-model="value3"
						:max="100"
						@tip="handleTip"
						@after="handleChangeAfter"
					/>
				</vcm-form-item>
				<vcm-form-item>
					<vcm-input-number v-model="value3" :step="false" />
				</vcm-form-item>
			</vcm-form>
			<br>
			<br>
			<vcm-input-search 
				v-model="value1"
				placeholder="搜索" 
				clearable
				@cancel="handleCancel"
			/>

			<vcm-input-number v-model="value2" :max="10" disabled />
		</div>
	</div>
</template>
<script>
import MInput from '../index.m';
import MForm from '../../form/index.m';

export default {
	name: "vcm-tpl-basic",
	components: {
		'vcm-input': MInput,
		'vcm-input-number': MInput.Number,
		'vcm-input-search': MInput.Search,
		'vcm-form': MForm,
		'vcm-form-item': MForm.Item,
	},
	data() {
		return {
			value: '',
			value1: '',
			value2: 0,
			value3: 10,
			textvalue: ''
		};
	},
	computed: {
		
	},
	created() {
		setTimeout(() => {
			this.value3 = 0;
		}, 3000);
	},
	methods: {
		handleInput(e) {
			this.value2 = e;
			console.log(e);
		},
		handleChange() {
			console.log(this.value);
		},
		handleFocus() {
			console.log('聚焦的回调');
		},
		handleBlur() {
			console.log('失焦的回调');
		},
		handleEnter() {
			console.log('回车键的回调');
		},
		handleTip({ value }) {
			console.log(value, '超出的提示');
		},
		handleCancel() {
			alert('cancel');
		},
		handleChangeAfter(value) {
			return new Promise((resolve, rejcet) => {
				setTimeout(() => {
					resolve();
				}, 1000);
			}).then((res) => {
				return false;
			});
		}
	}
};
</script>
