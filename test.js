/*eslint-disable no-multi-spaces, key-spacing*/

import {test} from 'tape';
import {parse, TransitionException as Exc, transition, create, machineCreate } from './';

const sample = [
    {ev: 'load',   from: 'none',      to: 'loading'},
    {ev: 'load',   from: 'loading',   to: 'loading'},
    {ev: 'load',   from: 'loaded',    to: 'reloading'},
    {ev: 'load',   from: 'reloading', to: 'reloading'},

    {ev: 'fail',   from: 'loading',   to: 'none'},
    {ev: 'fail',   from: 'saving',    to: 'changed'},
    {ev: 'fail',   from: 'reloading', to: 'loaded'},

    {ev: 'pass',   from: 'loading',   to: 'loaded'},
    {ev: 'pass',   from: 'loaded',    to: 'loaded'},
    {ev: 'pass',   from: 'saving',    to: 'loaded'},
    {ev: 'pass',   from: 'reloading', to: 'loaded'},

    {ev: 'change', from: 'loaded',    to: 'changed'},
    {ev: 'change', from: 'changed',   to: 'changed'},

    {ev: 'save',   from: 'changed',   to: 'saving'},
];

test('parse', t => {
    const fsm = parse(sample);

    t.same(fsm.EVENT, {
        load:   'load',
        fail:   'fail',
        pass:   'pass',
        change: 'change',
        save:   'save',
    }, 'events are as expected');

    t.same(fsm.STATE, {
        none:      'none',
        loading:   'loading',
        loaded:    'loaded',
        reloading: 'reloading',
        saving:    'saving',
        changed:   'changed',
    }, 'states are as expected');

    t.same(fsm.table, {
        load: {
            none:      'loading',
            loading:   'loading',
            loaded:    'reloading',
            reloading: 'reloading',
        },
        fail: {
            loading:   'none',
            saving:    'changed',
            reloading: 'loaded',
        },
        pass: {
            loading:   'loaded',
            loaded:    'loaded',
            saving:    'loaded',
            reloading: 'loaded',
        },
        change: {
            loaded:  'changed',
            changed: 'changed',
        },
        save: {
            changed: 'saving',
        },
    }, 'table is as expected');

    t.end();
});

test('Exception', t => {
    t.same(new Exc('error', {}, 'ev', 'state'),
           { type: 'error', table: {}, event: 'ev', currentState: 'state' },
           'Exception object is as expected');

    t.end();
});

test('transition', t => {
    const fsm = parse(sample);

    t.throws(() => { transition(); }, Exc, 'throws exception');

    try {
        transition();
    } catch (ex) {
        t.same(ex, {
            type: 'transition',
            table: undefined,
            event: undefined,
            currentState: undefined,
        }, 'exception: undefined');
    }

    try {
        transition(fsm.table);
    } catch (ex) {
        t.same(ex, {
            type: 'transition',
            table: fsm.table,
            event: undefined,
            currentState: undefined,
        }, 'exception: no event, no currentState');
    }

    try {
        transition(fsm.table, fsm.EVENT.load);
    } catch (ex) {
        t.same(ex, {
            type: 'transition',
            table: fsm.table,
            event: fsm.EVENT.load,
            currentState: undefined,
        }, 'exception: no currentState');
    }

    try {
        transition(fsm.table, fsm.EVENT.save, fsm.STATE.none);
    } catch (ex) {
        t.same(ex, {
            type: 'transition',
            table: fsm.table,
            event: fsm.EVENT.save,
            currentState: fsm.STATE.none,
        }, 'exception: transition not possible');
    }

    t.is(transition(fsm.table, fsm.EVENT.load, fsm.STATE.none),
         fsm.STATE.loading,
         'new state is loading');

    t.end();
});


test('create', t => {
    t.same(create({}, 'currentState'),
           { table: {}, currentState: 'currentState' });
    t.end();
});

test('create-machine', t => {
    const p = parse(sample);
    const trans = machineCreate(p.table, p.STATE.none);

    t.is(trans(), p.STATE.none, 'initial state is none');
    t.is(trans(p.EVENT.load)(), p.STATE.loading, 'state is loading');

    t.end();
});
