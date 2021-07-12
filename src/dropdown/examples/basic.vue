<template>
	<div style="margin: 40px">
		<vc-dropdown
			v-model="visible"
			:portal="true"
			:trigger="trigger"
			placement="bottom-left"
			@click="handleClick"
			@visible-change="handleChange"
			@close="handleCloseCb"
		>
			<div>菜单(右){{ visible }}</div>
			<template #list>
				<vc-dropdown-menu>
					<vc-dropdown-item name="1">
						驴打滚
					</vc-dropdown-item>
					<vc-dropdown-item name="2">
						炸酱面
					</vc-dropdown-item>
					<vc-dropdown-item name="3">
						豆汁儿
					</vc-dropdown-item>

					<!-- 高级嵌套 -->
					<vc-dropdown 
						:portal="false"
						tag="li" 
						class="vc-dropdown-item" 
						placement="right" 
						style="display: block"
						@click="handleClick"
						@visible-change="handleChange"
					>
						<span @click.stop>冰糖葫芦</span>
						<template #list>
							<vc-dropdown-menu>
								<vc-dropdown-item name="1">
									驴打滚
								</vc-dropdown-item>
								<vc-dropdown-item name="2">
									炸酱面
								</vc-dropdown-item>
								<vc-dropdown-item name="3">
									豆汁儿
								</vc-dropdown-item>
							</vc-dropdown-menu>
						</template>
					</vc-dropdown>

					<!-- 高级嵌套需要v-model -->
					<vc-popover
						v-model="visiblePopover"
						:portal="false"
						trigger="hover" 
						tag="li" 
						class="vc-dropdown-item"
						portal-class-name="is-padding-none"
						placement="right"
					>
						<span @click.stop>北京烤鸭popover</span>
						<template #content>
							<vc-dropdown-item name="1">
								驴打滚
							</vc-dropdown-item>
							<vc-dropdown-item name="2">
								炸酱面
							</vc-dropdown-item>
							<vc-dropdown-item name="3">
								豆汁儿
							</vc-dropdown-item>
							<vc-dropdown-item name="4">
								冰糖葫芦
							</vc-dropdown-item>
						</template>
					</vc-popover>

					<!-- 高级嵌套需要v-model -->
					<vc-popconfirm
						v-model="visiblePopconfirm"
						:portal="false"
						:trigger="trigger"
						tag="li" 
						class="vc-dropdown-item"
						placement="right"
						title="确定删除吗？"
					>
						<span>北京烤鸭popconfirm</span>
						<template #content>
							<vc-input v-model="inputV" />
						</template>
					</vc-popconfirm>
				</vc-dropdown-menu>	
				
				<!-- indeterminate 测试slot同步 -->
				<div style="border-bottom: 1px solid #e9e9e9;padding-bottom:6px;margin-bottom:6px;">
					<vc-checkbox
						:indeterminate="indeterminate"
						:model-value="checkAll"
						@click.prevent="handleCheckAll"
					>
						全选
					</vc-checkbox>
				</div>
				<vc-checkbox-group v-model="checkAllGroup" @change="handleCheckChange">
					<vc-checkbox label="香蕉" />
					<vc-checkbox label="苹果" />
					<vc-checkbox label="西瓜" />
				</vc-checkbox-group>
				<vc-button 
					style="margin-left: 100px" 
					@click="handleClose"
				>
					关闭
				</vc-button>
			</template>
		</vc-dropdown>

		<vc-button style="margin-left: 100px" @click="handleVisible">
			visible: {{ visible }}
		</vc-button>
		<vc-button style="margin-left: 100px" @click="handleTrigger">
			trigger {{ trigger }}
		</vc-button>
	</div>
</template>
<script>
import { defineComponent, ref } from 'vue';
import Dropdown from '..';
import Popover from '../../popover';
import Popconfirm from '../../popconfirm';
import Button from '../../button';
import Input from '../../input';
import Checkbox from '../../checkbox';

export default defineComponent({
	name: "vc-tpl-basic",
	components: {
		'vc-dropdown': Dropdown,
		'vc-dropdown-menu': Dropdown.Menu,
		'vc-dropdown-item': Dropdown.Item,
		'vc-button': Button,
		'vc-popover': Popover,
		'vc-popconfirm': Popconfirm,
		'vc-checkbox': Checkbox,
		'vc-checkbox-group': Checkbox.Group,
		'vc-input': Input,
	},

	setup() {
		const visible = ref(false);
		const visiblePopover = ref(false);
		const visiblePopconfirm = ref(false);
		const trigger = ref('hover');

		const indeterminate = ref(true);
		const checkAll = ref(false);
		const checkAllGroup = ref(['香蕉', '西瓜']);
		const inputV = ref('');

		let wait;
		let timer;
		return {
			visible, 
			visiblePopover, 
			visiblePopconfirm, 
			trigger, 
			indeterminate, 
			checkAll,
			checkAllGroup, 
			inputV,
			handleClick() {
				/**
				 * 两层以上销毁
				 */
				visiblePopover.value = false; // 让popover先消失
				visible.value = false;

				console.log('click', arguments[0]);
			},

			handleChange() {
				console.log('visible-change', arguments[0]);
			},

			/**
			 * 事件冒泡上来了
			 */
			handleVisible() {
				/**
				 * click模式下，this.visible会一直拿到false
				 */
				if (!wait) {
					visible.value = !visible.value;
				}
			},

			handleClose() {
				visible.value = false;
			},

			handleCloseCb() {
				console.log('cb');
				wait = 1;
				timer = setTimeout(() => {
					wait = 0;
				}, 200);
			},
			handleTrigger() {
				trigger.value = trigger.value === 'click' ? 'hover' : 'click';
			},

			handleCheckAll() {
				if (indeterminate.value) {
					checkAll.value = false;
				} else {
					checkAll.value = !checkAll.value;
				}
				indeterminate.value = false;

				if (checkAll.value) {
					checkAllGroup.value = ['香蕉', '苹果', '西瓜'];
				} else {
					checkAllGroup.value = [];
				}
			},
			handleCheckChange(data) {
				if (data.length === 3) {
					indeterminate.value = false;
					checkAll.value = true;
				} else if (data.length > 0) {
					indeterminate.value = true;
					checkAll.value = false;
				} else {
					indeterminate.value = false;
					checkAll.value = false;
				}
			}
		};
	}
});
</script>
