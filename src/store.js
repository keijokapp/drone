import { createStore } from 'redux';

const store = createStore((state = { kass: 0 }, action) => {
	if (action.type === 'increment') {
		return { ...state, kass: state.kass + 1 };
	}

	return state;
});

export { store as default };

export const { dispatch } = store;
