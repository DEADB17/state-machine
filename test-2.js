/*eslint-disable no-magic-numbers, quote-props, no-console*/
/*eslint indent: ["warn", 2, {"CallExpression": {"arguments": "first"}}]*/
/*eslint-env node*/

import { test } from 'tape';
import { create, NEXT} from './index-2.js';

const edges = {
  'a': ['b'],
  'b': ['c', 'd'],
  'c': ['b'],
  'd': [],
};
const init = 'a';
const transition = (_stage, _from, _to, data) => data;
const error = console.error;
const data = {};

test('', t => {
  const g = create(edges, init, transition, error, data);
  g.to(NEXT);
  t.same(g.current, 'b');
  g.to('c');
  t.same(g.current, 'c');
  g.to(NEXT);
  t.same(g.current, 'b');
  g.to('d');
  t.same(g.current, 'd');
  g.to(NEXT);
  t.same(g.current, 'd');

  t.end();
});
