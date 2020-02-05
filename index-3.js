/* eslint-disable valid-jsdoc, no-magic-numbers, no-console */
/* eslint-env browser */

/** @typedef {string} Vertex */

/** @typedef {any} Payload */

/** @typedef {{from: Vertex, to: Vertex}} Step */

/**
 * @template Store
 * @callback Edge
 * @arg {Store} store
 * @arg {Payload} [payload]
 * @arg {Step} [step]
 * @return {Store}
 */

/**
 * @template Store
 * @typedef {{[from: string]: {[to: string]: Edge<Store>}}} Graph
 */

/**
 * @template Store
 * @arg {Graph<Store>} graph
 * @arg {Vertex} from
 * @arg {Store} store
 */
function create(graph, from, store) {
  /** @type {Step} */
  const step = {from: from, to: ''};
  /**
   * @arg {Vertex} to
   * @arg {Payload} [payload]
   */
  function go(to, payload) {
    step.to = to;
    // eslint-disable-next-line no-param-reassign
    store = graph[step.from][to](store, payload, step);
    step.from = to;
    return go;
  }

  return go;
}

// /////////////////////////////////////////////////////////////////////////////
// tests
// /////////////////////////////////////////////////////////////////////////////

/** @type {Edge<Array<[number, string, string]>>} */
function trans(store, payload, {from, to}) {
  store.push([payload, from, to]);
  return store;
}
/** @type {Edge<Array<[number, string, string]>>} */
function done(store, payload, step) {
  trans(store, payload, step);
  console.log(store);
  return [];
}
const graph = {
  a: { b: trans },
  b: { a: trans, c: done },
};
const from = 'a';
/** @type {Array<any>} */
const store = [];
const go = create(graph, from, store);
go('b', 1)('a', 2)('b', 3)('c', 4);
