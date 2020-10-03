import ResClient from 'resclient';
import { Model } from 'modapp-resource';
import Cookies from 'js-cookie';

const namespace = 'module.client';

const OBJ_DEF = {
	token: {
		type: '?string',
		default: '-'
	},
	id: {
		type: '?string'
	},
	loading: {
		type: 'boolean'
	},
	notifications: {
		type: 'boolean',
		default: Notification.permission === 'granted'
	}
};

class Client extends ResClient {
	constructor(app, params) {
		super(params.url);

		this.app = app;
		this.params = params;

		this.app.require([ 'alert' ], this._init.bind(this));

		this.model = new Model({
			eventBus: this.app.eventBus,
			namespace: namespace + '.model',
			definition: OBJ_DEF,
			data: {}
		});

		this._modelChanged = this._modelChanged.bind(this);
		this.model.on('change', this._modelChanged);
	}

	_init(module) {
		this.module = module;

		this.setOnConnect(() => {
			if (!Cookies.get('login')) {
				return new Promise(resolve => {
					this.model.set({ token: null });
					resolve();
				});
			}

			return this.authenticate("user", "token", { }).then(u => {
				this.model.set({ token: u.token, id: u.id });
			}).catch(e => {
				this.module.alert.error(e.code);
				this.model.set({ token: null });
			});
		});

		this.on("connect", () => {
		});

		this.on("disconnect", () => {
		});

		this.on("error", e => {
			if (e.method === "auth.user.reconnect") {
				this.model.set({ token: null });
			}

			if (e.code === "system.accessDenied") {
				this.module.alert.error(e.code);
				this.model.set({ token: null });
			} else {
				this.module.alert.error(e.code);
			}
		});
	}

	dispose() {
		this.model.off('change', this._modelChanged);
	}

	_modelChanged(changed) {
		if (changed && Object.prototype.hasOwnProperty.call(changed, "token")) {
			if (this.model.token) {
				Cookies.set('login', this.model.token);
			} else {
				Cookies.remove('login');
			}
		}
	}

	logout() {
		this.model.set({ token: null });
	}

	loading(loading) {
		this.model.set({ loading });
	}

	getModel() {
		return this.model;
	}
}

export default Client;