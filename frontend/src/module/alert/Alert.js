/**
 * Alert handles message popups
 * @module module/Alert
 */
class Alert {

	constructor(app, params) {
		this.app = app;
		this.params = params;
		this.routes = {};
		this.current = null;

		this.error = this.error.bind(this);
		this.show = this.show.bind(this);

		this.app.require([ ], this._init.bind(this));
		this.messages = [];
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Attach an event handler function for one or more module events.
	 * @param {?string} events One or more space-separated events (eg. 'disconnect'). Null means any event.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this.app.eventBus.on(this, events, handler, 'module.alert');
	}

	/**
	 * Remove an app event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {function=} handler An optional handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.app.eventBus.off(this, events, handler, 'module.alert');
	}

	error(code) {
		let message = code.replace(/\./g, "_");
		this.show(message, "warning");
	}

	show(message, type) {
		let data = {
			type: type,
			message: message
		};

		this.app.eventBus.emit(this, 'module.alert.show', data);
	}
}

export default Alert;