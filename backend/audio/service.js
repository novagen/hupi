import config from '../config';
import { Logger } from 'wace-admin-support';
import { Service, Constants } from 'wace-admin-service';
import utf8 from 'utf8';

const nats = new Service("Audio", Service.getNatsConfig(config)).connect();
const portAudio = require('naudiodon');

const getAudioModel = id => {
	return new Promise((resolve, reject) => {
		try {
			let model = getAudioDevices().find(i => i.id == id);
			resolve(model);
		} catch(e) {
			reject(e);
		}
	});
};

const sendListReply = (res, reply) => {
	var result = [];

	for (const m of res) {
		result.push({ rid: "audio.device." + m.id });
	}

	nats.publish(reply, JSON.stringify({ result: { collection: result }}));
};

const getAudioDevices = () => {
	const devices = portAudio.getDevices().filter(i => i.maxOutputChannels > 0);
	return devices;
};

nats.subscribe('get.audio.device.*', function (_, reply, subj) {
	let id = subj.substring(17);

	getAudioModel(id).then(model => {
		if (model) {
			nats.publish(reply, JSON.stringify({ result: { model } }));
		} else {
			nats.publish(reply, Constants.notFound);
		}
	}).catch(e => {
		Logger.Error(e);
		nats.publish(reply, Constants.internalError(JSON.stringify(e)));
	});
});

nats.subscribe('get.audio.devices', function(_, reply) {
	try {
		const devices = getAudioDevices();
		sendListReply(devices, reply);
	} catch(err) {
		Logger.Error(err);
		nats.publish(reply, Constants.internalError(JSON.stringify(err)));
		return;
	}
});

nats.publish('system.reset', JSON.stringify({ resources: [ 'audio.>' ] }));