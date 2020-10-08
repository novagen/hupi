import path from 'path';
import fs from 'fs';
import Merger from './merger';

let config = {
	nats: {
		path: 'nats://localhost:4222',
		logging: 'default' // default, none, verbose
	}
};

let localConfig = {
	default: {}
};

var localConfigPath = path.join(__dirname, 'config.local.js'); // Find optional local config

if (fs.existsSync(localConfigPath)) {
	localConfig = require(localConfigPath);
}

export default Merger.DeepMerge(config, localConfig.default); // Override config with values from local