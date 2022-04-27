// @file 含该组件内所有类型定义
export interface UploadPickerConfig {
	recognizer?: () => any;
	gallery?: () => any;
}

export interface VideoPreviewConfig {
	enhancer?: (src: string | object) => any
}
