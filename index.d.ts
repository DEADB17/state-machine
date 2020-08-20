export function step(
  graph: Machine.Graph,
  state: Machine.State,
  machine: Machine.Machine,
  event: Machine.MiniEvent
): Machine.State;

export function createMachine(
  graph: Machine.Graph,
  state: Machine.State
): Machine.Machine;
