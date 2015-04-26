'use strict';

var trans = require('./transition');

function errorFn(code) { throw new TypeError(code); }

module.exports = function (table, currentState, error) {
    error = error || errorFn;
    return function transition(event) {
        if (arguments.length > 0) {
            currentState = trans(error, table, event, currentState);
            return transition;
        }
        return currentState;
    };
};
