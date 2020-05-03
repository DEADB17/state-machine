const stdOpts = {
  pre: `
    graph [rankdir=LR]
    node [fontname="Geneva" fontsize=14
          color="/accent3/3" shape=box style="rounded,filled"]
    edge [fontname="Geneva" fontsize=10 arrowsize=0.7]
`,

  initial: `[color="/accent3/1"]`,
  terminal: `[color="/accent3/2"]`,

  post: '',
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
