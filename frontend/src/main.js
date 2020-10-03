import { AppExt, eventBus } from 'modapp';
import modules from './modules';
import config from 'module.config';

import 'foundation-sites';
import './scss/default.scss';

// Create app and load core modules
window.app = new AppExt(config, { eventBus: eventBus });

window.app.loadBundle(modules).then(result => {
	// eslint-disable-next-line no-console
	console.info("[Main] Loaded modules: ", result);
	window.app.render(document.body);
});