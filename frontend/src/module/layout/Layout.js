import LayoutComponent from './LayoutComponent';
import MainComponent from './MainComponent';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

class Layout {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.app.require([ 'router', 'client', 'alert', 'permission', 'translation' ], this._init.bind(this));
		this._alert = this._alert.bind(this);
		this._askForNotificationPermission = this._askForNotificationPermission.bind(this);
	}

	_init(module) {
		this.module = module;
		this.model = this.module.client.getModel();
		this._modelChanged = this._modelChanged.bind(this);

		this.module.router.addRoute({
			id: "",
			name: 'Start',
			parentId: null,
			order: 10,
			setState: () => {},
			component: {
				'main': new MainComponent(this.app, this.module)
			},
			getUrl: () => {},
			parseUrl: () => {}
		});

		this._notyf = new Notyf({
			duration: 3000,
			types: [
				{
					type: 'warning',
					backgroundColor: 'orange',
					icon: false
				},
				{
					type: 'info',
					backgroundColor: 'blue',
					icon: false
				}
			]
		});

		this.model.on('change', this._modelChanged);
		this.module.alert.on('show', this._alert);

		this.module.client.connect();

		if (this.params.enableNotifications && window.Notification) {
			this._askForNotificationPermission();
		}
	}

	_askForNotificationPermission() {
		if (!this.model.notifications && Notification.permission != "granted" && Notification.permission != "denied") {
			this.module.permission.request({
				name: "Notification",
				description: "Allow notifications",
				request: m => {
					return new Promise((r, e) =>  {
						Notification.requestPermission().then(result => {
							m.set({ notifications: result === 'granted' });
							r(true);
						}).catch(err => {
							e(err);
						});
					});
				}
			});
		}
	}

	_alert(data) {
		let key = data.message;

		this.module.translation.t(key, null, 'alert').then(r => {
			data.message = r;

			if (this._notyf) {
				this._notyf.open(data);
			}

			if (this.model.notifications) {
				new Notification(`hupi`, { body: `${data.type}\n\n${data.message}` });
			}
		});
	}

	_modelChanged() {
		this.app.setComponent(new LayoutComponent(this.app, this.module, this.params, this.model, this.client));
	}

	dispose() {
		this.model.off('change', this._modelChanged);
		this.module.alert.off('show', this._alert);

		if (this._notyf) {
			this._notyf = null;
		}

		this.app.unsetComponent(this.component);
		this.component = null;
	}
}

export default Layout;