import loudness from 'loudness';

class VolumeContol {
    constructor(opt) {
        this.opt = Object.assign({
			onSet: () => {}
        }, opt);
    }

    volume() {
        return new Promise((resolve, _) => {
            loudness.getVolume().then(r => {
                resolve(r);
            }).catch(e => {
                // log error and resolve with dummy (probably no ALSA mixer available)
                console.error(e);
                resolve(0);
            });
        });
    }

    muted() {
        return new Promise((resolve, _) => {
            loudness.getMuted().then(r => {
                resolve(r);
            }).catch(e => {
                console.error(e);
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
                console.error(e);
                resolve();
            });
        });
    }

    _setMuted(val) {
        return new Promise((resolve, _) => {
            loudness.setMuted(val).then(_ => {
                resolve();
            }).catch(e => {
                console.error(e);
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
            console.error(e);
        });
    }
}

export default VolumeContol;