if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['./lib/resource', './lib/filter', './lib/subscribable', './lib/subscriptionSpec', './lib/sort'],
function (Resource, Filter, Subscribable, SubscriptionSpec, Sort) {
	return {
		Filter: Filter,
		Subscribable: Subscribable,
		SubscriptionSpec: SubscriptionSpec,
		Resource: Resource,
		Sort: Sort
	}
});
