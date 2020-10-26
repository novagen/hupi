import DashComponent from './DashComponent';

class Dash {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'router', 'layout','alert', 'client', 'translation' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.model = this.module.client.getModel();

		this.module.router.addRoute({
			id: "dash",
			name: 'Dash',
			icon: 'tachometer-alt',
			parentId: null,
			order: 40,
			setState: () => {},
			component: {
				'main': new DashComponent(this.app, this.module)
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

export default Dash;