/**
 * @typedef {object} Opts
 * @prop {string} pre
 * @prop {string} initial
 * @prop {string} terminal
 * @prop {Record<string, Record<string, Record<string, Record<string, any>>>>} edges
 * @prop {string} post
 */

/** @type {Opts}*/
const stdOpts = {
  pre: `    graph [rankdir=LR]
    node [fontname="Trebuchet MS" fontsize=14
          color="/accent3/3" shape=box style="rounded,filled"]
    edge [fontname="Trebuchet MS" fontsize=10 arrowsize=0.7]
`,

  initial: `[color="/accent3/1"]`,
  terminal: `[color="/accent3/2"]`,
  edges: {},

  post: '',
};

/** @arg {Record<string, any> | undefined } obj */
export function props(obj) {
  const buf = [];
  for (const key in obj) buf.push(`${key}="${obj[key].toString()}"`);
  return buf.join(' ');
}

/**
 * @arg {Machine.Graph} graph
 * @arg {Machine.State} initial
 * @arg {Partial<Opts>} [userOpts]
 */
export function graphToDot(graph, initial, userOpts) {
  /** @type {Opts} */
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
          const es = opts.edges;
          let label = `label="${edge}"`;
          if (es && es[from] && es[from][edge] && es[from][edge][to]) {
            label += ' ' + props(es[from][edge][to]);
          }
          buf.push(`    ${from} -> ${to} [${label}]`);
        }
      }
    }
  }

  buf.push(opts.post);

  buf.push('}');
  return buf.join('\n');
}
