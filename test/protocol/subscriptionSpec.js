
var should = require("should");
var implementsPredicateProtocol = require("./predicate");
var Extractor = require("../../lib/extractor");
var Filter = require("../../lib/filter");

// For testing implementations of the SubscriptionSpec protocol

module.exports = function (SubscriptionSpecImpl, factory) {

	var f = new Filter.filters.eq("x", "y"),
		ss = factory(f),
		sse = factory(new Filter.filters.eq("x", "y")),
		fd = new Filter.filters.eq("x", "z"),
		ssd = factory(fd),
		m = [{ x: 'y' }],
		nm = [{ x: 'z' }];

	implementsPredicateProtocol(factory);

	describe('SubscriptionSpec protocol', function () {

		describe('#getAll()', function () {
			it('returns matching items', function () {
				factory(f, new MockResource(m)).getAll().should.eql(m);
			})

			it('doesn\'t return non-matching items', function () {
				factory(f, new MockResource(nm)).getAll().should.eql([]);
			})

			it('uses custom extractors', function () {
				factory(f, new MockResource(nm, function (key, item) {
					return item[key] == 'z' && 'y';
				})).getAll().should.eql(nm);
			})
		});

		describe('#all()', function () {
			it('returns an equivalent set', function () {
				var all = ss.all();
				all.includes(ss);
				all.includedIn(ss);
			})
		});

		describe('#union()', function () {
			it('returns a union of both sets', function () {
				var or = ss.union(ssd);
				or.includes(ss);
				or.includes(ssd);
			})
		});

	});
}

var MockResource = Extractor.derived({
	initialize: function (items, extractor) {
		this.getAll = function () { return items; }
		if( extractor ) this.extract = extractor;
	}
})
