declare namespace Machine {
  type State = string;

  type MiniEvent = {type: string} | Event;

  type Machine<Store, Conf> = Readonly<{
    state: State
    store: Store
    conf: Conf
    send: (event: MiniEvent) => Machine<Store, Conf>
  }>;

  type ToState = Record<string, State>;

  type Call<Store, Conf> = (
    event: MiniEvent,
    to: ToState,
    mac: Machine<Store, Conf>
  ) => [State, Store];

  type AutoCall<Store, Conf> = (
    event: MiniEvent,
    to: ToState,
    mac: Machine<Store, Conf>
  ) => void | Store;

  type Graph<Store, Conf> = {
    [from: string]: GTerminal | GEnter<Store, Conf> | GLeave<Store, Conf> | GEvent<Store, Conf>
  };
  type GTerminal = null;
  type GEnter<Store, Conf> = { ENTER: AutoCall<Store, Conf> };
  type GLeave<Store, Conf> = { LEAVE: AutoCall<Store, Conf> };
  type GEvent<Store, Conf> = { [eventType: string]: { to: ToState, call: Call<Store, Conf> }};

  type CreateMachine<Store, Conf> = (
    graph: Graph<Store, Conf>,
    state: State,
    store: Store,
    conf: Conf
  ) => Machine<Store, Conf>;
}
