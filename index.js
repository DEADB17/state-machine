/**
 * @template Store, Conf
 * @type {Machine.CreateMachine<Store, Conf>}
 */
export function createMachine(graph, state, store, conf) {
  /** @type {Machine.Machine<Store, Conf>}*/
  const mac = {
    get state() {
      return state;
    },
    get store() {
      return store;
    },
    get conf() {
      return conf;
    },
    send(event) {
      const gState = /** @type {Machine.GEvent<Store, Conf> | null} */ (graph[
        state
      ]);
      const edge = gState && gState[event.type];
      if (edge) {
        const res = edge.call(event, edge.to, mac);
        const nextState = res[0] in graph ? res[0] : state;
        if (res[1]) store = res[1];
        if (nextState !== state) {
          const gLeave = /** @type {Machine.GLeave<Store, Conf> | null} */ (graph[
            state
          ]);
          if (gLeave && gLeave.LEAVE) {
            const res = gLeave.LEAVE({ type: 'LEAVE' }, { state: nextState }, mac);
            if (res) store = res;
          }
          state = nextState;
          const gEnter = /** @type {Machine.GEnter<Store, Conf> | null} */ (graph[
            state
          ]);
          if (gEnter && gEnter.ENTER) {
            const res = gEnter.ENTER({ type: 'ENTER' }, { state }, mac);
            if (res) store = res;
          }
        }
      }
      return mac;
    },
  };

  // NOTE(leo): Not sure if this is useful
  // const gEnter = /** @type {GEnter<TStore, TConf>} */(graph[state]);
  // const edge = gEnter && gEnter[ENTER];
  // if (edge && typeof edge === 'function') {
  //   const res = edge({type: ENTER}, [state], mac);
  //   if (res && res.store) store = res.store;
  // }

  return mac;
}
