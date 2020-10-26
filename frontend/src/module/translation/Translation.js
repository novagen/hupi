import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { I18Backend } from 'class';

class Translation {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.initialized = false;

		this.app.require([ 'client' ], this._init.bind(this));

		this._initialized = this._initialized.bind(this);
		this._failed = this._failed.bind(this);

		this.t = this.t.bind(this);
	}

	_init(module) {
		this.module = module;
		this.waiting = [];

		i18next.on('initialized', this._initialized);
		i18next.on('failedLoading', this._failed);

		i18next.use(I18Backend).use(LanguageDetector).init({
			backend: {
				client: this.module.client
			},
			fallbackLng: 'en',
			saveMissing: true,
			debug: this.params.debug,
			ns: ['layout', 'alert' ],
			defaultNS: 'layout'
		}).then(() => {}).catch(e => {
			console.error(e);
		});
	}

	_failed() {
		for(let i in this.waiting) {
			this.waiting[i].resolver(this.waiting[i].formatter(i.defaultValue));
		}
	}

	_initialized() {
		this.initialized = true;
		i18next.off('initialized', this._initialized);

		for(let i in this.waiting) {
			let value = i18next.t(this.waiting[i].key, i.defaultValue);
			this.waiting[i].resolver(this.waiting[i].formatter(value));
		}
	}

	t(key, defaultValue, formatter, ns = "layout") {
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

			this.waiting.push({ key, promise, resolver, rejecter, formatter, defaultValue });
			return promise;
		}

		return new Promise((resolve, _) =>  {
			resolve(formatter(i18next.t(key, defaultValue)));
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