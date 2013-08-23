
var should = require("should");

var Filter = require("../../lib/filter");

// For testing implementations of the Predicate protocol

module.exports = function (factory) {

	var p = factory(new Filter.filters['eq']("x", "y"));

	testOn(p, {
		same: factory(new Filter.filters['eq']("x", "y")),
		disjoint: factory(new Filter.filters['eq']("x", "z")),
		unrelated: factory(new Filter.filters['eq']("y", "z")),
		shouldMatch: { x: 'y' },
		shouldNotMatch: { x: 'z' }
	});
}

function testOn(p, predicates) {

	var pe = predicates.same,
		pd = predicates.disjoint,
		punr = predicates.unrelated,
		m = predicates.shouldMatch,
		nm = predicates.shouldNotMatch;

	describe('Predicate protocol', function () {

		if(m) describe('#matches()', function () {
			it('returns true on match', function () {
				p.matches(m).should.be.ok
			})

			if(nm) it('returns false on non-match', function () {
				p.matches(nm).should.not.be.ok
			})
		})

		itIncludes(function (includes) {
			it('returns true on equivalent sets', function () {
				should.strictEqual( includes(p, pe), true)
			})

			it('returns falsey value on disjoint sets', function () {
				(includes(p, pd) || false).should.not.be.ok
			})

			if (punr) it('returns Filter.UNKNOWN on possibly overlapping sets', function () {
				should.strictEqual( includes(p, punr), Filter.UNKNOWN )
			})
		});


		var pi = p.inverse();

		describe('#inverse()', function () {
			it('is disjoint with original', function () {
				(pi.includes(p) || false).should.not.be.ok;
				(p.includes(pi) || false).should.not.be.ok;
			})

			if(m) it('returns false on original match', function () {
				pi.matches(m).should.not.be.ok;
			})

			if(nm) it('returns true on original non-match', function () {
				pi.matches(nm).should.be.ok;
			})
		})
	});
}
module.exports.testOn = testOn;


function itIncludes(fn) {
	describe('#includes()', function () {
		fn(function (a, b) {
			return a.includes(b)
		});
	});

	describe('#includedIn()', function () {
		fn(function (a, b) {
			return b.includedIn(a)
		});
	});
}
module.exports.itIncludes = itIncludes;


