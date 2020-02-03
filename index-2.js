export const NEXT = {};
export const CANCEL = {};
export const Error = {
  NO_EDGE: 'NO_EDGE',
  NO_NEXT: 'NO_NEXT',
};

export function create(edges, initial, transition, error, data0) {
  if (!(initial in edges)) throw new Error(`Invalid initial ${initial}`);

  Object.keys(edges).forEach(key => {
    edges[key].forEach(node => {
      if (!(node in edges)) throw new Error(`Non existent ${node} in ${key}`);
    });
  });

  let current = initial;
  let data = data0;

  function goTo(node, payload) {
    const prevNode = current;
    const newData = transition(prevNode, node, data, payload);
    if (newData !== CANCEL) {
      if (newData !== undefined) data = newData;
      current = node;
    }
  }

  function to(node, ...payload) {
    const toNodes = edges[current];
    if (node === NEXT) {
      if (toNodes.length === 1) {
        goTo(toNodes[0], ...payload);
      } else {
        error(Error.NO_NEXT, `Can't infer NEXT, ${current} has ${toNodes.length} edges.`);
      }
    } else if (toNodes.indexOf(node) < 0) {
      error(Error.NO_EDGE, `No edge from ${current} to ${node}`);
    } else {
      goTo(node, payload);
    }
  }

  return {
    to,
    get data() { return data; },
    get current() { return current; }
  };
}
