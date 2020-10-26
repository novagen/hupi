import { anim, elem } from 'modapp-utils';

/**
 * @module component/Container
 */
class Container {

	/**
	 * Creates a Transition
	 * @constructor
	 * @alias module:component/Container
	 * @param {object} [opt] Optional parameters
	 * @param {number} [opt.distance] Swipe distance in pixels. Defaults to 64.
	 * @param {number} [opt.duration] Swipe duration in milliseconds. Defaults to 150.
	 * @param {string} [opt.mode] Transition container mode. Defaults to 'flex'.
	 */
	constructor(opt = {}) {
        this.opt = Object.assign({}, opt);

		this.div = null;
		this.current = null;
		this.rendered = null;
	}

	get id() {
		return this.current ? this.current.id : undefined;
	}

	render(el) {
        if (this.div) throw "Component already rendered";
        
		this.div = elem.create('div', { });
        
        if (this.opt.className) {
            this.div.className = Array.isArray(this.opt.className)
                ? this.opt.className.join(' ')
                : this.opt.className;
        }

		elem.append(el, this.div);
		this._renderComponent();

		return this.div;
	}

	unrender() {
		if (!this.div) return;

		this._unrenderComponent();

		elem.remove(this.div);
		this.div = null;
	}

	/**
	 * Get the current component
	 * @returns {object}
	 */
	getComponent() {
		return this.current;
	}

	/**
	 * Set a new component
	 * @param {object} component The component to use
	 * @returns {this}
	 */
	set(component) {
		component = component || null;

		// Is the component already current?
		if (this._isEqual(this.current, component)) return this;

		this.current = component;

		if (!this.div) return this;

		// Is the component already rendered?
		if (this._isEqual(this.rendered, component)) {
			this.div.style.opacity = '';
			this.div.style.left = '';
		} else {
			// Unrender previously rendered component
			this._unrenderComponent();
			// Render the current component
			this._renderComponent();
		}

		return this;
	}

	_setComponent(component, direction) {
		component = component || null;

		// Is the component already current?
		if (this._isEqual(this.current, component)) return;

		this.current = component;

		if (!this.div) return;

		this.animId = anim.stop(this.animId);

		// Check if the rendered page matches the one we want
		if (this._isEqual(this.rendered, this.current)) {
			return;
		}

		if (this.rendered) {
            this._unrenderComponent();
        }

		this._renderComponent(direction);
	}

	_isEqual(componentA, componentB) {
		if (componentA === componentB) return true;
		if (!componentA || !componentB) return false;
		// eslint-disable-next-line no-prototype-builtins
		if (!componentA.hasOwnProperty('id') || !componentB.hasOwnProperty('id')) return false;
		return componentA.id === componentB.id;
	}

	_unrenderComponent() {
		if (!this.rendered) return;

		if (this.rendered.unrender) {
			this.rendered.unrender();
		}

        this.rendered = null;
		elem.empty(this.div);
	}

	_renderComponent() {
		if (!this.current) return;

		this.current.render(this.div);

		this.rendered = this.current;
	}
}

export default Container;