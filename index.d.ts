/// <reference path='types.d.ts' />

/**
 * @arg {Graph} graph
 * @arg {State} state
 * @arg {Machine} machine
 * @arg {MiniEvent} event
 */
export function step(
  graph: Graph,
  state: State,
  machine: Machine,
  event: MiniEvent
): string;
/** @type {Create} */
export function createMachine(
  graph: Readonly<{
    [from: string]: EdgeIn | EdgeOut | Edge | null;
  }>,
  state: string
): Readonly<{
  graph: Readonly<{
    [from: string]: EdgeIn | EdgeOut | Edge | null;
  }>;
  state: string;
  handleEvent: (event: MiniEvent) => void;
}>;
