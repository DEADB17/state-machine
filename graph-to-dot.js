const stdOpts = {
  pre: `
    graph [rankdir=LR]
    node [fontname="Geneva" fontsize=14
          fontcolor=white color="#4b4f4f"
          shape=box style="rounded,filled"]
    edge [fontname="Geneva" fontsize=10 color="#4b4f4f" arrowsize=0.7]
`,

  initial: `[color="#06ac38"]`,
  terminal: `[color="#00607f"]`,

  post: `
    formValid -> formValid [label="change" tailport=s]
    formValid -> formInvalid [label="change" tailport=nw]
    { rank=same noLib noDom formReady }
    { rank=same formValid formInvalid }`,
};

/**
 * @arg {Machine.Graph} graph
 * @arg {Machine.State} initial
 * @arg {Partial<typeof stdOpts>} [userOpts]
 */
export function graphToDot(graph, initial, userOpts) {
  const opts = Object.assign({}, stdOpts, userOpts);

  const buf = ['digraph {'];

  buf.push(opts.pre);

  for (const from in graph) {
    const gf = graph[from];

    let terminal = false;
    if (gf == null) terminal = true;
    else if ('ENTER' in gf || 'LEAVE' in gf) {
      const n = Object.keys(gf).length;
      terminal = n < 2 || (n < 3 && 'ENTER' in gf && 'LEAVE' in gf);
    }
    if (terminal) {
      buf.push(`    ${from} ${opts.terminal}`);
      continue;
    } else if (from === initial) {
      buf.push(`    ${from} ${opts.initial}`);
    }

    for (const edge in gf) {
      if (edge !== 'ENTER' && edge !== 'LEAVE') {
        const gfe = /** @type {Machine.Edge}*/ (gf)[edge];
        for (const to of gfe.to) {
          buf.push(`    ${from} -> ${to} [label="${edge}"]`);
        }
      }
    }
  }

  buf.push(opts.post);

  buf.push('}');
  return buf.join('\n');
}
