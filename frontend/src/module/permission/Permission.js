import { Collection, Model } from 'modapp-resource';

class Permission {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		this.request = this.request.bind(this);
		this.remove = this.remove.bind(this);

		this.app.require([], this._init.bind(this));

		this.collection = new Collection({
			namespace: 'permission',
			eventBus: this.app.eventBus,
			idAttribute: m => m.name
		});
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
		this.app.eventBus.on(this, events, handler, 'module.permission');
	}

	/**
	 * Remove an app event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {function=} handler An optional handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this.app.eventBus.off(this, events, handler, 'module.permission');
	}

	request(data) {
		let item = new Model({
			namespace: 'permission.item',
			eventBus: this.app.eventBus,
			data: data
		});

		this.collection.add(item);
		this.app.eventBus.emit(this, 'module.permission.request', item);
	}

	remove(data) {
		this.collection.remove(data);
	}
}

export default Permission;