/* eslint-env browser */

import { createMachine } from './index.js';

function getInterval() {
  return Math.random() * 3000 + 500;
}

/**
 * @arg {Machine.MiniEvent} evt
 * @arg {number} delta
 * @arg {number} count
 * @arg {Machine.State} node0
 * @arg {Machine.State} node1
 * @arg {Store} store0
 * @arg {Store} store1
 */
function output({ type }, delta, count, node0, node1, store0, store1) {
  console.table([
    {
      Event: type,
      'Time delta': delta,
      Count: count,
      'Current node': node0,
      'Next node': node1,
      'Current store': store0,
      'Next store': store1,
    },
  ]);
}

/** @type {Machine.Call<Store, Conf>} */
function init(_event, tos, mac) {
  const win = mac.conf.window;
  const id = win.setTimeout(() => mac.send({ type: 'timeOut' }), getInterval());
  const timeStamp = Date.now();
  const store = { ...mac.store, id, timeStamp };
  return { to: tos[0], store };
}

/** @type {Machine.Call<Store, Conf>} */
function onAC(event, tos, mac) {
  // Cleanup
  clearTimeout(mac.store.id);

  // Build new state
  const store0 = mac.store;
  const win = mac.conf.window;
  const node0 = mac.state;
  const count = node0 === 'c' ? store0.count - 1 : store0.count;
  const id =
    count < 1
      ? store0.id
      : win.setTimeout(() => mac.send({ type: 'timeOut' }), getInterval());
  const to = count < 1 ? tos[1] : tos[0];
  const timeStamp = Date.now();
  const store = { ...store0, id, timeStamp, count };

  // Output
  output(event, timeStamp - store0.timeStamp, count, node0, to, store0, store);

  // Commit new state
  return { to, store };
}

/** @type {Machine.Call<Store, Conf>} */
function onB(event, tos, mac) {
  // Cleanup
  clearTimeout(mac.store.id);

  // Build new state
  const store0 = mac.store;
  const win = mac.conf.window;
  const id = win.setTimeout(() => mac.send({ type: 'timeOut' }), getInterval());
  const timeStamp = Date.now();
  const store = { ...store0, id, timeStamp };
  const index = Math.floor(Math.random() * tos.length);
  const to = tos[index];

  // Ouptput
  output(
    event,
    timeStamp - store0.timeStamp,
    store0.count,
    mac.state,
    to,
    store0,
    store
  );

  // Commit new state
  return { to, store };
}

/** @type {Machine.AutoCall<Store, Conf>} */
function onDone() {
  console.info('Done');
}

/** @type {Machine.AutoCall<Store, Conf>} */
function noop(event, tos, mac) {
  console.info(event, tos, mac.state);
  return { store: mac.store };
}

// /////////////////////////////////////////////////////////////////////////////
// Initialization

/** @type {Machine.Graph<Store, Conf>} */
const graph = {
  0: { start: { to: ['a'], call: init } },
  a: {
    ENTER: noop,
    timeOut: { to: ['b'], call: onAC },
    LEAVE: noop,
  },
  b: { timeOut: { to: ['a', 'c'], call: onB } },
  c: { timeOut: { to: ['a', 'd'], call: onAC } },
  d: { ENTER: onDone },
};

/** @typedef {typeof store} Store */
const store = {
  /** @type {number | NodeJS.Timeout} */
  id: 0,
  timeStamp: 0,
  count: 3,
};

/** @typedef {typeof conf} Conf */
const conf = {
  window: typeof window === 'object' ? window : global,
};

const mac = createMachine(graph, '0', store, conf);
mac.send({ type: 'start' });
