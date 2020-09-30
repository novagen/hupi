import { AppExt, eventBus } from 'modapp';
import modules from './modules';
import config from 'module.config';
import Router from 'modapp-router/Router';

import 'foundation-sites';
import './scss/default.scss';

// Create app and load core modules
window.app = new AppExt(config, { eventBus: eventBus });

// Add imported modules
modules.router = Router;

window.app.loadBundle(modules).then(result => {
	console.info("[Main] Loaded modules: ", result);
	window.app.render(document.body);
});