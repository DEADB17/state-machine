const E = 'ENTER';
const L = 'LEAVE';

/** @type {Machine.Create} */
export function createMachine(graph, state) {
  /** @type {Machine.Machine} */
  const mac = {
    get graph() {
      return graph;
    },
    get state() {
      return state;
    },
    handleEvent(event) {
      if (event.type === E || event.type === L) return;

      const node = /** @type {Machine.Edge | null} */ (graph[state]);
      const edge = node && node[event.type];

      if (edge) {
        const res = edge.call(event, edge.to, this);
        const nextState = 0 <= edge.to.indexOf(res) ? res : state;

        if (nextState !== state) {
          const nodeOut = /** @type {Machine.EdgeOut | null} */ (graph[state]);
          nodeOut &&
            nodeOut.LEAVE &&
            nodeOut.LEAVE({ type: L }, [nextState], this);

          const nodeIn = /** @type {Machine.EdgeIn | null} */ (graph[
            nextState
          ]);
          nodeIn &&
            nodeIn.ENTER &&
            nodeIn.ENTER({ type: E }, [nextState], this);

          state = nextState;
        }
      }
    },
  };

  return mac;
}
