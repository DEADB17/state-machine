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

export function transition(error, table, state, event) {
    if (!table || !table[event] || !table[event][state]) {
        error(table, state, event);
    }
    return table[event][state];
}

export function throwError(table, state, event) {
    const error = new Error('Invalid transition');
    error.table = table;
    error.state = state;
    error.event = event;
    throw error;
}

export function create(table, state) {
    return function chain(event) {
        if (arguments.length === 0) return state;
        // eslint-disable-next-line no-param-reassign
        state = transition(throwError, table, state, event);
        return chain;
    };
}
