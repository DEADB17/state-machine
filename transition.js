'use strict';

var Exc = require('./exception');

module.exports = function transition(table, event, currentState) {
    if (!table || !table[event] || !table[event][currentState]) {
        throw new Exc('transition', table, event, currentState);
    }
    return table[event][currentState];
};
