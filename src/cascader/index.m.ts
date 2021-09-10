import MCascader from './mobile/cascader.vue';
import MCascaderView from './mobile/cascader-view.vue';
import { Func } from './mobile/core.vue';

MCascader.View = MCascaderView;
// 方法
MCascader.open = Func.popup;

export default MCascader;
