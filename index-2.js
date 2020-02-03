export const NEXT = {};
export const CANCEL = {};
export const Error = {
  NO_EDGE: 'NO_EDGE',
  NO_NEXT: 'NO_NEXT',
};

export function create(edges, initial, transition, error) {
  let current = initial;

  const methods = {
    to(newNode, ...payload) {
      const toNodes = edges[current];

      if (newNode === NEXT) {
        if (toNodes.length !== 1) {
          error(Error.NO_NEXT, `Can't infer NEXT, ${current} has ${toNodes.length} edges.`);
        } else if (transition(current, toNodes[0], payload) !== CANCEL) {
          current = toNodes[0];
        }
      } else if (toNodes.indexOf(newNode) < 0) {
        error(Error.NO_EDGE, `No edge from ${current} to ${newNode}`);
      } else if (transition(current, newNode, payload) !== CANCEL) {
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
