import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { Backend } from 'class';

class Translation {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.initialized = false;

		this.app.require([ 'client' ], this._init.bind(this));

		this._initialized = this._initialized.bind(this);
		this.t = this.t.bind(this);
	}

	_init(module) {
		this.module = module;
		this.waiting = [];

		i18next.on('initialized', this._initialized);

		i18next.use(Backend).use(LanguageDetector).init({
			backend: {
				client: this.module.client
			},
			fallbackLng: 'en',
			saveMissing: true,
			debug: false,
			ns: ['layout', 'alert' ],
			defaultNS: 'layout'
		}).then(() => {}).catch(() => {});
	}

	_initialized() {
		this.initialized = true;
		i18next.off('initialized', this._initialized);

		for(let i in this.waiting) {
			this.waiting[i].resolver(this.waiting[i].formatter(i18next.t(this.waiting[i].key)));
		}
	}

	t(key, formatter, ns = "layout") {
		key = `${ns}:${key.toLowerCase().replace(/ /g, "_").replace(/\./g, "_")}`;

		if (formatter === undefined || formatter ===  null) {
			formatter = val => {
				return val;
			};
		}

		if (!this.initialized) {
			let resolver;
			let rejecter;

			let promise = new Promise((resolve, reject) => {
				resolver = resolve;
				rejecter = reject;
			});

			this.waiting.push({ key, promise, resolver, rejecter, formatter });
			return promise;
		}

		return new Promise((resolve, _) =>  {
			resolve(formatter(i18next.t(key)));
		});
	}

	on(events, handler) {
		this.app.eventBus.on(this, events, handler, 'module.translation');
	}

	off(events, handler) {
		this.app.eventBus.off(this, events, handler, 'module.translation');
	}
}

export default Translation;