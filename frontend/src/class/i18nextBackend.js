class Backend {
	constructor(services, options = {}) {
		this.init(services, options);
		this.type = 'backend';

		if (options && options.client) {
			this.client = options.client;
		}

		if (options && options.errorLogger) {
			this.errorLogger = options.errorLogger;
		}
	}

	init(services, options = {}) {
		this.services = services;
		this.options = options;

		if (options && options.client) {
			this.client = options.client;
		}

		if (options && options.errorLogger) {
			this.errorLogger = options.errorLogger;
		}
	}

	read(language, namespace, callback) {
		this.client.call(`system.translation.${language}`, "load", { namespace }).then(r => {
			callback(null, JSON.parse(r));
		}).catch(e => {
			if (this.errorLogger) {
				this.errorLogger(e);
			}
		});
	}

	save(language, namespace, data, callback) {
		this.client.call(`system.translation.${language}`, "save", { namespace, data }).then(r => {
			callback(null, JSON.parse(r));
		}).catch(e => {
			if (this.errorLogger) {
				this.errorLogger(e);
			}
		});
	}

	create(languages, namespace, key, fallbackValue) {
		this.client.call(`system.translation.system`, "create", { languages, namespace, key, fallbackValue }).then(() => {
		}).catch(e => {
			if (this.errorLogger) {
				this.errorLogger(e);
			}
		});
	}
}

Backend.type = 'backend';

export default Backend;