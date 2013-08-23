var should = require("should"),
	implementsSubscriptionSpecProtocol = require("./protocol/subscriptionSpec");

var Filter = require("../lib/filter"),
	SubscriptionSpec = require("../lib/subscriptionSpec"),
	Paginator = require("../lib/paginator");

var set = new (SubscriptionSpec.Filters.derived({
	getAll: function () {
		return [2,3,1].map(function (x) {
			return { x: x }
		});
	}
}))(null, []);


describe('Paginator.PaginatedSubscription', function () {

	

	implementsSubscriptionSpecProtocol(Paginator.PaginatedSubscription, function (filter, resource) {
		var pg = new Paginator(0,10);

		return new Paginator.PaginatedSubscription(pg, resource, new SubscriptionSpec.Disjunction(resource, [filter]));
	})



})
