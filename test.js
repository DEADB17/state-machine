import { strict as assert } from 'assert';
import { createMachine } from './index.js';

/** @type {Machine.Call<Store>} */
function call(m, t, { type }) {
  m.count++;
  m.stack.push(`${type}: ${m.state} -> ${t[0]}`);
  return t[0];
}

/** @type {Machine.Graph} */
const g = {
  a: {
    ENTER: call,
    go: { to: ['b'], call },
    loop: { to: ['a'], call },
    end: { to: ['c'], call },
    LEAVE: call,
  },
  b: {
    ENTER: call,
    go: { to: ['a'], call },
    LEAVE: call,
  },
  c: null,
};

// Create a machine
const m0 = createMachine(g, 'a');
assert.equal(m0.state, 'a');
assert.equal(m0.graph, g);

// Create an extension
/**
 * @typedef {object} Store
 * @prop {number} count
 * @prop {string[]} stack
 */
/** @type {Store} */
const s0 = { count: 0, stack: [] };

// Join them
/** @type {Machine.Machine & Store} */
const m = Object.assign(m0, s0);
assert.equal(m.state, 'a');
assert.equal(m.count, 0);
assert.deepEqual(m.stack, []);
// a.ENTER didn't get called

// Call with go event
m.handleEvent({ type: 'go' });
assert.equal(m.state, 'b');
assert.equal(m.count, 3);
assert.deepEqual(m.stack, ['go: a -> b', 'LEAVE: a -> b', 'ENTER: a -> b']);

// Call with go event
m.handleEvent({ type: 'go' });
assert.equal(m.state, 'a');
assert.equal(m.count, 6);
assert.deepEqual(m.stack, [
  'go: a -> b',
  'LEAVE: a -> b',
  'ENTER: a -> b',
  'go: b -> a',
  'LEAVE: b -> a',
  'ENTER: b -> a',
]);

// Call with loop event
m.handleEvent({ type: 'loop' });
assert.equal(m.state, 'a');
assert.equal(m.count, 7);
assert.deepEqual(m.stack, [
  'go: a -> b',
  'LEAVE: a -> b',
  'ENTER: a -> b',
  'go: b -> a',
  'LEAVE: b -> a',
  'ENTER: b -> a',
  'loop: a -> a',
]);

// Call with end event
m.handleEvent({ type: 'end' });
assert.equal(m.state, 'c');
assert.equal(m.count, 9);
assert.deepEqual(m.stack, [
  'go: a -> b',
  'LEAVE: a -> b',
  'ENTER: a -> b',
  'go: b -> a',
  'LEAVE: b -> a',
  'ENTER: b -> a',
  'loop: a -> a',
  'end: a -> c',
  'LEAVE: a -> c',
]);

// In terminal state nothing else can happen
m.handleEvent({ type: 'go' });
m.handleEvent({ type: 'LEAVE' });
m.handleEvent({ type: 'ENTER' });
assert.equal(m.state, 'c');
assert.equal(m.count, 9);

// /////////////////////////////////////////////////////////////////////////////
// graph-to-dot
// /////////////////////////////////////////////////////////////////////////////

import { graphToDot } from './graph-to-dot.js';

/** @type {Machine.Graph} */
const g2 = {
  noLib: {
    libLoaded: { to: ['noDom'], call },
  },
  noDom: {
    domContentLoaded: { to: ['formReady'], call },
  },
  formReady: {
    ENTER: call,
    change: { to: ['formValid', 'formInvalid'], call },
  },
  formValid: {
    ENTER: call,
    change: { to: ['formValid', 'formInvalid'], call },
    submit: { to: ['submitting'], call },
  },
  formInvalid: {
    ENTER: call,
    change: { to: ['formValid', 'formInvalid'], call },
  },
  submitting: {
    ENTER: call,
    LEAVE: call,
    progress: { to: ['submitting'], call },
    netError: { to: ['formValid'], call },
    '5XX': { to: ['formValid'], call },
    '4XX': { to: ['formInvalid'], call },
    '200': { to: ['thankYou'], call },
  },
  thankYou: {
    ENTER: call,
  },
};

const expected = `digraph {

    graph [rankdir=LR]
    node [fontname="Geneva" fontsize=14
          fontcolor=white color="#4b4f4f"
          shape=box style="rounded,filled"]
    edge [fontname="Geneva" fontsize=10 color="#4b4f4f" arrowsize=0.7]

    noLib [color="#06ac38"]
    noLib -> noDom [label="libLoaded"]
    noDom -> formReady [label="domContentLoaded"]
    formReady -> formValid [label="change"]
    formReady -> formInvalid [label="change"]
    formValid -> formValid [label="change"]
    formValid -> formInvalid [label="change"]
    formValid -> submitting [label="submit"]
    formInvalid -> formValid [label="change"]
    formInvalid -> formInvalid [label="change"]
    submitting -> thankYou [label="200"]
    submitting -> submitting [label="progress"]
    submitting -> formValid [label="netError"]
    submitting -> formValid [label="5XX"]
    submitting -> formInvalid [label="4XX"]
    thankYou [color="#00607f"]

    formValid -> formValid [label="change" tailport=s]
    formValid -> formInvalid [label="change" tailport=nw]
    { rank=same noLib noDom formReady }
    { rank=same formValid formInvalid }
}`;

assert.equal(graphToDot(g2, 'noLib'), expected);
