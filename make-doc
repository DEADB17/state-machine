#!/usr/bin/env node

import { compileMd } from './compile-md.js';

const stdin = process.stdin;

stdin.setEncoding('utf8');

const data = [];

stdin.on('readable', () => {
  let ch;
  while ((ch = stdin.read()) !== null) data.push(ch);
});

stdin.on('end', () => {
  process.stdout.write(compileMd(data.join('')));
});
