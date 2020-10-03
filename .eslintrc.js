module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true,
		"node": true
	},
	"extends": "eslint:recommended",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parserOptions": {
		"ecmaVersion": 2018,
		"sourceType": "module"
	},
	"rules": {
		"no-console": 1,
		"no-unused-vars": [2, {
			"args": "all",
			"argsIgnorePattern": "^_"
		}],
		"semi": [2, "always"]
	},
	"overrides": [ // Accept console in web, scripts and bridge
		{
			"files": ["src/**/*.js", "bridge/*.js", "database/*.js"],
			"rules": {
				"no-console": 0
			}
		},
		{
			"files": ["scripts/*.js", "server.js"],
			"rules": {
				"no-console": 0
			}
		}
	]
};