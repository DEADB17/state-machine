/* eslint-disable valid-jsdoc, no-magic-numbers, no-console */
/* eslint-env browser */

/** @typedef {string} Vertex */

/**
 * @template Store, Payload
 * @callback Edge
 * @arg {Vertex} from
 * @arg {Vertex[]} to
 * @arg {Store} store
 * @arg {Payload} payload
 * @return {Vertex}
 */

/**
 * @template Store, Payload
 * @typedef {{[from: string]: {edge: Edge<Store, Payload>, to: Vertex[]}}} Graph
 */

/**
 * @template Store, Payload
 * @arg {Graph<Store, Payload>} graph
 * @arg {Vertex} from
 * @arg {Store} store
 */
function create(graph, from, store) {
  /**
   * @arg {Payload} payload
   */
  function go(payload) {
    const to = graph[from].to;
    // eslint-disable-next-line no-param-reassign
    from = graph[from].edge(from, to, store, payload);
  }

  return go;
}

// /////////////////////////////////////////////////////////////////////////////
// tests
// /////////////////////////////////////////////////////////////////////////////
/**
 * @arg {Vertex} from
 * @arg {Vertex[]} to
 * @arg {any[]} store
 * @arg {number} payload
 * @return {Vertex}
 */
function trans(from, to, store, payload) {
  console.log(from, to, store, payload);
  return 1 < to.length && 0 < payload ? to[1] : to[0];
}
/** @type {Graph<any[], number>} */
const graph = {
  a: { edge: trans, to: ['b'] },
  b: { edge: trans, to: ['a', 'c'] },
};
const from = 'a';
/** @type {any[]} */
const store = [];
const go = create(graph, from, store);
go(0);
go(0);
go(0);
go(1);
