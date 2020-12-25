import { setAudioTrack, setVideoTrack } from './playback.js';
import { sendSdp, sendIce } from './signaling.js';

const polite = true;
let pc = null;
let ignoreOffer = false;
let isSettingRemoteAnswerPending = false;
let makingOffer = false;

function create() {
	pc = new RTCPeerConnection({
		iceServers: [{
			urls: ['turns:turn.keijo.ee:3478'],
			username: 'immutable_bricks',
			credential: 'BEtwbSeUbApfjqj9'
		}]
	});

	pc.addEventListener('connectionstatechange', () => {
		console.log(`Peer connection state: ${pc.connectionState}`);

		if (pc.connectionState === 'failed') {
			pc.close();
		}

		if (pc.connectionState === 'disconnected') {
			setVideoTrack(null);
			setAudioTrack(null);
			ignoreOffer = false;
			isSettingRemoteAnswerPending = false;
			makingOffer = false;

			pc = create();
		}
	});

	pc.addEventListener('signalingstatechange', () => {
		console.log(`Signaling state: ${pc.signalingState}`);
	});

	pc.addEventListener('iceconnectionstatechange', () => {
		console.log(`ICE connection state: ${pc.iceConnectionState}`);
	});

	pc.addEventListener('icegatheringstatechange', () => {
		console.log(`ICE gathering state: ${pc.iceGatheringState}`);
	});

	pc.addEventListener('track', ({ track }) => {
		console.log(`Got ${track.kind} track`);

		track.addEventListener('ended', () => {
			console.log(`Lost ${track.kind} track`);
		});

		if (track.kind === 'video') {
			setVideoTrack(track);
		}

		if (track.kind === 'audio') {
			setAudioTrack(track);
		}
	});

	pc.addEventListener('icecandidate', ({ candidate }) => {
		if (candidate) {
			const {
				component, address, port, priority, relatedAddress, relatedPort, type, protocol
			} = candidate;
			console.log('ICE candidate: (%s %s) %s %s %s:%s %s:%s', component, priority, type, protocol, address, port, relatedAddress, relatedPort);
			sendIce(candidate);
		}
	});

	pc.addEventListener('negotiationneeded', () => {
		makingOffer = true;
		pc.setLocalDescription().then(
			() => { sendSdp(pc.localDescription); makingOffer = false; },
			e => { console.error(e); pc.close(); makingOffer = false; }
		);
	});
}

create();

export function handshake() {
	pc.setLocalDescription().then(
		() => { sendSdp(pc.localDescription); },
		e => { console.error(e); pc.close(); }
	);
}

export function handleSdp(description) {
	const readyForOffer = !makingOffer && (pc.signalingState === 'stable' || isSettingRemoteAnswerPending);

	ignoreOffer = !polite && description.type === 'offer' && !readyForOffer;
	if (ignoreOffer) {
		return;
	}

	isSettingRemoteAnswerPending = description.type === 'answer';

	pc.setRemoteDescription(description)
		.then(() => {
			isSettingRemoteAnswerPending = false;
			if (description.type === 'offer') {
				pc.setLocalDescription()
					.then(() => {
						sendSdp(pc.localDescription);
					});
			}
		});
}

export function handleIce(ice) {
	if (ignoreOffer) {
		console.warn('Ignoring ICE candidate');
	} else {
		console.log('Adding ICE candidate');
		pc.addIceCandidate(ice).catch(console.error);
	}
}

window.handleSdp = handleSdp;
window.handleIce = handleIce;

function addVideoTransceiver(track, options) {
	console.log('Adding video track');
	return pc.addTransceiver(track || 'video', options);
}

function addAudioTransceiver(track, options) {
	console.log('Adding audio track');
	return pc.addTransceiver(track || 'audio', options);
}

function createDataChannel(label, options) {
	console.log('Creating data channel: %s', label);
	const channel = pc.createDataChannel(label, options);
	channel.addEventListener('open', () => {
		console.log('Data channel %s is open', channel.label);
	});
	channel.addEventListener('closing', () => {
		console.log('Data channel %s is closing', channel.label);
	});
	channel.addEventListener('close', () => {
		console.log('Data channel %s is closed', channel.label);
	});
	return channel;
}
