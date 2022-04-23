/// <reference path='types.d.ts' />

/** @type {Create} */
export function createMachine(graph, state, opts) {
  const ENTER = opts?.enter || 'ENTER';
  const LEAVE = opts?.leave || 'LEAVE';

  /** @type {Machine} */
  const machine = {
    get graph() {
      return graph;
    },
    get state() {
      return state;
    },
    handleEvent(event) {
      if (event.type === ENTER || event.type === LEAVE) return;

      const node = /** @type {Edge | null} */ (graph[state]);
      const edge = node && node[event.type];

      if (edge == null) return;

      const res = edge.call(machine, edge.to, event);
      const nextState = 0 <= edge.to.indexOf(res) ? res : state;

      if (nextState === state) return;

      const nodeOut = /** @type {EdgeOut | null} */ (graph[state]);
      nodeOut &&
        nodeOut[LEAVE] &&
        nodeOut[LEAVE](machine, [nextState], { type: LEAVE });

      const nodeIn = /** @type {EdgeIn | null} */ (graph[nextState]);
      nodeIn &&
        nodeIn[ENTER] &&
        nodeIn[ENTER](machine, [nextState], { type: ENTER });

      state = nextState;
    },
  };

  return machine;
}
