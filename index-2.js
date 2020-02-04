/**
 * @typedef {{[from: string]: string[]}} Edges
 *
 * @callback Transition
 * @arg {string} current
 * @arg {string} newNode
 * @arg {any[]} payload
 * @return {boolean}
 *
 * @callback Error
 * @arg {'NO_EDGE'} type
 * @arg {Edges} edges
 * @arg {string} current
 * @arg {string} newNode
 * @return {void}
 */

/**
 * @arg {Edges} edges
 * @arg {string} initial
 * @arg {Transition} transition
 * @arg {Error} error
 */
export function create(edges, initial, transition, error) {
  let current = initial;

  const methods = {
    /**
     * @arg {string} newNode
     * @arg {any[]} [payload]
     */
    to(newNode, ...payload) {
      const toNodes = edges[current];

      if (toNodes.indexOf(newNode) < 0) {
        error('NO_EDGE', edges, current, newNode);
      } else if (transition(current, newNode, payload) !== false) {
        current = newNode;
      }

      return methods;
    },
    get current() { return current; }
  };

  return methods;
}

/**
 * @arg {Edges} edges
 * @arg {string} initial
 */
export function isInitialValid(edges, initial) {
  return initial in edges;
}

/**
 * @arg {Edges} edges
 */
export function terminals(edges) {
  const terminals = {};
  Object.keys(edges).forEach(key => {
    edges[key].forEach(node => {
      if (!(node in edges)) terminals[node] = true;
    });
  });
  return terminals;
}


function trans(currentNode, newNode, data, payload) {
  console.log(currentNode, newNode, data, payload);
}

const sampleDescription = {
  initial: 'a',
  transitions: [
    {from: 'a', to: 'b', fn: trans},
    {from: 'b', to: ['c', 'd'], fn: trans},
    {from: ['c', 'd'], to: 'e', fn: trans},
    {from: 'e', to: 'b', fn: trans},
  ],
  error: console.error,
  data: 'data',
};

/**
 * @typedef {string | string[]} Nodes
 */
/**
 * @template Data
 * @typedef {(current:string, newNode:string, data:Data, payload:any[])=>false|void|Data} Transition2
 */

/**
 * @template Data
 * @arg {{from: Nodes, to: Nodes, fn: Transition2<Data>}} transitions
 * @return {Edges}
 */
export function transitionsToEdges(transitions) {
  const edges = {};
  const fns = {};
  transitions.forEach(tn => {
    let {from, to} = tn;
    const fn = tn.fn;
    if (Array.isArray(from) && Array.isArray(to)) throw new Error(`${from} and ${to} can't both be []`);
    if (typeof from === 'string') from = [from];
    if (typeof to === 'string') to = [to];
    from.forEach(f => {
      edges[f] = edges[f] || [];
      fns[f] = fns[f] || {};
      to.forEach(t => {
        edges[f].push(t);
        fns[f][t] = fn;
      });
    });
  });
  return {edges, fns};
}

export const NEXT = {};
export const CANCEL = {};

export function create2(description) {
  const {initial, transitions} = description;
  const error = description.error || console.error;
  let {data} = description;
  const {edges, fns} = transitionsToEdges(transitions);

  function transition(from, to, payload) {
    const fn = fns[from][to];
    const newData = fn(from, to, data, payload);
    if (newData === CANCEL) return false;
    else if (newData !== undefined) data = newData;
    return true;
  }

  const g = create(edges, initial, transition, error);

  const methods = {
    to(newNode, ...payload) {
      const current = g.current;
      const toNodes = edges[current];

      if (newNode === NEXT) {
        if (toNodes.length === 1) g.to(toNodes[0], ...payload);
        else error('INVALID_NEXT', edges, current, newNode);
      } else g.to(newNode, ...payload);

      return methods;
    },
    get current() { return g.current; },
    get data() { return data; }
  };

  return methods;
}

// test main
// const g1e = transitionsToEdges(sampleDescription.transitions).edges;
// const g1 = create(g1e, 'a', console.log, console.error);
// console.log(g1.current);
// g1.to('b', 'pay', 'load');
// console.log(g1.current);

// test
// console.log(terminals(transitionsToEdges(sampleDescription.transitions).edges));
// console.log(transitionsToEdges(sampleDescription.transitions));

const g = create2(sampleDescription);
console.log(g.current, g.data);
g.to(NEXT, 'pay', 'load');
console.log(g.current, g.data);
g.to(NEXT, 'ambiguous');
console.log(g.current, g.data);
g.to('c', 'back on track');
console.log(g.current, g.data);
g.to(NEXT, 'again');
console.log(g.current, g.data);
