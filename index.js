const E = 'ENTER';
const L = 'LEAVE';

/**
 * @arg {Machine.Graph} graph
 * @arg {Machine.State} state
 * @arg {Machine.Machine} machine
 * @arg {Machine.MiniEvent} event
 */
function h(graph, state, machine, event) {
  if (event.type !== E && event.type !== L) {
    const node = /** @type {Machine.Edge | null} */ (graph[state]);
    const edge = node && node[event.type];

    if (edge) {
      const res = edge.call(machine, edge.to, event);
      const nextState = 0 <= edge.to.indexOf(res) ? res : state;

      if (nextState !== state) {
        const nodeOut = /** @type {Machine.EdgeOut | null} */ (graph[state]);
        nodeOut && nodeOut[L] && nodeOut[L](machine, [nextState], { type: L });

        const nodeIn = /** @type {Machine.EdgeIn | null} */ (graph[nextState]);
        nodeIn && nodeIn[E] && nodeIn[E](machine, [nextState], { type: E });

        return nextState;
      }
    }
  }

  return state;
}

/** @type {Machine.Create} */
export function createMachine(graph, state) {
  /** @type {Machine.Machine} */
  const machine = {
    get graph() {
      return graph;
    },
    get state() {
      return state;
    },
    handleEvent(event) {
      state = h(graph, state, machine, event);
    },
  };

  return machine;
}
