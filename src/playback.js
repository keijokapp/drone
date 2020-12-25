const stream = new MediaStream();
let videoElement = null;

export function setVideoElement(element) {
	if (element !== videoElement) {
		if (videoElement) {
			videoElement.srcObject = null;
		}
		videoElement = element;
		videoElement.srcObject = stream;
	}
}

export function setVideoTrack(track) {
	stream.getVideoTracks().forEach(track => {
		stream.removeTrack(track);
	});

	if (track) {
		stream.addTrack(track);
	}
}

export function setAudioTrack(track) {
	stream.getAudioTracks().forEach(track => {
		stream.removeTrack(track);
	});

	if (track) {
		stream.addTrack(track);
	}
}
