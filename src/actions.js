import { dispatch } from './store.js';

export const peerConnectionStateChanged = state => dispatch({
	type: 'PEER_CONNECTION_STATE_CHANGED',
	state
});

export const signalingStateChanged = state => dispatch({
	type: 'SIGNALING_STATE_CHANGED',
	state
});

export const iceConnectionStateChanged = state => dispatch({
	type: 'ICE_CONNECTION_STATE_CHANGED',
	state
});

export const iceGatheringStateChanged = state => dispatch({
	type: 'ICE_GATHERING_STATE_CHANGED',
	state
});

export const gotTrack = trackType => dispatch({
	type: 'GOT_TRACK',
	trackType
});

export const lostTrack = trackType => dispatch({
	type: 'LOST_TRACK',
	trackType
});
