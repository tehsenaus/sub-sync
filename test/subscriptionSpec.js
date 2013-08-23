var should = require("should"),
	implementsSubscriptionSpecProtocol = require("./protocol/subscriptionSpec");

var Filter = require("../lib/filter"),
	SubscriptionSpec = require("../lib/subscriptionSpec");


describe('SubscriptionSpec.Disjunction', function () {

	implementsSubscriptionSpecProtocol(SubscriptionSpec.Disjunction, function (filter, resource) {
		return new SubscriptionSpec.Disjunction(resource, [filter]);
	})

})

describe('SubscriptionSpec.Filters', function () {

	implementsSubscriptionSpecProtocol(SubscriptionSpec.Filters, function (filter, resource) {
		return new SubscriptionSpec.Filters(resource, [filter || new Filter('x', 'eq', 'y')]);
	})

})
