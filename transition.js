'use strict';

module.exports = function (error, table, event, currentState) {
	if (!table) {
		return error('no-table', table, event, currentState);
	} else if (!table[event]) {
		return error('no-event', table, event, currentState);
	} else if (!table[event][currentState]) {
		return error('no-transition', table, event, currentState);
	} else {
		return table[event][currentState];
	}
};
