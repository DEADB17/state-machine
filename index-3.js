/* eslint-disable valid-jsdoc, no-magic-numbers, no-console */
/* eslint-env browser */

/** @typedef {string} Vertex */

/** @typedef {{from: Vertex, to: Vertex}} Step */

/**
 * @template P
 * @callback Edge
 * @arg {P} payload
 * @arg {Step} [step]
 */

/**
 * @template P
 * @typedef {{[from: string]: {[to: string]: Edge<P>}}} Graph
 */

/**
 * @template P
 * @arg {Graph<P>} graph
 * @arg {Vertex} from
 */
function createMachine(graph, from) {
  /** @type {Step} */
  const step = {from: from, to: ''};
  /**
   * @arg {Vertex} to
   * @arg {P} payload
   */
  function go(to, payload) {
    step.to = to;
    graph[step.from][to](payload, step);
    step.from = to;
  }

  return go;
}

// /////////////////////////////////////////////////////////////////////////////
// tests
// /////////////////////////////////////////////////////////////////////////////

/** @typedef {{counter: number, stack: [number, string, string][]}} Store */
/** @typedef {[Store, string]} Payload */

/**
 * @arg {Payload} payload
 * @arg {Step} step
 */
function trans(payload, {from, to}) {
  payload[0].counter += 1;
  payload[0].stack.push([payload[0].counter, from, to]);
}
/**
 * @arg {Payload} payload
 * @arg {Step} step
 */
function done(payload, step) {
  trans(payload, step);
  console.log(payload);
}
const graph = {
  a: { b: trans },
  b: { a: trans, c: done },
};
const from = 'a';
/** @type {Store} */
const store = {counter: 0, stack: []};
const go = createMachine(graph, from);
go('b', [store, 'click']);
go('a', [store, 'click']);
go('b', [store, 'click']);
go('c', [store, 'click']);
