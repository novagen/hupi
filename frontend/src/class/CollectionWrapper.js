import {
	eventBus
} from 'modapp';
import {
	array,
	obj
} from 'modapp-utils';

/**
 * A wrapper for a {@link module:modapp~Collection}, exposing the underlaying
 * data but can provide a different sort order, mapping of items, filtering of
 * items, or slicing of the collection. It will transparently propagate emitted
 * add and remove events.
 * @implements {module:modapp~Collection}
 */
class CollectionWrapper {

	/**
	 * Creates an CollectionWrapper instance.
	 * @param {object} collection Collection object to wrap.
	 * @param {object} [opt] Optional parameters.
	 * @param {function} [opt.map] Model map callback. If not provided, item objects will be stored as is.
	 * @param {function} [opt.filter] Model filter callback. Parameter is a item of the underlying collection.
	 * @param {number} [opt.begin] Zero-based index at which to begin extraction, similar to Array.slice.
	 * @param {?number} [opt.end] Zero-based index before which to end extraction, similar to Array.slice. Null extracts until the end of the collection.
	 * @param {function} [opt.compare] Sort compare function.
	 * @param {string} [opt.namespace] Event bus namespace. Defaults to 'collectionWrapper'.
	 * @param {module:modapp~EventBus} [opt.eventBus] Event bus.
	 */
	constructor(collection, opt = {}) {
		this._collection = collection;

		obj.update(this, opt, {
			map: {
				type: '?function',
				property: '_map'
			},
			filter: {
				type: '?function',
				property: '_filter'
			},
			begin: {
				type: 'number',
				default: 0,
				property: '_begin'
			},
			end: {
				type: '?number',
				property: '_end'
			},
			compare: {
				type: '?function',
				property: '_compare'
			},
			namespace: {
				type: 'string',
				default: 'collectionWrapper',
				property: '_namespace'
			},
			eventBus: {
				type: 'object',
				default: eventBus,
				property: '_eventBus'
			}
		});

		if (this._map) {
			this._weakMap = new WeakMap();
		}

		// Bind callbacks
		this._onAdd = this._onAdd.bind(this);
		this._onRemove = this._onRemove.bind(this);
		if (this._filter) {
			this._onChange = this._onChange.bind(this);
		}

		this._initList();
		this._setEventListeners(true);
	}

	_initList() {
		this._list = [];
		this._len = 0;

		let getModel = this._map ?
			item => {
				let m = this._map(item, this._collection);
				this._weakMap.set(item, m);
				return m;
			} :
			item => item;
		let add = this._filter ?
			(item, m) => {
				if (item.on) {
					item.on('change', this._onChange);
				}
				let c = this._wrapModel(m, item);
				if (c.f) this._len++;
				this._list.push(c);
			} :
			(item, m) => {
				this._list.push(this._wrapModel(m, item));
				this._len++;
			};

		for (let item of this._collection) {
			let m = getModel(item);
			add(item, m);
		}

		if (this._compare) {
			this._list.sort((a, b) => this._compare(a.m, b.m));
		}
	}

	/**
	 * Length of the collection.
	 */
	get length() {
		let s = this._beginIdx();
		let e = this._endIdx();
		return s > e ? 0 : e - s;
	}

	toJSON() {
		return this._array().map(m => m.toJSON ? m.toJSON() : m);
	}

	/**
	 * Returns an array of the collection items.
	 * @returns {Array.<*>} An array of items.
	 */
	toArray() {
		return this._array();
	}

	/**
	 * Creates an array filled with all array elements that pass a test.
	 *
	 * Short hand for CollectionWrapper.toArray().map(filter).
	 * @param {function} filter Filter predicate function.
	 * @returns {Array} A new array with the elements that pass the test.
	 */
	filter(filter) {
		return this._array().filter(filter);
	}

	/**
	 * Creates a new array populated with the results of calling a provided
	 * function on every element in the calling array.
	 *
	 * Short hand for CollectionWrapper.toArray().map(callback)
	 * @param {function} callback Function that is called for every item of the collection.
	 * @returns {Array} A new array with each element being the result of the callback function.
	 */
	map(callback) {
		return this._array().map(callback);
	}

	/**
	 * Attach an event handler function for one or more session events.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} handler A function to execute when the event is emitted.
	 */
	on(events, handler) {
		this._eventBus.on(this, events, handler, this._namespace);
	}

	/**
	 * Remove an event handler.
	 * @param {?string} events One or more space-separated events. Null means any event.
	 * @param {Event~eventCallback} [handler] An option handler function. The handler will only be remove if it is the same handler.
	 */
	off(events, handler) {
		this._eventBus.off(this, events, handler, this._namespace);
	}

	/**
	 * Returns the item at a given index, or undefined if the index is out of bounds.
	 * @param {number} idx Zero-based index.
	 * @returns {*} Item located at the given index.
	 */
	atIndex(idx) {
		let s = this._beginIdx();
		let e = this._endIdx();
		// Check out of bounds
		if (idx < 0 || idx >= e - s) return undefined;

		// Set idx to the filtered internal index
		idx += s;
		if (this._filter) {
			// Find the idx:th item
			for (let c of this._list) {
				if (c.f) {
					if (!idx) {
						return c.m;
					}
					idx--;
				}
			}
		}

		return this._list[idx].m;
	}

	/**
	 * Returns a zero-based index value of an item in the collection.
	 * @param {*} item Collection item.
	 * @returns {number} Zero-based index of the item, or -1 if the item is not found.
	 */
	indexOf(item) {
		let s = this._beginIdx();
		let e = this._endIdx();
		if (e > s) {
			if (this._filter) {
				let i = 0;
				for (let c of this._list) {
					if (c.f) {
						if (c.m === item) {
							return i >= s ? i - s : -1;
						}
						i++;
						if (i >= e) break;
					} else {
						if (c.m === item) {
							return -1;
						}
					}
				}
			} else {
				for (let i = s; i < e; i++) {
					if (this._list[i].m === item) {
						return i - s;
					}
				}
			}
		}
		return -1;
	}

	_fIndexOf(item) {
		let fi = 0;
		for (let i = 0; i < this._list.length; i++) {
			let c = this._list[i];
			if (c.m === item) {
				return {
					cont: c,
					idx: i,
					fidx: fi
				};
			}
			if (c.f) fi++;
		}
		return {
			cont: null,
			idx: -1,
			fidx: -1
		};
	}

	_atFIndex(fidx) {
		if (this._filter) {
			// Find the fidx:th item
			for (let c of this._list) {
				if (c.f) {
					if (!fidx) {
						return c.m;
					}
					fidx--;
				}
			}
		}
		return this._list[fidx].m;
	}

	// Returns the begin index based of the filtered internal list.
	// Optionally with the length to calculate from.
	_beginIdx(l) {
		if (l === undefined) l = this._len;
		let o = this._begin;
		return o < 0 ?
			Math.max(0, l + o) :
			Math.min(l, o);
	}

	// Returns the end index based of the filtered internal list.
	// Optionally with the length to calculate from.
	_endIdx(l) {
		if (l === undefined) l = this._len;
		let o = this._end;
		if (o === null) return l;
		return o < 0 ?
			Math.max(0, l + o) :
			Math.min(l, o);
	}

	_array() {
		let arr = this._filter ?
			this._list.filter(c => c.f) :
			this._list;
		let s = this._beginIdx();
		let e = this._endIdx();
		if (s == 0 && e == this._len) {
			return arr.map(c => c.m);
		}
		return arr.slice(s, e).map(c => c.m);
	}

	_wrapModel(m, item) {
		return this._filter ?
			{
				m: m,
				f: this._filter(item)
			} :
			{
				m: m
			};
	}

	_setEventListeners(on) {
		if (!this._collection.on) {
			return;
		}

		if (on) {
			this._collection.on('add', this._onAdd);
			this._collection.on('remove', this._onRemove);
		} else {
			this._collection.off('add', this._onAdd);
			this._collection.off('remove', this._onRemove);
		}
	}

	_binarySearch(m) {
		return array.binarySearch(this._list, {
			m
		}, (a, b) => this._compare(a.m, b.m));
	}

	_onChange(_, item) {
		let m = this._weakMap ?
			this._weakMap.get(item) :
			item;

		// With a compare function, we could speed this up with
		// a binary search, and fall back on using _fIndexOf.
		// But to simplify, we just use _fIndexOf for now.
		let {
			cont,
			fidx
		} = this._fIndexOf(m);
		if (!cont) {
			return;
		}

		let f = this._filter(item);
		// Quick exit if filter didn't change
		if (f === cont.f) {
			return;
		}

		cont.f = f;
		if (f) {
			this._len++;
			this._trySendAdd(cont.m, fidx);
		} else {
			this._len--;
			this._trySendRemove(cont.m, fidx);
		}
	}

	_trySendAdd(m, i) {
		let l = this._len;
		let cur_s = this._beginIdx(l);
		let pre_s = this._beginIdx(l - 1);
		let cur_e = this._endIdx(l);
		let pre_e = this._endIdx(l - 1);

		// Quick escape
		if (pre_s >= pre_e && cur_s >= cur_e) {
			return;
		}

		if (cur_s > pre_s) {
			if (i >= cur_s) {
				this._sendRemove(this._atFIndex(pre_s), 0);
			}
		} else {
			if (i < cur_s) {
				this._sendAdd(this._atFIndex(cur_s), 0);
			}
		}

		if (i >= cur_s && i < cur_e) {
			this._sendAdd(m, i - cur_s);
		}

		if (cur_e > pre_e) {
			if (i >= cur_e) {
				this._sendAdd(this._atFIndex(cur_e - 1), cur_e - cur_s - 1);
			}
		} else {
			if (i < cur_e) {
				this._sendRemove(this._atFIndex(cur_e), cur_e - cur_s);
			}
		}
	}

	_trySendRemove(m, i) {
		let l = this._len;
		let cur_s = this._beginIdx(l);
		let pre_s = this._beginIdx(l + 1);
		let cur_e = this._endIdx(l);
		let pre_e = this._endIdx(l + 1);

		// Quick escape
		if (pre_s >= pre_e && cur_s >= cur_e) {
			return;
		}

		if (cur_e < pre_e) {
			if (i >= pre_e) {
				this._sendRemove(this._atFIndex(pre_e - 1), pre_e - pre_s - 1);
			}
		} else {
			if (i < pre_e) {
				this._sendAdd(this._atFIndex(pre_e - 1), pre_e - pre_s);
			}
		}

		if (i >= pre_s && i < pre_e) {
			this._sendRemove(m, i - pre_s);
		}

		if (cur_s < pre_s) {
			if (i > cur_s) {
				this._sendAdd(this._atFIndex(cur_s), 0);
			}
		} else {
			if (i < cur_s) {
				this._sendRemove(this._atFIndex(cur_s - 1), 0);
			}
		}
	}

	_sendAdd(item, idx) {
		this._eventBus.emit(this, this._namespace + '.add', {
			item,
			idx
		});
	}

	_sendRemove(item, idx) {
		this._eventBus.emit(this, this._namespace + '.remove', {
			item,
			idx
		});
	}

	_onAdd(e) {
		if (!this._collection) {
			return;
		}

		let m = this._map ?
			this._map(e.item, this._collection) :
			e.item;
		let idx = this._compare ?
			this._binarySearch(m) :
			e.idx;

		if (this._weakMap) {
			this._weakMap.set(e.item, m);
		}

		if (idx < 0) {
			// If idx < 0, the value contains the bitwise compliment of where the
			// item would fit.
			idx = ~idx;
		}

		let cont = this._wrapModel(m, e.item);
		this._list.splice(idx, 0, cont);

		if (this._filter) {
			if (e.item.on) {
				e.item.on('change', this._onChange);
			}

			if (!cont.f) {
				return;
			}
			let r = this._fIndexOf(m);
			idx = r.fidx;
		}

		this._len++;
		this._trySendAdd(m, idx);
	}

	_onRemove(e) {
		if (!this._collection) {
			return;
		}

		let m = this._weakMap && this._compare ?
			this._weakMap.get(e.item) :
			e.item;
		let idx = this._compare ?
			this._binarySearch(m) :
			e.idx;

		let cont = this._list[idx];

		if (this._weakMap) {
			this._weakMap.delete(e.item);
		}

		let fidx = idx;
		if (this._filter) {
			if (e.item.on) {
				e.item.off('change', this._onChange);
			}
			// Quick exit if a filtered item was removed.
			if (!cont.f) {
				return this._list.splice(idx, 1);
			}
			let r = this._fIndexOf(m);
			if (!r.cont) {
				return;
			}
			fidx = r.fidx;
		}

		this._list.splice(idx, 1);
		this._len--;
		this._trySendRemove(m, fidx);
	}

	dispose() {
		if (!this._collection) {
			return;
		}

		this._setEventListeners(false);
		delete this._collection;
		delete this._weakMap;
	}

	[Symbol.iterator]() {
		let i = 0;
		let a;
		let arr = this._list;
		let done = {
			done: true
		};
		let s = this._beginIdx();
		let e = this._endIdx();
		let si = 0;

		if (e <= s) {
			return {
				next: function () {
					return done;
				}
			};
		}

		if (this._filter) {
			return {
				next: function () {
					while (si < e) {
						a = arr[i];
						i++;
						if (a.f) {
							si++;
							if (si > s) {
								return {
									value: a.m,
									done: false
								};
							}
						}
					}

					return done;
				}
			};
		}

		i = s;
		return {
			next: function () {
				return i < e ?
					{
						value: arr[i++].m,
						done: false
					} :
					done;
			}
		};
	}
}

export default CollectionWrapper;