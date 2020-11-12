import loudness from 'loudness';

const events = require('events');
const util = require('util');

util.inherits(VolumeContol, events.EventEmitter);

class VolumeContol {
    constructor(opt) {
        this.opt = Object.assign({
			onSet: () => {}
        }, opt);

        events.EventEmitter.call(this);
    }

    volume() {
        return new Promise((resolve, _) => {
            loudness.getVolume().then(r => {
                resolve(r);
            }).catch(e => {
                // log error and resolve with dummy (probably no ALSA mixer available)
                this.emit('error', e);
                resolve(0);
            });
        });
    }

    muted() {
        return new Promise((resolve, _) => {
            loudness.getMuted().then(r => {
                resolve(r);
            }).catch(e => {
                this.emit('error', e);
                resolve(false);
            });
        });
    }

    _setVolume(val) {
        return new Promise((resolve, _) => {
            loudness.setVolume(val).then(_ => {
                resolve();
            }).catch(e => {
                // log error and resolve with dummy (probably no ALSA mixer available)
                this.emit('error', e);
                resolve();
            });
        });
    }

    _setMuted(val) {
        return new Promise((resolve, _) => {
            loudness.setMuted(val).then(_ => {
                resolve();
            }).catch(e => {
                this.emit('error', e);
                resolve();
            });
        });
    }

    set(changed) {
        let promises = [];

        if (changed.volume) {
            promises.push(this._setVolume(changed.volume));
        }

        if (changed.mute) {
            promises.push(this._setMuted(changed.mute));
        }

        Promise.all(promises).then(_ => {
            this.opt.onSet(changed);
        }).catch(e => {
            this.emit('error', e);
        });
    }
}

export default VolumeContol;