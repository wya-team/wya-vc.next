// @file 含该组件内所有类型定义
import type { TreeValue } from '../utils/types';

export interface CellChangeOptions extends Options { 
	value: TreeValue;
	rowIndex: number; 
	colIndex: number;
	sync?: boolean;
}