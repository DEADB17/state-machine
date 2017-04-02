export function parse(table) {
    return table.reduce(function (acc, it) {
        var tab = acc.table;

        acc.EVENT[it.ev] = it.ev;
        acc.STATE[it.from] = it.from;
        acc.STATE[it.to] = it.to;

        tab[it.ev] = tab[it.ev] || {};
        tab[it.ev][it.from] = tab[it.ev][it.from] || {};
        tab[it.ev][it.from] = it.to;

        return acc;
    }, { table: {}, EVENT: {}, STATE: {} });
}

export function TransitionException(type, table, event, currentState) {
    this.type = type;
    this.table = table;
    this.event = event;
    this.currentState = currentState;
}

export function transition(table, event, currentState) {
    if (!table || !table[event] || !table[event][currentState]) {
        throw new TransitionException('transition', table, event, currentState);
    }
    return table[event][currentState];
}

export function create(table, currentState) {
    return { table: table, currentState: currentState };
}

export function machineCreate(table, currentState) {
    return function t(event) {
        if (arguments.length > 0) {
            // eslint-disable-next-line no-param-reassign
            currentState = transition(table, event, currentState);
            return t;
        }
        return currentState;
    };
}
