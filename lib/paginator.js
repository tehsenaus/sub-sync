
if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop', './subscribable', './filter', './subscriptionSpec'],
function (coop, Subscribable, Filter, SubscriptionSpec) {

	var Paginator = new coop.Class({
		initialize: function (start, end) {
			this.start = start;
			this.end = end;
		},
		paginate: function (values) {
			return values.slice(this.start, this.end);
		},

		includes: function (paginator) {
			return this.start >= paginator.start && this.end >= paginator.end;
		},
		includedIn: function (paginator) {
			return paginator.includes(this, true);
		},

		toJSON: function () {
			return {
				start: this.start, end: this.end
			}
		}
	});
	Paginator.fromJSON = function (json) {
		if ( 'start' in json && 'end' in json ) {
			return new Paginator(json.start, json.end);
		}
	}

	Paginator.PaginatedSubscription = SubscriptionSpec.Decorator.derived({
		initialize: function (paginator, resource, spec) {
			this.super_co(arguments, 1);

			this.paginator = paginator;
		},

		getAll: function () {
			return this.paginator.paginate(this.spec.getAll());
		},

		toJSON: function () {
			return {
				paginate: this.paginator.toJSON(),
				values: this.spec.toJSON()
			}
		},

		includes: function (other, converse) {
			if ( Paginator.PaginatedSubscription.isinstance(other) ) {
				// Comparing two pages. Underlying set must be the same.
				return this.spec.equals(other.spec) && this.paginator.includes(other.paginator);
			}

			if (!converse)
				return other.includedIn(this, true);
		},
		includedIn: function (other, converse) {
			if ( Paginator.PaginatedSubscription.isinstance(other) ) {
				// Comparing two pages. Underlying set must be the same.
				return this.spec.equals(other.spec) && this.paginator.includedIn(other.paginator);
			} else if ( this.spec.includedIn(other) ) {
				// If this is a page onto a subset of the other, then we are a subset too.
				return true;
			}

			if (!converse)
				return other.includes(this, true);	
		},

		decorate: function (spec) {
			return new Paginator.PaginatedSubscription(this.paginator, this.resource, spec);
		},

		toString: function () {
			return "{ " + this.spec.toString() + " }[" + this.paginator.toString() + "]"
		}
	})

	// Parser
	SubscriptionSpec.fromJSONHandlers.push(function (resource, json) {
        if ( json.paginate ) {
        	var paginate = Paginator.fromJSON(json.paginate),
        		values = SubscriptionSpec.fromJSON(resource, json.values);

        	if ( !paginate ) {
        		console.log("Paginator not supported:", json.paginate);
        		return values;
        	}

            return new Paginator.PaginatedSubscription(paginate, resource, values);
        }
    })

	SubscriptionSpec.implement({
		slice: function (start, end) {
			var paginator = new Paginator(start, end);
			var spec = this;

			return new Paginator.PaginatedSubscription(paginator, this.resource, spec);
		}
	})

	return Paginator;
})
