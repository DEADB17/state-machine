export const NEXT = {};
export const CANCEL = {};
export const Error = {
  NO_EDGE: 'NO_EDGE',
  NO_NEXT: 'NO_NEXT',
};

function goTo(oldNode, newNode, transition, payload) {
  const proceed = transition(oldNode, newNode, payload);
  return proceed === CANCEL ? oldNode : newNode;
}

export function create(edges, initial, transition, error) {
  let current = initial;

  const methods = {
    to(newNode, ...payload) {
      const toNodes = edges[current];

      if (newNode === NEXT) {
        if (toNodes.length === 1) {
          current = goTo(current, toNodes[0], transition, payload);
        } else {
          error(Error.NO_NEXT, `Can't infer NEXT, ${current} has ${toNodes.length} edges.`);
        }
      } else if (toNodes.indexOf(newNode) < 0) {
        error(Error.NO_EDGE, `No edge from ${current} to ${newNode}`);
      } else {
        current = goTo(current, newNode, transition, payload);
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
