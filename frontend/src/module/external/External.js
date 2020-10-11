import ExternalComponent from './ExternalComponent';

class External {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'router', 'layout','alert', 'client', 'translation' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = this.module.client.getModel();

		this.module.router.addRoute({
			id: "external",
			name: 'External',
			icon: 'broadcast-tower',
			parentId: null,
			order: 30,
			setState: () => {},
			component: {
				'main': new ExternalComponent(this.app, this.module)
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

export default External;