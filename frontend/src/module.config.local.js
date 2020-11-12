const config = {
	client: {
		url: 'http://10.0.0.106:8080/'
	},
	layout: {
		enableNotifications: false,
		volume: {
			step: 5
		}
	},
	dash: {
		showMap: false,
		trackLocation: true
	},
	maps: {
		apiKey: 'AIzaSyBZcrjEI6boRyU75PhOUYRNLWxv581T8WQ',
		mapOptions: {
			zoom: 7,
			disableDefaultUI: false,
			zoomControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            clickableIcons: false,
            styles: [
				{
					featureType: "poi",
					elementType: "labels",
					stylers: [{ visibility: "off" }]
				}
			],
            gestureHandling: "greedy",
            mapTypeId: "roadmap",
            tilt: 0
        }
	}
};

export default config;
