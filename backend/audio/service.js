import config from '../config';
import diff from 'object-diff';
import RotaryReader from './RotaryReader';
import Service from '../service';

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
		Object.assign(volumeModel, changed);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	}
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
			nats.publish(reply, Service.notFound);
		}
	}).catch(e => {
		nats.publish(reply, Service.internalError(JSON.stringify(e)));
	});
});

nats.subscribe('call.audio.volume.set', (req, reply) => {
	const params = JSON.parse(req);
	const changed = diff(volumeModel, params.params);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		nats.publish(reply, Service.success);

		nats.publish("event.audio.volume.change", JSON.stringify({
			values: changed
		}));
	} else {
		nats.publish(reply, Service.success);
	}
});

nats.subscribe('get.audio.volume', function (_, reply) {
	if (volumeModel) {
		nats.publish(reply, JSON.stringify({
			result: {
				model: volumeModel
			}
		}));
	} else {
		nats.publish(reply, Service.notFound);
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

new RotaryReader({
	onRotation: (dir) => { changeVolume(dir); },
	onClick: () => { toggleMute(); },
	// eslint-disable-next-line no-console
	onError: (err) => { console.error(err); }
}).start();