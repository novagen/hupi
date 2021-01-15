// Create a require context of all js-files that has the same case-insensitive name as its parent folder
const req = require.context("module/", true, /^.*\/([^/]*)\/\1.js$/i);

let modules = {};

console.log(req.keys());

// Using the first-character-lowercase name of the js-file as module name
req.keys().forEach(key => {
	// this is because require.context gives duplicates (both ./module.js AND module/path/module.js), something broke after updating to webpack 5.
	if(key.startsWith('./')) { return; }

	let match = key.match(/\/([^/]*)\.js$/);
	let name = match[1].charAt(0).toLowerCase() + match[1].slice(1);

	if (modules[name]) {
		throw new Error(`Duplicate module: ${key}`);
	}

	modules[name] = req(key).default;
});

export default modules;