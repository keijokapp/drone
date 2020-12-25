import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './App.js';
import store from './store.js';
import './signaling.js';

function render() {
	ReactDOM.render(
		<React.StrictMode>
			<Provider store={store}>
				<App />
			</Provider>
		</React.StrictMode>,
		document.getElementById('root')
	);
}

render();

if (import.meta.webpackHot) {
	import.meta.webpackHot.accept('./App.js', () => {
		console.log('rerendering');
		render();
	});
}
