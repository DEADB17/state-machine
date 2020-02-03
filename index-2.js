export function create(edges, initial, transition, error) {
  let current = initial;

  const methods = {
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

export function isInitialValid(edges, initial) {
  return initial in edges;
}

export function areNodesValid(edges) {
  Object.keys(edges).forEach(key => {
    edges[key].forEach(node => {
      if (!(node in edges)) throw new Error(`Non existent ${node} in ${key}`);
    });
  });
  return true;
}
