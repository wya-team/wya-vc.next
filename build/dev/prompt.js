const { resolve } = require('path');
const { prompt, registerPrompt } = require('inquirer');
const autocomplete = require('inquirer-autocomplete-prompt');
const fs = require('fs-extra');

const directory = resolve(__dirname, '../../src/');
const components = ['all'];

fs.readdirSync(directory).forEach((file) => {
	const fullpath = resolve(directory, file);
	// 获取文件信息
	const stat = fs.statSync(fullpath);
	if (!(/(__tpl__|vc|utils|style|^_|hooks)/.test(file)) 
		&& stat.isDirectory()
	) {
		components.push(file);
	}
});

class Prompt {
	async run() {
		const question = [
			{
				type: 'input',
				name: 'port',
				message: 'port:',
				default: '8082'
			},
			{
				type: 'autocomplete',
				message: 'Select component:',
				name: 'component',
				// suggestOnly: true, 开启后可以验证数据且需要使用tab选中
				default: 'all',
				source: (answers, input) => {
					input = input || '';
					return new Promise(($resolve => {
						let filter = input 
							? components.filter(item => item.includes(input))
							: components;
						$resolve(filter);
					}));
				}
			}
		];

		registerPrompt('autocomplete', autocomplete);
		let result = await prompt(question);
		result.component = result.component != 'all' 
			? result.component.replace(/([a-z\dA-Z])([A-Z])/g, '$1-$2').toLowerCase() 
			: '';

		return result;
	}
}
module.exports = Prompt;