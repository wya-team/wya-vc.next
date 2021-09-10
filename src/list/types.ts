// @file 含该组件内所有类型定义


export interface ListProps {
	labelWidth: string | number;
	border: boolean;
}


export interface ListInject extends Options {
	props: ListProps
}