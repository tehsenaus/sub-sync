var should = require("should"),
	implementsSubscriptionSpecProtocol = require("./protocol/subscriptionSpec");

var Filter = require("../lib/filter"),
	SubscriptionSpec = require("../lib/subscriptionSpec"),
	Sort = require("../lib/sort");

var set = new (SubscriptionSpec.Filters.derived({
	getAll: function () {
		return [2,3,1].map(function (x) {
			return { x: x }
		});
	}
}))(null, []);


describe('Sort.ByCol', function () {
	var s = new Sort.ByCol('x');

	it('extracts column', function () {
		s.valueFrom({ x: 'abc' }).should.equal('abc')
	})

	it('returns negative when in ascending order', function () {
		s.compare({ x: 1 }, { x: 2 }).should.be.within(-Infinity, -1)
	})
	it('returns positive when in descending order', function () {
		s.compare({ x: 2 }, { x: 1 }).should.be.within(1, Infinity)
	})
	it('returns zero when equal', function () {
		s.compare({ x: 1 }, { x: 1 }).should.equal(0)
	})

	it('sorts by column', function () {
		var sorted = set.sort('x');
		console.log(sorted.toJSON())
		sorted.getAll().map(function (x) { return x.x; }).should.eql([1,2,3]);
	})
});

describe('Sort.SortedSubscription', function () {

	

	implementsSubscriptionSpecProtocol(Sort.SortedSubscription, function (filter, resource) {
		var sort = new Sort.ByCol();

		return new Sort.SortedSubscription(sort, resource, new SubscriptionSpec.Disjunction(resource, [filter]));
	})



})
