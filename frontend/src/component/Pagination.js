import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import Transition from 'modapp-base-component/lib/Transition';

import './scss/Pagination.scss';

class Pagination {
	constructor(model, onPrev, onNext, onPage, opt) {
		this.model = model;

		this.onPrev = onPrev;
		this.onNext = onNext;
		this.onPage = onPage;

		this.opt = Object.assign({
			prevText: '',
			nextText: '',
			totalText: '',
			showPages: false,
			showTotal: true,
			countText: i => new Promise(r => {
				r(` : ${i.toString()}`);
			})
		}, opt);

		this._setEventListener = this._setEventListener.bind(this);
		this._onChange = this._onChange.bind(this);
		this._update = this._update.bind(this);
	}

	render(el) {
		this.node = new Elem(n => n.elem('div', { className: "grid-x" }, [
			n.elem('div', { className: "cell" }, [
				n.component("pages", new Transition())
			])
		]));

		this.node.render(el);
		this._update();
		this._setEventListener(true);
	}

	_setEventListener(on) {
		if (this.model && this.model.on) {
			if (on) {
				this.model.on('change', this._onChange);
			} else {
				this.model.off('change', this._onChange);
			}
		}
	}

	_onChange(changed) {
		if (Object.prototype.hasOwnProperty.call(changed, 'count') || Object.prototype.hasOwnProperty.call(changed, 'limit') || Object.prototype.hasOwnProperty.call(changed, 'start')) {
			this._update();
		}
	}

	_update() {
		if(!this.node) {
			return;
		}

		let node = this.node.getNode("pages");
		node.fade(new Elem(n => n.elem('ul', { className: "pagination" }, this._getComponents(n))));
	}

	_getComponents(n) {
		const components = [];

		components.push(n.elem('li', { className: "pagination-previous" + (this.model.start <= 0 ? " disabled" : "") }, [
			n.component("prev", new ModelTxt(this.model, () => this.opt.prevText, {
				tagName: this.model.start <= 0 ? "span" : "a",
				className: this.opt.prevText ? "" : "blank",
				events: {
					"click": () => {
						if (!this.onPrev || this.model.start == 0) {
							return;
						}

						this.onPrev(this.model);
					}
				}
			}))
		]));

		components.push(...this._getPages(n));

		components.push(n.elem('li', { className: "pagination-next" + ((this.model.count <= this.model.start + this.model.limit) ? " disabled" : "") }, [
			n.component("next", new ModelTxt(this.model, () => this.opt.nextText, {
				tagName: (this.model.count <= this.model.start + this.model.limit) ? "span" : "a",
				className: this.opt.nextText ? "" : "blank",
				events: {
					"click": () => {
						if (!this.onNext || (this.model.count <= this.model.start + this.model.limit)) {
							return;
						}

						this.onNext(this.model);
					}
				}
			}))
		]));

		if (this.opt.showTotal) {
			components.push(n.elem("span", { className: "pagination-counter float-right" }, [
				n.component(new ModelTxt(this.model, () => this.opt.totalText, { tagName: "span", className: "" })),
				n.component(new ModelTxt(this.model, i => this.opt.countText(i.count), { tagName: "span", className: "" }))
			]));
		}

		return components;
	}

	_getPages(n) {
		let components = [];

		if (!this.opt.showPages || this.model.count <= 0) {
			return components;
		}

		let pages = Math.ceil(this.model.count / this.model.limit);
		let current = pages - Math.ceil((this.model.count - this.model.start) / this.model.limit);

		for (let i = 0; i < pages; i++) {
			components.push(n.elem('li', { className: i == current ? "current" : "" }, [
				n.component(new Txt( (i + 1).toString(), {
					tagName: i == current ? "span" : "a",
					className: "",
					events: {
						"click": () => {
							if (!this.onPage || i == current) {
								return;
							}

							this.onPage(this.model, i);
						}
					}
				}))
			]));
		}

		if (components.length > 10) {
			let pageCollection = [];
			let page = current + 1;

			if (page < 4 || page > components.length - 3) {
				pageCollection.push(...components.slice(0, 4));
				pageCollection.push(this._getEllipsis(n));
				pageCollection.push(...components.slice(components.length - 4, components.length));
			} else {
				pageCollection.push(...components.slice(0, 3));

				if (page == 4) {
					pageCollection.push(...components.slice(page - 1, page + 1));
					pageCollection.push(this._getEllipsis(n));
				} else if (page == 5) {
					pageCollection.push(...components.slice(page - 2, page + 1));
					pageCollection.push(this._getEllipsis(n));
				} else if (page > 5 && page < components.length - 3) {
					pageCollection.push(this._getEllipsis(n));
					pageCollection.push(...components.slice(page - 2, page + 1));
					pageCollection.push(this._getEllipsis(n));
				} else if (page == components.length - 3) {
					pageCollection.push(this._getEllipsis(n));
					pageCollection.push(...components.slice(page - 2, page));
				} else if (page == components.length - 4) {
					pageCollection.push(...components.slice(3, 4));
					pageCollection.push(this._getEllipsis(n));
					pageCollection.push(...components.slice(page - 1, page));
				}

				pageCollection.push(...components.slice(components.length - 3, components.length));
			}

			components = pageCollection;
		}

		return components;
	}

	_getEllipsis(n) {
		return n.elem('li', { className: "ellipsis", attributes: { "aria-hidden": "true" } });
	}

	unrender() {
		this._setEventListener(false);

		this.node.unrender();
		this.node = null;
	}
}

export default Pagination;