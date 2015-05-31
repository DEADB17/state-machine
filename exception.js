'use strict';

module.exports = function Exception(type, table, event, currentState) {
    this.type = type;
    this.table = table;
    this.event = event;
    this.currentState = currentState;
};
