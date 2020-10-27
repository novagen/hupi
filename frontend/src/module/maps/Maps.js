import { Loader } from 'google-maps';

class Maps {
	constructor(app, params) {
		this.app = app;
		this.params = params;

        this._initialized = this._initialized.bind(this);
        this.getGoogle = this.getGoogle.bind(this);

		this.app.require([ ], this._init.bind(this));

        this.ready = false;
		this.waiting = [];
	}

	_init(module) {
		this.module = module;

		new Loader(this.params.apiKey, { libraries: [ 'places', 'geocoder' ]}).load().then(r => {
            this.ready = true;
            this.google = r;

            this._initialized();
        });
    }
    
	_initialized() {
		for(let i in this.waiting) {
			this.waiting[i].resolver(this.google);
		}
    }
    
    getDefaultOptions() {
        return this.params.mapOptions;
    }

    getGoogle() {
        if (!this.ready) {
			let resolver;
			let rejecter;

			let promise = new Promise((resolve, reject) => {
				resolver = resolve;
				rejecter = reject;
			});

			this.waiting.push({ promise, resolver, rejecter });
			return promise;
		}

		return new Promise((resolve, _) =>  {
			resolve(this.google);
		});
	}

	createLocation(props, base64 = true) {
		const { color, height, width } = props;

		const raw_svg = `<svg xmlns="http://www.w3.org/2000/svg" height="${height}" viewBox="0 0 ${width} ${height}" width="${width}"><path d="M0 0h24v24H0z" fill="none" />
			<path stroke="{${color}}" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
		</svg>`;

		if (base64) {
			return 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(raw_svg);
		} else {
			return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(raw_svg);
		}
	}
	
	createMarker(props, base64 = true) {
		const { start_color, end_color, height, width } = props;

		const raw_svg = `<svg
			xmlns:dc="http://purl.org/dc/elements/1.1/"
			xmlns:cc="http://creativecommons.org/ns#"
			xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
			xmlns:svg="http://www.w3.org/2000/svg"
			xmlns="http://www.w3.org/2000/svg"
			width="${width}"
			height="${height}"
			viewBox="0 0 6.3792931 8.4666665"
			version="1.1"
			id="svg943">
		<defs
			id="defs937">
			<clipPath
				clipPathUnits="userSpaceOnUse"
				id="clipPath850">
			<path
				d="m 31.732,658.278 c -1.641,-1.48 -2.217,-3.808 -1.45,-5.881 v 0 L 97.141,471.389 c 0.782,-2.123 2.813,-3.532 5.069,-3.533 v 0 c 0.463,0.002 0.915,0.06 1.348,0.173 v 0 l 0.1,0.027 c 1.646,0.457 3.013,1.679 3.622,3.335 v 0 l 66.861,181.004 c 0.763,2.068 0.191,4.402 -1.448,5.881 v 0 c -1.64,1.482 -4.016,1.815 -6,0.847 v 0 l -51.126,-25.057 c -8.43,-4.13 -18.299,-4.13 -26.729,0 v 0 l -51.11,25.055 c -0.757,0.372 -1.57,0.554 -2.378,0.554 v 0 c -1.311,0 -2.606,-0.479 -3.618,-1.397"
				id="path848" />
			</clipPath>
			<linearGradient
				x1="0"
				y1="0"
				x2="1"
				y2="0"
				gradientUnits="userSpaceOnUse"
				gradientTransform="matrix(131.57359,-131.57359,-131.57359,-131.57359,36.424213,662.9801)"
				spreadMethod="pad"
				id="linearGradient862">
			<stop
				style="stop-color:${start_color};stop-opacity:1"
				offset="0"
				id="stop856" />
			<stop
				style="stop-color:${end_color};stop-opacity:1"
				offset="1"
				id="stop860" />
			</linearGradient>
			<clipPath
				clipPathUnits="userSpaceOnUse"
				id="clipPath850-6">
			<path
				d="m 31.732,658.278 c -1.641,-1.48 -2.217,-3.808 -1.45,-5.881 v 0 L 97.141,471.389 c 0.782,-2.123 2.813,-3.532 5.069,-3.533 v 0 c 0.463,0.002 0.915,0.06 1.348,0.173 v 0 l 0.1,0.027 c 1.646,0.457 3.013,1.679 3.622,3.335 v 0 l 66.861,181.004 c 0.763,2.068 0.191,4.402 -1.448,5.881 v 0 c -1.64,1.482 -4.016,1.815 -6,0.847 v 0 l -51.126,-25.057 c -8.43,-4.13 -18.299,-4.13 -26.729,0 v 0 l -51.11,25.055 c -0.757,0.372 -1.57,0.554 -2.378,0.554 v 0 c -1.311,0 -2.606,-0.479 -3.618,-1.397"
				id="path848-0" />
			</clipPath>
		</defs>
		<metadata
			id="metadata940">
			<rdf:RDF>
			<cc:Work
				rdf:about="">
				<dc:format>image/svg+xml</dc:format>
				<dc:type
					rdf:resource="http://purl.org/dc/dcmitype/StillImage" />
				<dc:title></dc:title>
			</cc:Work>
			</rdf:RDF>
		</metadata>
		<g
			style="opacity:1"
			id="layer1"
			transform="matrix(0.12511795,0,0,0.12511795,-10.524919,-14.955887)">
			<g
				style=""
				transform="matrix(0.35277777,0,0,-0.35277777,73.555452,352.25298)"
				id="g844">
			<g
				style=""
				id="g846"
				clip-path="url(#clipPath850)">
				<g
					style=""
					id="g852">
				<g
					style=""
					id="g854">
					<path
						d="m 31.732,658.278 c -1.641,-1.48 -2.217,-3.808 -1.45,-5.881 v 0 L 97.141,471.389 c 0.782,-2.123 2.813,-3.532 5.069,-3.533 v 0 c 0.463,0.002 0.915,0.06 1.348,0.173 v 0 l 0.1,0.027 c 1.646,0.457 3.013,1.679 3.622,3.335 v 0 l 66.861,181.004 c 0.763,2.068 0.191,4.402 -1.448,5.881 v 0 c -1.64,1.482 -4.016,1.815 -6,0.847 v 0 l -51.126,-25.057 c -8.43,-4.13 -18.299,-4.13 -26.729,0 v 0 l -51.11,25.055 c -0.757,0.372 -1.57,0.554 -2.378,0.554 v 0 c -1.311,0 -2.606,-0.479 -3.618,-1.397"
						style="fill:url(#linearGradient862);stroke:black;stroke-width:3px;"
						id="path864" />
				</g>
				</g>
			</g>
			</g>
		</g>
		</svg>`;

		if (base64) {
			return 'data:image/svg+xml;charset=UTF-8;base64,' + btoa(raw_svg);
		} else {
			return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(raw_svg);
		}
	}
}

export default Maps;