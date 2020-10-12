import SettingsComponent from './SettingsComponent';

class Settings {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'router', 'layout','alert', 'client', 'translation' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = this.module.client.getModel();

		this.module.router.addRoute({
			id: "settings",
			name: 'Settings',
			icon: 'cog',
			parentId: null,
			order: 40,
			setState: () => {},
			component: {
				'main': new SettingsComponent(this.app, this.module)
			},
			getUrl: () => {},
			parseUrl: () => {}
		});
	}

	dispose() {
		this.app.unsetComponent(this.component);
		this.component = null;
	}
}

export default Settings;