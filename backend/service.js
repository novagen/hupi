/* eslint-disable no-console */
var signals = {
    'SIGHUP': 1,
    'SIGINT': 2,
    'SIGTERM': 15
};

class Service {
    constructor(name, config) {
        this.name = name;
        this.config = config;

        this.connect = this.connect.bind(this);
        this._shutdown = this._shutdown.bind(this);

        Object.keys(signals).forEach((signal) => {
            process.on(signal, () => {
                this._shutdown(signals[signal]);
            });
        });
    }

    static notFound() {
        return JSON.stringify({ error: { code: "system.notFound", message: "Not found" }});
    }

    static success() {
        return JSON.stringify({ result: null });
    }

    static internalError(message) {
        return JSON.stringify({ error: { code: "system.internal", message }});
    }


    connect() {
        this.nats = require('nats').connect(this.config.path);

        this.nats.getService = () => {
            return this;
        };

		this.nats.on('error', (err) => {
			console.info('[' + this.name + '] error', err);
		});

		this.nats.on('connect', () => {
			console.info('[' + this.name + '] connected');
		});

		this.nats.on('disconnect', () => {
			console.info('[' + this.name + '] disconnected');
		});

		this.nats.on('close', () => {
			console.info('[' + this.name + '] closed');
		});

		this.nats.on('permission_error', (err) => {
			console.info('[' + this.name + '] permission_error', err);
		});

		if (this.config.logging === 'verbose') {
			this.nats.on('reconnecting', () => {
				console.info('[' + this.name + '] reconnecting');
			});

			this.nats.on('reconnect', () => {
				console.info('[' + this.name + '] reconnected');
			});
		}

        return this.nats;
    }

    _shutdown(signal) {
        console.info(`[${this.name}] shutting down`);

        this.nats.on('close', () => {
            process.exit(128 + signal);
        });

        this.nats.unsubscribe("*");
        this.nats.close();
    }
}

export default Service;