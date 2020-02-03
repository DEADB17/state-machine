export const NEXT = {};
export const CANCEL = {};
export const Error = {
  NO_EDGE: 'NO_EDGE',
  NO_NEXT: 'NO_NEXT',
};

export function create(edges, node0, transition, error, data0) {
  if (!(node0 in edges)) throw new ReferenceError(`Invalid current: ${node0}`);

  let current = node0;
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
