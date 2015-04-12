'use strict';

var test = require('tape').test;
var parse = require('./parse');
var transition = require('./transition');
var create = require('./create');

var sample = [
	{ev: 'load',	from: 'none',		to: 'loading'},
	{ev: 'load',	from: 'loading',	to: 'loading'},
	{ev: 'load',	from: 'loaded',		to: 'reloading'},
	{ev: 'load',	from: 'reloading',	to: 'reloading'},

	{ev: 'fail',	from: 'loading',	to: 'none'},
	{ev: 'fail',	from: 'saving',		to: 'changed'},
	{ev: 'fail',	from: 'reloading',	to: 'loaded'},

	{ev: 'pass',	from: 'loading',	to: 'loaded'},
	{ev: 'pass',	from: 'loaded',		to: 'loaded'},
	{ev: 'pass',	from: 'saving',		to: 'loaded'},
	{ev: 'pass',	from: 'reloading',	to: 'loaded'},

	{ev: 'change',	from: 'loaded',		to: 'changed'},
	{ev: 'change',	from: 'changed',	to: 'changed'},

	{ev: 'save',	from: 'changed',	to: 'saving'}
];

test('parse', function (t) {
	var fsm = parse(sample);

	t.same(fsm.EVENT, {
		load:	'load',
		fail:	'fail',
		pass:	'pass',
		change: 'change',
		save:	'save'
	}, 'events are as expected');

	t.same(fsm.STATE, {
		none:		'none',
		loading:	'loading',
		loaded:		'loaded',
		reloading:	'reloading',
		saving:		'saving',
		changed:	'changed'
	}, 'states are as expected');

	t.same(fsm.table, {
		load: {
			none: 'loading',
			loading: 'loading',
			loaded: 'reloading',
			reloading: 'reloading'
		},
		fail: {
			loading: 'none',
			saving: 'changed',
			reloading: 'loaded'
		},
		pass: {
			loading: 'loaded',
			loaded: 'loaded',
			saving: 'loaded',
			reloading: 'loaded'
		},
		change: {
			loaded: 'changed',
			changed: 'changed'
		},
		save: {
			changed: 'saving'
		}
	}, 'table is as expected');

	t.end();
});

test('transition', function (t) {
	var fsm = parse(sample);
	var err = function (code) { return code; };

	t.is(transition(err), 'no-table', 'expected error: no-table');

	t.is(transition(err, fsm.table), 'no-event', 'expected error: no-event');

	t.is(transition(err, fsm.table, fsm.EVENT.load), 'no-transition', 'expected error: no-transition');

	t.is(transition(err, fsm.table, fsm.EVENT.load, fsm.STATE.none),
		 fsm.STATE.loading, 'expected state: ' + fsm.STATE.loading);

	t.is(transition(err, fsm.table, fsm.EVENT.save, fsm.STATE.none),
		 'no-transition', 'expected error: no-transition');

	t.end();
});

test('create', function (t) {
	var p = parse(sample);
	var err = function (code) { return code; };
	var fsm = create(p.table, p.STATE.none, err);

	t.is(fsm(), p.STATE.none);
	t.is(fsm(p.EVENT.load)(), p.STATE.loading);

	t.end();
});