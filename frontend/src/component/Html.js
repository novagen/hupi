import RootElem from './RootElem';

/**
 * A text component
 */
class Html extends RootElem {

	/**
	 * Creates an instance of Html
	 * @param {string|LocaleString} text Display text
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.tagName] Tag name (eg. 'h1') for the element. Defaults to 'span'.
	 * @param {string} [opt.className] Class name
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 */
	constructor(text, opt) {
		opt = Object.assign({ tagName: 'span', afterRender: () => {} }, opt);
		super(opt.tagName, opt);

		this.text = text || "";
		this.rendered = null;

		// Bind callbacks
		this._handleChange = this._handleChange.bind(this);
	}

	/**
	 * Sets the display text
	 * @param {string|LocaleString} text Display text
	 * @returns {this}
	 */
	setText(text) {
		text = text || "";

		Promise.resolve(text).then(value => {
			if (this.text !== value) {
				this.text = value;

				if (super.getElement()) {
					this._handleChange();
				}
			}
		});

		return this;
	}

	render(el) {
		let nodeEl = super.render(el);

		Promise.resolve(this.text).then(value => {
			this.text = value;
			nodeEl.innerHTML = this.text;
		});

		return nodeEl;
	}

	unrender() {
		super.unrender();
		this.rendered = null;
	}

	_handleChange() {
		let el = super.getElement();
		if (!el) {
			return;
		}

		Promise.resolve(this.text).then(value => {
			if (!el) { return; }

			let next = value;
			if (this.rendered === next) {
				return;
			}

			this.rendered = next;
			el.innerHTML = next;
		});
	}
}

export default Html;