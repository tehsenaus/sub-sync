
if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop', './subscribable', './filter', './subscriptionSpec', './extractor'],
function (coop, Subscribable, Filter, SubscriptionSpec, Extractor) {

	var Sort = new coop.Class([Extractor], {
		compare: function (a,b, extractor) {
			var va = this.valueFrom(a, extractor),
				vb = this.valueFrom(b, extractor);
			return va < vb ? -1 : va > vb ? 1 : 0;
		}
	})
	Sort.fromJSONHandlers = [];
	Sort.fromJSON = function (json) {
		for ( var i = 0; i < this.fromJSONHandlers.length; i++ ) {
			var result = this.fromJSONHandlers[i](json);
			if ( result ) return result;
		}
	}

	Sort.ByCol = Sort.derived({
		initialize: function (col) {
			this.col = col;
		},
		
		valueFrom: function (item, extractor) {
			return (extractor || this).extract(this.col, item);
		},
		toJSON: function () {
			return {
				col: this.col
			}
		},
		toString: function () {
			return this.col
		}
	})

	Sort.SortedSubscription = SubscriptionSpec.Decorator.derived({
		initialize: function (sort, resource, spec) {
			this.super_co(arguments, 1);

			this.sort = sort;
		},

		getAll: function () {
			var resource = this.resource, sort = this.sort;
			return this.spec.getAll().slice(0).sort(function (a,b) {
				return sort.compare(a, b, resource);
			});
		},

		toJSON: function () {
			return {
				sort: this.sort.toJSON(),
				values: this.spec.toJSON()
			}
		},

		decorate: function (spec) {
			return new Sort.SortedSubscription(this.sort, this.resource, spec);
		},

		toString: function () {
			return "[ sort " + this.sort.toString() + " ]{ " + this.spec.toString() + " }"
		}
	})

	// Parser
	SubscriptionSpec.fromJSONHandlers.push(function (resource, json) {
        if ( json.sort ) {
        	var sort = Sort.fromJSON(json.sort),
        		values = SubscriptionSpec.fromJSON(resource, json.values);

        	if ( !sort ) {
        		console.log("Sort not supported:", json.sort);
        		return values;
        	}

            return new Sort.SortedSubscription(sort, resource, values);
        }
    })

	SubscriptionSpec.implement({
		sort: function (sort) {
			if ( !Sort.isinstance(sort) ) {
				sort = new Sort.ByCol(sort);
			}

			var spec = Sort.SortedSubscription.isinstance(this) ? this.spec : this;
			return new Sort.SortedSubscription(sort, this.resource, spec);
		}
	})

	return Sort;
})
