const rxQuote = new RegExp(/[\\"']/g);

/** @arg {string} str */
function slash(str) {
  return str.replace(rxQuote, '\\$&');
}

const rxCompileOn = new RegExp(/^\s*```\s*(js|javascript)\s+compile/i);
const rxCompileOff = new RegExp(/^\s*```/i);

/** @arg {string} src */
export function compileMd(src) {
  const srcLines = src.split(/\r?\n/);
  const dstLines = [];

  let isCompile = false;

  for (const l of srcLines) {
    if (!isCompile && l.match(rxCompileOn)) {
      isCompile = true;
      dstLines.push('');
      continue;
    } else if (isCompile && l.match(rxCompileOff)) {
      isCompile = false;
      dstLines.push('');
      continue;
    }

    dstLines.push(isCompile ? l : `console.log('${slash(l)}');`);
  }

  return dstLines.join('\n');
}
