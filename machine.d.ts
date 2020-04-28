declare namespace Machine {
  type State = string;

  type MiniEvent = { readonly type: string } | Event;

  type Machine = Readonly<{
    graph: Graph;
    state: State;
    handleEvent: (event: MiniEvent) => void;
  }>;

  type Call<T> = (event: MiniEvent, to: State[], mac: Machine & T) => State;

  type Auto<T> = (
    event: MiniEvent,
    to: State[],
    mac: Machine & T
  ) => State | void;

  type Terminal = null;
  type EdgeIn = { ENTER: Auto<any> };
  type EdgeOut = { LEAVE: Auto<any> };
  type Edge = {
    [eventType: string]: { to: State[]; call: Call<any> };
  };

  type Graph = Readonly<{
    [from: string]: Terminal | EdgeIn | EdgeOut | Edge;
  }>;

  type Create = (graph: Graph, state: State) => Machine;
}
