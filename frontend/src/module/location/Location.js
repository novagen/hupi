import LocationComponent from './LocationComponent';
import { Model } from 'modapp-resource';

const namespace = 'module.location';

const OBJ_DEF = {
	data: {
		type: 'object'
	}
};

class Location {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'router', 'layout','alert', 'client', 'translation' ], this._init.bind(this));
		this._setState = this._setState.bind(this);
	}

	_init(module) {
		this.module = module;
		this.model = new Model({
			eventBus: this.app.eventBus,
			namespace: namespace + '.model',
			definition: OBJ_DEF,
			devices: { }
		});

		this.module.router.addRoute({
			id: "location",
			name: 'Location',
			icon: 'map-marked-alt',
			parentId: null,
			order: 50,
			setState: this._setState,
			component: {
				'main': new LocationComponent(this.app, this.module, this.model)
			},
			getUrl: () => {},
			parseUrl: () => {}
		});
	}

	dispose() {
		this.app.unsetComponent(this.component);
		this.component = null;
	}

	_setState() {
		return this.module.client.get("location.spot").then(m => {
			this.model.set({
				data: m
			});
		}).catch(() => { });
	}
}

export default Location;