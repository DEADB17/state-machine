'use strict';

var trans = require('./transition');

module.exports = function create(table, currentState) {
    return function transition(event) {
        if (arguments.length > 0) {
            currentState = trans(table, event, currentState);
            return transition;
        }
        return currentState;
    };
};
