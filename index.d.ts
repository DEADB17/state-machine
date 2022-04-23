/// <reference path='types.d.ts' />

/** @type {Create} */
export function createMachine(
  graph: Readonly<{
    [from: string]: EdgeIn | EdgeOut | Edge;
  }>,
  state: string,
  opts: Opts
): Readonly<{
  graph: Readonly<{
    [from: string]: EdgeIn | EdgeOut | Edge;
  }>;
  state: string;
  handleEvent: (event: MiniEvent) => void;
}>;
