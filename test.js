import { strict as assert } from 'assert';
import { createMachine } from './index.js';

/** @type {Machine.Call<Store>} */
function call({ type }, t, m) {
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
