/// <reference path='types.d.ts' />

const E = 'ENTER';
const L = 'LEAVE';

/**
 * @arg {Graph} graph
 * @arg {State} state
 * @arg {Machine} machine
 * @arg {MiniEvent} event
 */
export function step(graph, state, machine, event) {
  if (event.type !== E && event.type !== L) {
    const node = /** @type {Edge | null} */ (graph[state]);
    const edge = node && node[event.type];

    if (edge) {
      const res = edge.call(machine, edge.to, event);
      const nextState = 0 <= edge.to.indexOf(res) ? res : state;

      if (nextState !== state) {
        const nodeOut = /** @type {EdgeOut | null} */ (graph[state]);
        nodeOut && nodeOut[L] && nodeOut[L](machine, [nextState], { type: L });

        const nodeIn = /** @type {EdgeIn | null} */ (graph[nextState]);
        nodeIn && nodeIn[E] && nodeIn[E](machine, [nextState], { type: E });

        return nextState;
      }
    }
  }

  return state;
}

/** @type {Create} */
export function createMachine(graph, state) {
  /** @type {Machine} */
  const machine = {
    get graph() {
      return graph;
    },
    get state() {
      return state;
    },
    handleEvent(event) {
      state = step(graph, state, this, event);
    },
  };

  return machine;
}
