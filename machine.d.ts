declare namespace Machine {
  type State = string;

  type MiniEvent = { readonly type: string } | Event;

  type Machine = Readonly<{
    graph: Graph;
    state: State;
    handleEvent: (event: MiniEvent) => void;
  }>;

  type SCall = (event: MiniEvent, to: State[], mac: any) => State | void;
  type Call<T> = (
    event: MiniEvent,
    to: State[],
    mac: Machine & T
  ) => State | void;

  type Terminal = null;
  type EdgeIn = { ENTER: SCall };
  type EdgeOut = { LEAVE: SCall };
  type Edge = {
    [eventType: string]: { to: State[]; call: SCall };
  };

  type Graph = Readonly<{
    [from: string]: Terminal | EdgeIn | EdgeOut | Edge;
  }>;

  type Create = (graph: Graph, state: State) => Machine;
}
