import AudioComponent from './AudioComponent';
import { Model } from 'modapp-resource';

const namespace = 'module.audio';

const OBJ_DEF = {
	devices: {
		type: 'object'
	}
};

class Audio {
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
			id: "audio",
			name: 'Audio',
			parentId: null,
			order: 20,
			setState: this._setState,
			component: {
				'main': new AudioComponent(this.app, this.module, this.model)
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
		return this.module.client.get("audio.devices").then(m => {
			this.model.set({
				devices: m
			});
		}).catch(() => { });
	}
}

export default Audio;