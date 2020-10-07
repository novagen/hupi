import { AppExt, eventBus } from 'modapp';
import modules from './modules';
import config from 'module.config';

import 'foundation-sites';
import './scss/default.scss';

//import '../node_modules/@fortawesome/fontawesome-free/css/all.css';
//import '../node_modules/@fortawesome/fontawesome-free/js/all.js';

// Create app and load core modules
window.app = new AppExt(config, { eventBus: eventBus });

window.app.loadBundle(modules).then(result => {
	// eslint-disable-next-line no-console
	console.info("[Main] Loaded modules: ", result);
	window.app.render(document.body);
});
