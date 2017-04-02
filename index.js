export function parse(table) {
    return table.reduce((acc, it) => {
        const tab = acc.table;

        acc.EVENT[it.ev] = it.ev;
        acc.STATE[it.from] = it.from;
        acc.STATE[it.to] = it.to;

        tab[it.ev] = tab[it.ev] || {};
        tab[it.ev][it.from] = tab[it.ev][it.from] || {};
        tab[it.ev][it.from] = it.to;

        return acc;
    }, { table: {}, EVENT: {}, STATE: {} });
}

export function TransitionException(type, table, currentState, event) {
    this.type = type;
    this.table = table;
    this.currentState = currentState;
    this.event = event;
}

export function transition(table, currentState, event) {
    if (!table || !table[event] || !table[event][currentState]) {
        throw new TransitionException('transition', table, currentState, event);
    }
    return table[event][currentState];
}

export function create(table, currentState) {
    return function t(event) {
        if (arguments.length > 0) {
            // eslint-disable-next-line no-param-reassign
            currentState = transition(table, currentState, event);
            return t;
        }
        return currentState;
    };
}
