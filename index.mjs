import path from 'path';
import url from 'url';
import http from 'http';
import express from 'express';
import WebSocket from 'ws';

const config = {
	listen: {}
};

let port;

for (let i = 2; i < process.argv.length; i++) {
	switch (process.argv[i]) {
	case '-h':
	case '--help':
		console.log('Usage: %s {--systemd|[--address] [--port]} [--token authorization-token]*');
		process.exit(0);
		break;
	case '--systemd':
		if ('address' in config.listen || 'port' in config.listen) {
			console.error('Configuration error: \'--systemd\' cannot coexist with \'--address\' or \'--port\'');
			process.exit(1);
		}
		config.listen = 'systemd';
		break;
	case '--address':
		if (config.listen === '--systemd') {
			console.error('Configuration error: option \'--address\' cannot coexist with \'--systemd\'');
			process.exit(1);
		}

		if ('address' in config.listen) {
			console.error('Configuration error: unexpected duplicate option \'--address\'');
			process.exit(1);
		}

		if (i === process.argv.length) {
			console.error('Configuration error: option \'--address\' expects value');
			process.exit(1);
		}

		config.listen.address = process.argv[++i];
		break;
	case '--port':
		if (config.listen === '--systemd') {
			console.error('Configuration error: option \'--port\' cannot coexist with \'--systemd\'');
			process.exit(1);
		}

		if ('port' in config.listen) {
			console.error('Configuration error: unexpected duplicate option \'--port\'');
			process.exit(1);
		}

		port = Number(process.argv[++i]);
		if (!Number.isInteger(port) || port < 0 || port > 65535) {
			console.error('Configuration error: option \'--\' expects integer value between 0 and 65535 (both inclusive)');
			process.exit(1);
		}

		config.listen.port = port;
		break;

	default:
		console.error('Configuration error: unknown option \'%s\'', process.argv[i]);
		process.exit(1);
	}
}

const WebSocketServer = WebSocket.Server;

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
	// eslint-disable-next-line no-console
	console.log('New connection');

	ws.isAlive = true;

	ws.on('close', () => {
		console.log('Connection closed');
	});

	ws.on('message', message => {
		if (message === 'pong') {
			ws.isAlive = true;
			return;
		}

		console.log('Broadcasting message', message);
		wss.clients.forEach(client => {
			if (client.readyState === WebSocket.OPEN && client !== ws) {
				client.send(message);
			}
		});
	});
});

const pingInterval = setInterval(() => {
	wss.clients.forEach(ws => {
		if (!ws.isAlive) {
			console.log('Didn\'t receive pong');
			ws.terminate();
			return;
		}

		ws.isAlive = false;
		ws.send('ping');
	});
}, 16000);

wss.on('close', () => { clearInterval(pingInterval); });

wss.on('listening', () => {
	console.log('WS Listening', wss.address());
});

const directoryName = path.dirname(url.fileURLToPath(import.meta.url));
app.use(express.static(directoryName));

server.listen(config.listen.port, config.listen.address, () => {
	const address = server.address();
	console.log('HTTP Listening', address);
});
