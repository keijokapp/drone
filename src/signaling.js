import { handshake, handleSdp, handleIce } from './peer-connection.js';

const websocketEndpoint = 'ws://localhost:3000';

let client = null;

function handleMessage(message) {
	if ('sdp' in message) {
		handleSdp(message.sdp);
	}

	if ('ice' in message) {
		handleIce(message.ice);
	}
}

function create() {
	let closeTimeout = null;
	const ws = new WebSocket(websocketEndpoint);

	const initTimeout = setTimeout(() => {
		console.error('Server connection initialization timeout');
		ws.close();
	}, 8000);

	ws.onopen = () => {
		console.log('Server connection open');
		clearTimeout(initTimeout);
		client = ws;
		handshake();
	};

	ws.onclose = function () {
		console.error('Server connection closed');
		client = null;
		clearTimeout(initTimeout);
		clearTimeout(closeTimeout);
		setTimeout(create, 2000);
	};

	ws.onmessage = ({ data }) => {
		clearTimeout(closeTimeout);
		closeTimeout = setTimeout(() => {
			console.error('Didn\'t receive ping');
			ws.close();
		}, 32000);

		if (data === 'ping') {
			ws.send('pong');
			return;
		}

		handleMessage(JSON.parse(data));
	};
}

create();

export function sendSdp(sdp) {
	if (!client) {
		console.warn('Server connection is not active');
		return;
	}

	client.send(JSON.stringify({ sdp }));
}

export function sendIce(ice) {
	if (!client) {
		console.warn('Server connection is not active');
		return;
	}

	client.send(JSON.stringify({ ice }));
}
