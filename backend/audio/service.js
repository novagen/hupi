import config from '../config';
import diff from 'object-diff';
import RotaryReader from './RotaryReader';
import Service from '../service';
import VolumeControl from './VolumeControl';

const portAudio = require('naudiodon');
const stepSize = 1;

const service = new Service("Audio", config.nats);

const volume = new VolumeControl({
	onSet: (changed) => {
		Object.assign(volumeModel, changed);

		service.publish("event.audio.volume.change", {
			values: changed
		});
	}
});

volume.on('error', e => {
	service.e(e);
});

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

	service.publish(reply, {
		result: {
			collection: result
		}
	});
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
		volume.set(changed);
	}
};

const setAudioValues = (val) => {
	const changed = diff(volumeModel, val);

	if (changed && Object.keys(changed).length) {
		Object.assign(volumeModel, changed);

		service.publish("event.audio.volume.change", {
			values: changed
		});
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

	let data = {
		volume : new_volume
	};

	const changed = diff(volumeModel, data);

	if (changed && Object.keys(changed).length) {
		volume.set(changed);
	}
};

const init = () => {
	let promises = [];

	promises.push(volume.volume());
	promises.push(volume.muted());

	Promise.all(promises).then(r => {
		let val = {
			volume: r[0],
			mute: r[1]
		};

		setAudioValues(val);
	}).catch(e => {
		service.e(e);
	});
};

const read = () => {
	const reader = new RotaryReader({
		onRotation: (dir) => {
			changeVolume(dir);
		},
		onClick: () => {
			toggleMute();
		}
	});

	reader.on('error', e => {
		service.e(e);
	});

	reader.start();
};

service.subscribe('get.audio.device.*', function (_, reply, subj) {
	let id = subj.substring(17);

	getAudioModel(id).then(model => {
		if (model) {
			service.publish(reply, {
				result: {
					model
				}
			});
		} else {
			service.publish(reply, Service.notFound());
		}
	}).catch(e => {
		service.publish(reply, Service.internalError(JSON.stringify(e)));
	});
});

service.subscribe('call.audio.volume.set', (req, reply) => {
	const params = JSON.parse(req).params;

	volume.set(params);
	service.publish(reply, Service.success());
});

service.subscribe('get.audio.volume', function (_, reply) {
	if (volumeModel) {
		service.publish(reply, {
			result: {
				model: volumeModel
			}
		});
	} else {
		service.publish(reply, Service.notFound());
	}
});

service.subscribe('get.audio.devices', function (_, reply) {
	try {
		const devices = getAudioDevices();
		sendListReply(devices, reply);
	} catch (err) {
		service.publish(reply, Service.internalError(JSON.stringify(err)));

		return;
	}
});

service.publish('system.reset', { resources: ['audio.>'] });

init();
read();