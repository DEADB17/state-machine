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
