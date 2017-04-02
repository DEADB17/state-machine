const EVENT_KEY = 0;
const FROM_KEY = 1;
const TO_KEY = 2;

export function parse(table, keySpec) {
    const spec = Array.isArray(keySpec) ? keySpec : [];
    const eventKey = spec[EVENT_KEY] || 'event';
    const fromKey = spec[FROM_KEY] || 'from';
    const toKey = spec[TO_KEY] || 'to';

    return table.reduce((acc, it) => {
        const tab = acc.table;
        const event = it[eventKey];
        const from = it[fromKey];
        const to = it[toKey];

        acc.EVENT[event] = event;
        acc.STATE[from] = from;
        acc.STATE[to] = to;

        tab[event] = tab[event] || {};
        tab[event][from] = tab[event][from] || {};
        tab[event][from] = to;

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
