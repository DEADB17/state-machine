/*eslint-disable no-multi-spaces, key-spacing*/

import {test} from 'tape';
import {parse, transition, create, throwError } from './';

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

test('throwError', t => {
    try {
        throwError('table', 'state', 'event');
    } catch (e) {
        t.is(e.name, 'Error', 'name is Error');
        t.is(e.message, 'Invalid transition', 'message is Invalid transition');
        t.is(e.table, 'table', 'table is table');
        t.is(e.state, 'state', 'state is state');
        t.is(e.event, 'event', 'event is event');
    }
    t.end();
});

test('empty transition throws error', t => {
    try {
        transition(throwError);
    } catch (e) {
        t.is(e.table, undefined, 'table is undefined');
        t.is(e.state, undefined, 'state is undefined');
        t.is(e.event, undefined, 'event is undefined');
    }

    t.end();
});

test('incomplete transition throws error', t => {
    const fsm = parse(sample);

    try {
        transition(throwError, fsm.table);
    } catch (e) {
        t.is(e.table, fsm.table, 'table is {}');
        t.is(e.state, undefined, 'state is undefined');
        t.is(e.event, undefined, 'event is undefined');
    }

    try {
        transition(throwError, fsm.table, undefined, fsm.EVENT.load);
    } catch (e) {
        t.is(e.table, fsm.table, 'table is {}');
        t.is(e.state, undefined, 'state is undefined');
        t.is(e.event, fsm.EVENT.load, 'event is load');
    }

    t.end();
});

test('impossible transition throws error', t => {
    const fsm = parse(sample);

    try {
        transition(throwError, fsm.table, fsm.STATE.none, fsm.EVENT.save);
    } catch (e) {
        t.is(e.table, fsm.table, 'table is {}');
        t.is(e.state, fsm.STATE.none, 'state is none');
        t.is(e.event, fsm.EVENT.save, 'event is save');
    }

    t.end();
});

test('correct transition works', t => {
    const fsm = parse(sample);

    t.is(transition(throwError, fsm.table, fsm.STATE.none, fsm.EVENT.load),
         fsm.STATE.loading,
         'new state is loading');

    t.end();
});

test('create', t => {
    const p = parse(sample);
    const trans = create(p.table, p.STATE.none);

    t.is(trans(), p.STATE.none, 'initial state is none');
    t.is(trans(p.EVENT.load)(), p.STATE.loading, 'state is loading');

    t.end();
});
