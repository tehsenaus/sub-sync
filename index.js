if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./lib/resource', './lib/filter', './lib/subscribable', './lib/subscriptionSpec'],
function (Resource, Filter, Subscribable, SubscriptionSpec) {
	return {
		Filter: Filter,
		Subscribable: Subscribable,
		SubscriptionSpec: SubscriptionSpec,
		Resource: Resource
	}
});
