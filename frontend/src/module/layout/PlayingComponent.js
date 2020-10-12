import { Elem, Transition } from 'modapp-base-component';
import { ModuleComponent, ModelQuickTxt } from 'component';

import './PlayingComponent.scss';

class PlayingComponent extends ModuleComponent {
	constructor(app, module, params) {
		super('module.layout.volume', module);

		this.app = app;
		this.module = module;
		this.params = params;

		this._renderPlaying = this._renderPlaying.bind(this);
		this._load = this._load.bind(this);
	}

	_load() {
		this.module.client.get("media.playing").then(m => {
			this.model = m;
			this._renderPlaying();
		}).catch(() => {});
    }

	_renderPlaying() {
		let node = this.node.getNode('playing');
		let component = new Elem(n => n.elem('div', {  className: 'playing' }, [
            n.elem('div', { className: 'image' }, [
                n.component(new ModelQuickTxt(this.model, (m, e) => {
                    try {
                        e.setAttribute('src', `data:image/png;base64, ${m.image}`);
                    } catch (e) {
                        console.error(e);
                    }

                    return '';
                }, {
                    tagName: 'img',
                    className: 'cover'
                })),
                n.component(new ModelQuickTxt(this.model, (m, e) => {
                    e.setClassName(`provider fab fa-${m.provider}`);
                    return '';
                }, { tagName: 'span', className: '' }))
            ]),
            n.elem('div', { className: 'info' }, [
                n.component(new ModelQuickTxt(this.model, (m) => m.artist, { tagName: 'span', className: 'artist' })),
                n.component(new ModelQuickTxt(this.model, (m) => m.track, { tagName: 'span', className: 'track' })),
                n.component(new ModelQuickTxt(this.model, (m) => m.album, { tagName: 'span', className: 'album' }))
            ]),
            n.elem('div', { className: 'controls' }, [
                n.elem('span', { className: 'button large backward',
                events: {
                    click: () => {
                        this.module.client.call('media.playing', 'prev', { }).then(_ => {
                        }).catch(e => {
                            console.error(e);
                        });
                    }
                } }, [
                    n.elem('span', {
                        tagName: 'span',
                        className: 'fas fw fa-step-backward'
                    })
                ]),
                n.elem('span', {
                    className: 'button large play',
                    events: {
                        click: () => {
                            this.module.client.call('media.playing', 'toggle', { }).then(_ => {
                            }).catch(e => {
                                console.error(e);
                            });
                        }
                    }
                }, [
                    n.component(new ModelQuickTxt(this.model, (m, e) => {
                        if (m.playing) {
                            e.removeClass('fa-play');
                            e.addClass('fa-pause');
                        } else {
                            e.removeClass('fa-pause');
                            e.addClass('fa-play');
                        }

                        return '';
                    }, {
                        tagName: 'span',
                        className: 'fas fw'
                    }))
                ]),
                n.elem('span', { className: 'button large forward',
                events: {
                    click: () => {
                        this.module.client.call('media.playing', 'next', { }).then(_ => {
                        }).catch(e => {
                            console.error(e);
                        });
                    }
                } }, [
                    n.elem('span', {
                        tagName: 'span',
                        className: 'fas fw fa-step-forward'
                    })
                ])
            ])
        ]));

        if (node && component) {
			node.fade(component);
		}
    }

	render(el) {
		this.node = new Elem(n => n.elem("div", {
			className: 'grid-x'
		}, [
			n.elem('div', {
				className: 'cell'
			}, [
				n.component('playing', new Transition())
			])
		]));

		this.node.render(el);
		this._load();
	}

	unrender() {
		this.node.unrender();
		this.node = null;
	}
}

export default PlayingComponent;