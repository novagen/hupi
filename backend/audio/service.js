import config from '../config';
import diff from 'object-diff';
import RotaryReader from './RotaryReader';
import Service from '../service';
import loudness from 'loudness';

const nats = new Service("Audio", config.nats).connect();
const portAudio = require('naudiodon');
const stepSize = 1;

const volumeModel = {
	volume: 50,
	mute: false
};

const getAudioModel = id => {
	return new Promise((resolve, reject) => {
		try {
			let model = getAudioDevices().find(i => i.id == id);
			resolve(model);
		} catch (e) {
			reject(e);
		}
	});
};

const sendListReply = (res, reply) => {
	var result = [];

	for (const m of res) {
		result.push({
			rid: "audio.device." + m.id
		});
	}

	nats.publish(reply, JSON.stringify({
		result: {
			collection: result
		}
	}));
};

const getAudioDevices = () => {
	const devices = portAudio.getDevices().filter(i => i.maxOutputChannels > 0);
	return devices;
};

const toggleMute = () => {
	let muted = {
		mute : !volumeModel.mute
	};

	const changed = diff(volumeModel, muted);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	}
};

const setAudioValues = (val) => {
	console.log('setAudioValues', val);
	const changed = diff(volumeModel, val);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	}
};

const getVolume = () => {
	return new Promise((resolve, _) => {
		loudness.getVolume().then(r => {
			resolve(r);
		}).catch(e => {
			console.log(e);
			resolve(0);
		});
	});
};

const getMuted = () => {
	return new Promise((resolve, _) => {
		loudness.getMuted().then(r => {
			resolve(r);
		}).catch(e => {
			console.log(e);
			resolve(false);
		});
	});
};

const setVolume = (val) => {
	return new Promise((resolve, _) => {
		loudness.setVolume(val).then(_ => {
			resolve();
		}).catch(e => {
			console.log(e);
			resolve();
		});
	});
};

const setMuted = (val) => {
	return new Promise((resolve, _) => {
		loudness.setMuted(val).then(_ => {
			resolve();
		}).catch(e => {
			console.log(e);
			resolve();
		});
	});
};

const changeVolume = (dir) => {
	if (volumeModel.mute) {
		return;
	}

	let new_volume = volumeModel.volume;

	if (dir === 'up') {
		new_volume += stepSize;
	} else if (dir === 'down') {
		new_volume -= stepSize;
	} else {
		return;
	}

	if (new_volume > 100) {
		new_volume = 100;
	}

	if (new_volume < 0) {
		new_volume = 0;
	}

	let volume = {
		volume : new_volume
	};

	const changed = diff(volumeModel, volume);

	if (changed && Object.keys(changed).length) {
		updateVolumeModel(changed);
	}
};

const updateVolumeModel = (changed) => {
	let promises = [];

	if (changed.volume) {
		promises.push(setVolume(changed.volume));
	}

	if (changed.mute) {
		promises.push(setMuted(changed.mute));
	}

	Promise.all(promises).then(_ => {
		Object.assign(volumeModel, changed);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	}).catch(e => {
		console.error(e);
	});
};

const init = () => {
	let promises = [];

	promises.push(getVolume());
	promises.push(getMuted());

	Promise.all(promises).then(r => {
		let val = {
			volume: r[0],
			mute: r[1]
		};

		setAudioValues(val);
	}).catch(e => {
		console.error(e);
	});
};

const read = () => {
	new RotaryReader({
		onRotation: (dir) => { changeVolume(dir); },
		onClick: () => { toggleMute(); },
		onError: (err) => { console.error(err); }
	}).start();
};

nats.subscribe('get.audio.device.*', function (_, reply, subj) {
	let id = subj.substring(17);

	getAudioModel(id).then(model => {
		if (model) {
			nats.publish(reply, JSON.stringify({
				result: {
					model
				}
			}));
		} else {
			nats.publish(reply, Service.notFound());
		}
	}).catch(e => {
		nats.publish(reply, Service.internalError(JSON.stringify(e)));
	});
});

nats.subscribe('call.audio.volume.set', (req, reply) => {
	const params = JSON.parse(req);
	const changed = diff(volumeModel, params.params);

	if (changed && Object.keys(changed).length) {
		updateVolumeModel(changed);
	}

	nats.publish(reply, Service.success());
});

nats.subscribe('get.audio.volume', function (_, reply) {
	if (volumeModel) {
		nats.publish(reply, JSON.stringify({
			result: {
				model: volumeModel
			}
		}));
	} else {
		nats.publish(reply, Service.notFound());
	}
});

nats.subscribe('get.audio.devices', function (_, reply) {
	try {
		const devices = getAudioDevices();
		sendListReply(devices, reply);
	} catch (err) {
		nats.publish(reply, Service.internalError(JSON.stringify(err)));

		return;
	}
});

nats.publish('system.reset', JSON.stringify({ resources: ['audio.>'] }));

init();
read();