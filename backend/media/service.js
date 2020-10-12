import config from '../config';
import Service from '../service';
import diff from 'object-diff';

const service = new Service("Media", config.nats);

const playingModel = {
	image: '',
	track: '',
	artist: '',
	album: '',
	provider: '',
	playing: false
};

const dummyData = [
	{
		image: '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',
		track: 'Tomorrow Never Comes',
		artist: 'VNV Nation',
		album: 'Of Faith, Power and Glory',
		provider: 'spotify'
	},
	{
		image: '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',
		track: 'God of all',
		artist: 'VNV Nation',
		album: 'Noire',
		provider: 'google-play'
	}
];

const updatePlaying = (data) => {
	const changed = diff(playingModel, data);

	if (changed && Object.keys(changed).length) {
		Object.assign(playingModel, changed);

		service.publish("event.media.playing.change", {
			values: changed
		});
	}
};

service.subscribe('get.media.playing', function (_, reply) {
	if (playingModel) {
		service.publish(reply, {
			result: {
				model: playingModel
			}
		});
	} else {
		service.publish(reply, Service.notFound());
	}
});

service.subscribe('call.media.playing.toggle', function (_, reply) {
	if (playingModel) {
		service.publish(reply, Service.success());
		updatePlaying({ playing: !playingModel.playing });
	} else {
		service.publish(reply, Service.notFound());
	}
});

service.subscribe('call.media.playing.next', function (_, reply) {
	let index = dummyData.map(e => e.track).indexOf(playingModel.track);

	if (index >= dummyData.length - 1) {
		index = 0;
	} else {
		index++;
	}

	service.publish(reply, Service.success());
	updatePlaying(dummyData[index]);
});

service.subscribe('call.media.playing.prev', function (_, reply) {
	let index = dummyData.map(e => e.track).indexOf(playingModel.track);

	if (index <= 0) {
		index = dummyData.length - 1;
	} else {
		index--;
	}

	service.publish(reply, Service.success());
	updatePlaying(dummyData[index]);
});

service.publish('system.reset', { resources: ['media.>'] });

updatePlaying(dummyData[0]);