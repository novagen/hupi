import config from '../config';
import path from 'path';
import fs from 'fs';
import Service from '../service';

const service = new Service("Translation", config.nats);

let cache = {};

const readFile = (loc) => {
	let file = path.join(__dirname, 'translations', loc);

	return new Promise((resolve, reject) => {
		if (cache[file]) {
			resolve(cache[file]);
			return;
		}

		if (fs.existsSync(file)){
			fs.readFile(file, 'utf8', function(err, contents) {
				if (err) {
					reject(err);
					return;
				}

				cache[file] = contents;
				resolve(contents);
			});
		} else {
			resolve("{}");
		}
	});
};

const getTranslations = (language, namespace) => {
	const filePath = path.join(language, namespace + ".json");

	return new Promise((resolve, reject) => {
		readFile(filePath).then(r => {
			resolve(r);
		}).catch(e => {
			reject(e);
		});
	});
};

const saveTranslations = (_language, _namespace, _data) => {
	return new Promise((resolve, _reject) => {
		resolve(true);
	});
};

const createTranslations = (languages, namespace, key, fallbackValue) => {
	return new Promise((resolve, reject) => {
		let files = [];

		for (let lang in languages) {
			let file = path.join(__dirname, "translations", "missing", languages[lang], namespace + ".json");

			if (!fs.existsSync(path.join(__dirname, "translations", "missing"))){
				fs.mkdirSync(path.join(__dirname, "translations", "missing"));
			}

			if (!fs.existsSync(path.join(__dirname, "translations", "missing", languages[lang]))){
				fs.mkdirSync(path.join(__dirname, "translations", "missing", languages[lang]));
			}

			files.push({ file });
		}

		for (let i in files) {
			let file = files[i];

			if (fs.existsSync(file.file)){
				try {
					file.data = JSON.parse(fs.readFileSync(file.file, "utf8"));
				} catch(e) {
					reject(e);
					return;
				}
			}

			if (!file.data) {
				file.data = JSON.parse("{}");
			}

			if (!file.data[key]) {
				file.data[key] = fallbackValue;

				try {
					fs.writeFileSync(file.file, JSON.stringify(file.data));
				} catch (e) {
					reject(e);
					return;
				}
			}
		}

		resolve(true);
	});
};

service.subscribe('call.system.translation.*.load', function(msg, reply, subj) {
	const lang = subj.substring(24, subj.length - 5);
	let { params } = JSON.parse(msg);

	getTranslations(lang, params.namespace).then(model => {
		service.publish(reply, { result: model });
	}).catch(e => {
		service.publish(reply, Service.internalError(JSON.stringify(e)));
	});
});

service.subscribe('call.system.translation.*.save', function(msg, reply, subj) {
	const lang = subj.substring(24, subj.length - 5);
	let { params } = JSON.parse(msg);

	saveTranslations(lang, params.namespace, params.data).then(model => {
		console.log('saved', model);
		service.publish(reply, { result: model });
	}).catch(e => {
		service.publish(reply, Service.internalError(JSON.stringify(e)));
	});
});

service.subscribe('call.system.translation.*.create', function(msg, reply) {
	let { params } = JSON.parse(msg);

	createTranslations(params.languages, params.namespace, params.key, params.fallbackValue).then(model => {
		console.log('created', model);
		service.publish(reply, { result: model });
	}).catch(e => {
		service.publish(reply, Service.internalError(JSON.stringify(e)));
	});
});

service.publish('system.reset', { resources: [ 'system.translation.>' ] });