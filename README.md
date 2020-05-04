# State Machine

A minimally practical state machine in JavaScript developed to organize asynchronous systems.

- Minimal: 400 bytes minified. 250 bytes gzipped.
- Practical: Low friction to adopt. It should provide enough value to warrant its inclusion.
- JavaScript: Runs in the browser and Nodejs
- Organize asynchronous systems: It enforces the minimal structure to ease development and maintenance of systems based on asynchronous events.

## Installation

`npm install --save @deadb17/state-machine`

## Example

### Define a graph

Start by defining a graph with a plain JavaScript object.

```javascript
/** @type {Machine.Graph} */
const g = {
  a: {
    ENTER: callback,
    go: { to: ['b'], call: callback },
    loop: { to: ['a'], call: callback },
    end: { to: ['c'], call: callback },
    LEAVE: callback,
  },
  b: {
    ENTER: callback,
    go: { to: ['a'], call: callback },
    LEAVE: callback,
  },
  c: null,
};
```

Its keys (`a`, `b` and `c`) represent the _current state_.

Their value is another object where the keys are the _events_ that the current state responds to.

The value is another object with two keys: `to` and `call`:

- `to` is an array of all the possible end states (one of the top level keys: `a`, `b` and `c` here).
- `call` is a callback function that picks which of the states in `to` should become the next state.

There are two special events: `ENTER` and `LEAVE` which get called automatically.

- `ENTER` is called when the state is entered regardless of the previous state.
- `LEAVE` is called when the state is left regardless of the next state.
  The value for both is a callback function with the same signature as `call` but it doesn't return any value.

Finally, states with null values or that only respond to `ENTER` events are considered terminal states.

### Define the callback

Next define the callback for each state transition. Here, the same one is reused for simplicity.

```javascript
/** @type {Machine.Call<Store>} */
function callback(machine, toStates, { type }) {
  machine.count++;
  machine.stack.push(`${type}: ${machine.state} -> ${toStates[0]}`);
  return toStates[0];
}
```

The callback takes three parameters:

1. The _machine_ itself: All machines have the same interface. Each machine can have specific additional properties.
2. An array of possible _next states_. The callback must return one of them.
3. The _event_ that triggered the call.

#### Machine interface

```typescript
type Machine = Readonly<{
  graph: Graph;
  state: State;
  handleEvent: (event: MiniEvent) => void;
}>;

type MiniEvent = { readonly type: string } | Event;
```

### Create a machine

```javascript
import { createMachine } from './index.js';

const m0 = createMachine(g, 'a');
```

`createMachine` takes the graph that was defined previously and the initial state as a string.

Optionally, extend the machine with custom properties

```javascript
/**
 * @typedef {object} Store
 * @prop {number} count
 * @prop {string[]} stack
 */
/** @type {Store} */
const s0 = { count: 0, stack: [] };

/** @type {Machine.Machine & Store} */
const m = Object.assign(m0, s0);
```

this results in a machine with the following properties:

```javascript
assert.equal(m.state, 'a');
assert.equal(m.graph, g);
assert.equal(m.count, 0);
assert.deepEqual(m.stack, []);
```

Notice that `a.ENTER` didn't get called in this case as the machine is not transitioning from another state when it is started. It will get called later when it is a transition.

### Send events

Sending the `go` event:

```javascript
m.handleEvent({ type: 'go' });
```

Results in:

- Transitioning to state `b`.
- Increment the counter to `3`, meaning that three calls were made:

  1. `go` when going from `a` to `b`.
  2. `LEAVE` when going from `a` to `b`.
  3. `ENTER` when going from `a` to `b`.

```javascript
assert.equal(m.state, 'b');
assert.equal(m.count, 3);
assert.deepEqual(m.stack, ['go: a -> b', 'LEAVE: a -> b', 'ENTER: a -> b']);
```

Sending the `go` event now:

```javascript
m.handleEvent({ type: 'go' });
assert.equal(m.state, 'a');
assert.equal(m.count, 6);
assert.deepEqual(m.stack, [
  'go: a -> b',
  'LEAVE: a -> b',
  'ENTER: a -> b',
  'go: b -> a',
  'LEAVE: b -> a',
  'ENTER: b -> a',
]);
```

Sending the `loop` event:

```javascript
m.handleEvent({ type: 'loop' });
assert.equal(m.state, 'a');
assert.equal(m.count, 7);
assert.deepEqual(m.stack, [
  'go: a -> b',
  'LEAVE: a -> b',
  'ENTER: a -> b',
  'go: b -> a',
  'LEAVE: b -> a',
  'ENTER: b -> a',
  'loop: a -> a',
]);
```

Sending the `end` event:

```javascript
m.handleEvent({ type: 'end' });
assert.equal(m.state, 'c');
assert.equal(m.count, 9);
assert.deepEqual(m.stack, [
  'go: a -> b',
  'LEAVE: a -> b',
  'ENTER: a -> b',
  'go: b -> a',
  'LEAVE: b -> a',
  'ENTER: b -> a',
  'loop: a -> a',
  'end: a -> c',
  'LEAVE: a -> c',
]);
```

In terminal state nothing else can happen:

```javascript
m.handleEvent({ type: 'go' });
m.handleEvent({ type: 'LEAVE' });
m.handleEvent({ type: 'ENTER' });
assert.equal(m.state, 'c');
assert.equal(m.count, 9);
```

---

_state-machine_ Copyright 2020 © DEADB17 <DEADB17@gmail.com>.  
Distributed under the [GNU LGPLv3](LICENSE).
