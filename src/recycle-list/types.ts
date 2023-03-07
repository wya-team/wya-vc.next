// @file 含该组件内所有类型定义
export interface RecycleListConfig {
	renderLoading?: () => any;
	renderFinish?: () => any;
	renderEmpty?: () => any;
	// 下拉刷新
	renderRefresh?: () => any;
}