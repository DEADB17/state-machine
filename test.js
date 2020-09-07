import { strict as assert } from 'assert';

// /////////////////////////////////////////////////////////////////////////////
// graph-to-dot
// /////////////////////////////////////////////////////////////////////////////

import { graphToDot, props } from './graph-to-dot.js';

assert.equal('a="1" b="true" c="str"', props({ a: 1, b: true, c: 'str' }));
assert.equal('', props(undefined));

/** @type {Call<void>} */
function call(_m, t, _e) {
  return t[0];
}

/** @type {Graph} */
const g2 = {
  noLib: {
    libLoaded: { to: ['noDom'], call },
  },
  noDom: {
    domContentLoaded: { to: ['formReady'], call },
  },
  formReady: {
    ENTER: call,
    change: { to: ['formValid', 'formInvalid'], call },
  },
  formValid: {
    ENTER: call,
    change: { to: ['formValid', 'formInvalid'], call },
    submit: { to: ['submitting'], call },
  },
  formInvalid: {
    ENTER: call,
    change: { to: ['formValid', 'formInvalid'], call },
  },
  submitting: {
    ENTER: call,
    LEAVE: call,
    progress: { to: ['submitting'], call },
    netError: { to: ['formValid'], call },
    '5XX': { to: ['formValid'], call },
    '4XX': { to: ['formInvalid'], call },
    200: { to: ['thankYou'], call },
  },
  thankYou: {
    ENTER: call,
  },
};

const expectedDot = `digraph {
    graph [rankdir=LR]
    node [fontname="Trebuchet MS" fontsize=14
          color="/accent3/3" shape=box style="rounded,filled"]
    edge [fontname="Trebuchet MS" fontsize=10 arrowsize=0.7]

    noLib [color="/accent3/1"]
    noLib -> noDom [label="libLoaded"]
    noDom -> formReady [label="domContentLoaded"]
    formReady -> formValid [label="change"]
    formReady -> formInvalid [label="change"]
    formValid -> formValid [label="change" tailport="s"]
    formValid -> formInvalid [label="change"]
    formValid -> submitting [label="submit"]
    formInvalid -> formValid [label="change"]
    formInvalid -> formInvalid [label="change"]
    submitting -> thankYou [label="200"]
    submitting -> submitting [label="progress"]
    submitting -> formValid [label="netError"]
    submitting -> formValid [label="5XX"]
    submitting -> formInvalid [label="4XX"]
    thankYou [color="/accent3/2"]

    { rank=same noLib noDom formReady }
    { rank=same formValid formInvalid }
}`;

const opts = {
  edges: {
    formValid: {
      change: {
        formValid: { tailport: 's' },
      },
    },
  },
  post: `
    { rank=same noLib noDom formReady }
    { rank=same formValid formInvalid }`,
};

assert.equal(graphToDot(g2, 'noLib', opts), expectedDot);

// /////////////////////////////////////////////////////////////////////////////
// compile-md
// /////////////////////////////////////////////////////////////////////////////

import { compileMd } from './compile-md.js';

const src = `
# Title

para

## Sub

\`\`\`javascript
const msg = 'Hello Documentation';
console.log(msg);
\`\`\`

\`\`\`javascript code
const msg = '## Hello Compilation';
console.log(msg);
\`\`\`

\`\`\`javascript both
const msg2 = '## Hello Text **and** code';
console.log(msg2);
\`\`\`
`;

const expectedMd =
  "console.log('');\n" +
  "console.log('# Title');\n" +
  "console.log('');\n" +
  "console.log('para');\n" +
  "console.log('');\n" +
  "console.log('## Sub');\n" +
  "console.log('');\n" +
  "console.log('```javascript');\n" +
  "console.log('const msg = \\'Hello Documentation\\';');\n" +
  "console.log('console.log(msg);');\n" +
  "console.log('```');\n" +
  "console.log('');\n" +
  "const msg = '## Hello Compilation';\n" +
  'console.log(msg);\n' +
  "console.log('');\n" +
  "console.log('```javascript');\n" +
  "console.log('const msg2 = \\'## Hello Text **and** code\\';');\n" +
  "console.log('console.log(msg2);');\n" +
  "console.log('```');\n" +
  "const msg2 = '## Hello Text **and** code';\n" +
  'console.log(msg2);\n' +
  "console.log('');";

assert.equal(compileMd(src), expectedMd);
