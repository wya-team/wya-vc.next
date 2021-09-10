// @file 含该组件内所有类型定义

/**
 * ImagePreview允许的全局配置项
 */
export interface ImagePreviewConfig {
	/**
	 * 预览增强，如在微信环境下使用原生预览等等
	 */
	enhancer?: () => any;

	/**
	 * photo 工具链扩展
	 */
	actionBar?: object;
}