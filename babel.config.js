module.exports = (api) => {
	api && api.cache.forever();
	
	return {
		presets: ['@babel/preset-env'],
		plugins: [
			[
				"@babel/plugin-proposal-class-properties",
				{
					"assumptions": {
						"setPublicClassFields": true
					}
				}
			],
			"@babel/plugin-transform-runtime"

		]
	};
};