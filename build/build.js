const fs = require('fs-extra');
const { resolve, relative } = require('path');
const chalk = require('chalk');
const glob = require('glob');
const postcss = require('postcss');
const sass = require('node-sass');
const postcssOpts = require('../.postcssrc.js');

const { log } = console;
const APP_ROOT = resolve(__dirname, '../');

(async () => {
	let cssInfo = glob
		.sync(`src/*`, {
			ignore: ['src/{__tpl__,index.js}']
		})
		.reduce((pre, cur) => {
			pre[cur.replace(/src\//, '')] = [];
			return pre;
		}, {});

	let thirdInfo = [];

	const files = glob.sync(`src/**/*.{ts,tsx,js,jsx,scss,vue}`, {
		ignore: ['src/**/{__test__,examples,demo}/**', 'src/__tpl__/**']
	});

	// 文件检查
	const _files = files.map((file) => file.replace(/\.(vue|js|scss|ts)x?$/, ''));
	if (files.length !== [...new Set(_files)].length) {
		_files.forEach((file, index, source) => {

		});

		let reject;
		for (let i = 0; i < _files.length; i++) {
			if (i != _files.indexOf(_files[i])) {
				reject = _files[i];
				break;
			}
		}
		
		// ⚠️
		throw new Error(`${reject} + 文件存在重复, 不区分{js,scss,vue}`);
	}

	const exportCssFile = (filepath, data, record = true, promise) => {
		if (!data) return promise ? Promise.resolve() : null;
		let result;

		let fn = (onSuccess, onError) => {
			try {
				result = sass.renderSync({
					data,
					file: filepath
				});
			} catch (e) {
				console.error(filepath, 'sass 解析失败');
				throw e;
			}
			
			postcss(postcssOpts.plugins)
				.process(result.css, { 
					from: filepath
				})
				.then(({ css }) => {
					filepath = resolve(APP_ROOT, filepath.replace(/src/, 'lib').replace(/\.(vue|js|scss)/, '.css'));
					fs.outputFileSync(
						filepath, 
						css
					);

					onSuccess && onSuccess();
					if (!record) return;
					let [key, ...rest] = relative(resolve(APP_ROOT, './lib'), filepath).split('/');
					cssInfo[key].push(rest.join('/'));

					if (rest.join('/').includes('third.css')) {
						thirdInfo.push([key, ...rest].join('/'));
					}
				})
				.catch((e) => {
					onError && onError(e);
					console.error('css 生成失败');
					throw new Error(e);
				});
		};


		return promise 
			? new Promise(fn)
			: fn();
		
	};
	// 拷贝文件，用于退出时的打包
	fs.copySync(resolve(APP_ROOT, './src/index.ts'), resolve(APP_ROOT, './lib/index.copy.ts'));

	// 预编译文件
	files.forEach((filepath) => {
		let type = filepath.split('.').pop();
		const FILE_PATH = resolve(APP_ROOT, filepath);
		const FILE_CONTENT = fs.readFileSync(FILE_PATH, 'utf-8');

		let fns = {
			scss: () => {
				exportCssFile(filepath, FILE_CONTENT);
			},
			css: () => {
				exportCssFile(filepath, FILE_CONTENT);
			}
		};

		fns[type] && fns[type]();
	});
})();