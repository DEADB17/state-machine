'use strict';

module.exports = function (table) {
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
};
