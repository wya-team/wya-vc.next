export const IS_SERVER = typeof window === 'undefined';
export const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * 自动销毁的标记，挂载到app上，避免冲突
 */
export const PORTAL_AUTO_DESTROY_TAG = '__AUTO_DESTROY__';
/**
 * 销毁的函数，挂载到app上，避免冲突
 */
export const PORTAL_DESTROY_METHOD = '__VC_DESTROY__';
/**
 * 目标的实例，挂载到app上，wrapper官方没使用，暂时用这个
 */
export const PORTAL_WRAPPER_INSTANCE = 'wrapper';

/**
 * TODO: 暂定parent
 * 目标的父层
 */
export const PORTAL_PARENT = 'parent';
