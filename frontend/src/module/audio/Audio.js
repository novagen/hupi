import AudioComponent from './AudioComponent';

class Layout {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'router', 'layout','alert', 'client', 'translation' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = this.module.client.getModel();

		this.module.router.addRoute({
			id: "audio",
			name: 'Audio',
			parentId: null,
			order: 20,
			setState: () => {},
			component: {
				'main': new AudioComponent(this.app, this.module)
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

export default Layout;