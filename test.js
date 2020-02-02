/*eslint-disable no-multi-spaces, key-spacing*/

import {test} from 'tape';
import {parse, transition, create, throwError } from './';

const sample = [
  {event: 'load',   from: 'none',      to: 'loading'},
  {event: 'load',   from: 'loading',   to: 'loading'},
  {event: 'load',   from: 'loaded',    to: 'reloading'},
  {event: 'load',   from: 'reloading', to: 'reloading'},

  {event: 'fail',   from: 'loading',   to: 'none'},
  {event: 'fail',   from: 'saving',    to: 'changed'},
  {event: 'fail',   from: 'reloading', to: 'loaded'},

  {event: 'pass',   from: 'loading',   to: 'loaded'},
  {event: 'pass',   from: 'loaded',    to: 'loaded'},
  {event: 'pass',   from: 'saving',    to: 'loaded'},
  {event: 'pass',   from: 'reloading', to: 'loaded'},

  {event: 'change', from: 'loaded',    to: 'changed'},
  {event: 'change', from: 'changed',   to: 'changed'},

  {event: 'save',   from: 'changed',   to: 'saving'},
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

test('parse with custom spec', t => {
  const sample2 = [
    { a: 'a', b: 'b', c: 'c' },
    { a: 'd', b: 'e', c: 'f' },
    { a: 'g', b: 'h', c: 'i' },
  ];
  const spec = ['a', 'b', 'c'];
  const fsm = parse(sample2, spec);

  t.same(fsm.EVENT,
         { a: 'a', d: 'd', g: 'g' },
         'events are as expected');

  t.same(fsm.STATE,
         { b: 'b', c: 'c', e: 'e', f: 'f', h: 'h', i: 'i' },
         'states are as expected');

  t.same(fsm.table, {
    a: { b: 'c' },
    d: { e: 'f' },
    g: { h: 'i' },
  }, 'table is as expected');

  t.end();
});

test('parse multi from', t => {
  const sample3 = [
    { ev: 'go',        from: 'stopped',                                        to: 'goingStraight' },
    { ev: 'turnLeft',  from: ['goingStraight', 'turningRight'],                to: 'turningLeft' },
    { ev: 'turnRight', from: ['goingStraight', 'turningLeft'],                 to: 'turningRight' },
    { ev: 'stop',      from: ['goingStraight', 'turningRight', 'turningLeft'], to: 'stopped'},
  ];
  const spec = ['ev', 'from', 'to'];
  const fsm = parse(sample3, spec);

  t.same(fsm.EVENT,
         { go: 'go', stop: 'stop', turnLeft: 'turnLeft', turnRight: 'turnRight' },
         'events are as expected');

  t.same(fsm.STATE, {
    stopped: 'stopped',
    goingStraight: 'goingStraight',
    turningLeft: 'turningLeft',
    turningRight: 'turningRight',
  }, 'states are as expected');

  t.same(fsm.table, {
    go:        { stopped: 'goingStraight' },
    turnLeft:  { goingStraight: 'turningLeft',  turningRight: 'turningLeft' },
    turnRight: { goingStraight: 'turningRight', turningLeft: 'turningRight' },
    stop:      { goingStraight: 'stopped',      turningLeft: 'stopped', turningRight: 'stopped' },
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
