const rxQuote = new RegExp(/[\\"']/g);

/** @arg {string} str */
function slash(str) {
  return str.replace(rxQuote, '\\$&');
}

const rxBothOn = new RegExp(/^\s*```\s*(js|javascript)\s+both/i);
const rxCodeOn = new RegExp(/^\s*```\s*(js|javascript)\s+code/i);
const rxOff = new RegExp(/^\s*```\s*$/);

/** @arg {string} src */
export function compileMd(src) {
  const srcLines = src.split(/\r?\n/);
  const outLines = [];

  /** @type {'text' | 'code' | 'both'} */
  let state = 'text';
  let text = [];
  let code = [];

  for (const l of srcLines) {
    if (l.match(rxCodeOn)) {
      state = 'code';
      continue;
    } else if (l.match(rxBothOn)) {
      if (state === 'text' || state === 'both') {
        text.push("console.log('```javascript');");
      }
      state = 'both';
      continue;
    } else if (l.match(rxOff)) {
      if (state === 'text' || state === 'both') {
        text.push("console.log('```');");
      }
      outLines.push(text.join('\n'));
      text = [];
      if (0 < code.length) {
        outLines.push(code.join('\n'));
        code = [];
      }
      state = 'text';
      continue;
    }

    if (state === 'text' || state === 'both') {
      text.push(`console.log('${slash(l)}');`);
    }
    if (state === 'code' || state === 'both') code.push(l);
  }

  if (0 < text.length) outLines.push(text.join('\n'));
  if (0 < code.length) outLines.push(code.join('\n'));
  return outLines.join('\n');
}
