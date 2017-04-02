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

export function TransitionException(type, table, state, event) {
    this.type = type;
    this.table = table;
    this.state = state;
    this.event = event;
}

export function transition(table, state, event) {
    if (!table || !table[event] || !table[event][state]) {
        throw new TransitionException('transition', table, state, event);
    }
    return table[event][state];
}

export function create(table, state) {
    return function t(event) {
        if (arguments.length > 0) {
            // eslint-disable-next-line no-param-reassign
            state = transition(table, state, event);
            return t;
        }
        return state;
    };
}
