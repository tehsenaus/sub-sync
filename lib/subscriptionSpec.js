
if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop', './subscribable', './filter'], function (coop, Subscribable, Filter) {

    var SubscriptionSpec = new coop.Class([Subscribable, Filter.Filterable], {
        initialize: function (resource, spec) {
            this.resource = resource;
            this.spec = spec;
        },

        all: function () {
            return this;
        },
        or: function (alternative) {
            return new SubscriptionSpec.Disjunction(this.resource, [this, alternative(this.resource)]);
        },
        not: function (condition) {
            return this.withFilter(condition(this).inverse())
        },

        getAll: function () {
            return this.resource.getAll().filter(this.matches, this)
        },

        subscribe: function () {
            var subscription = this.super.apply(this, arguments);

            subscription.filter = this;

            this.resource.addSubscription(this);
            subscription.dispose = function () {
                this.filter.resource.removeSubscription(this.filter);
            }
            subscription.refresh = function () {
                return this.filter.resource.refresh();
            }

            return subscription;
        },

        toJSON: function () {
            return this.spec.map(function (filter) {
                return filter.toJSON();
            });
        }
    });

    SubscriptionSpec.Disjunction = new coop.Class([SubscriptionSpec], {
        or: function (alternative) {
            return this.union(alternative(this.resource));
        },
        union: function (other) {
            var alts;
            if ( SubscriptionSpec.Disjunction.isinstance(other) ) {
                alts = other.spec;
            } else {
                alts = [ other ]
            }

            return new SubscriptionSpec.Disjunction(this.resource, this.spec.concat(alts));
        },

        getAll: function () {
            return this.resource.getAll().filter(this.matches, this)
        },
        matches: function (item) {
            return this.spec.some(function (filter) {
                return filter.matches(item);
            })
        },

        withFilter: function (filter) {
            return new SubscriptionSpec.Disjunction(this.resource, this.spec.map(function (alt) {
                return alt.withFilter(filter);
            }));
        },

        inverse: function () {
            var inverse = this.spec[0].inverse();
            for ( var i = 1; i < this.spec.length; i++ ) {
                console.log(inverse.toString());
                inverse = inverse.withFilter(this.spec[i].inverse());
            }
            return inverse;
        },


        includes: function (other, converse) {
        	// For a disjunction, if any disjunct includes the other,
        	// we are good.
        	if ( this.spec.some(function (filter) {
        		return filter.includes(other);
        	})) {
        		return true;
        	}

        	if (!converse)
        		return other.includedIn(this, true);
        },
        includedIn: function (other, converse) {
        	// If each disjunct is included in the other,
        	// we must be too.
        	if ( this.spec.every(function (filter) {
        		return filter.includedIn(other);
        	})) {
        		return true;
        	}

        	if (!converse)
        		return other.includes(this, true);
        },

        isEmpty: function () {
            return this.spec.length == 0;
        },

        toJSON: function () {
            return this.spec.length == 1 ? this.spec[0].toJSON() : { any: this.super() };
        },
        toString: function () {
            return this.spec.map(function (filter) { return '( ' + filter.toString() + ' )' }).join(' || ');
        }
    });
    SubscriptionSpec.Disjunction.build = function(resource, alternatives) {
        var filter = new SubscriptionSpec.Disjunction(resource, []);
        alternatives.forEach(function (alt) {
            filter = filter.or(alt);
        });
        return filter;
    }

    SubscriptionSpec.Filters = new coop.Class([SubscriptionSpec], {
        matches: function (item) {
            return this.spec.every(function (filter) {
                return filter.matches(item);
            })
        },

        union: function (other) {
            return new SubscriptionSpec.Disjunction(this.resource, [this, other]);
        },

        withFilter: function (filter) {
            return new SubscriptionSpec.Filters(this.resource, this.spec.concat([filter]));
        },

        inverse: function () {
            return new SubscriptionSpec.Disjunction(this.resource, this.spec.map(function (filter) {
                return new SubscriptionSpec.Filters(this.resource, [ filter.inverse() ]);
            }, this));
        },

        includes: function (other, converse) {
        	// For a conjunction, if every filter includes the other
        	// set, we must too.
        	if ( this.spec.every(function (filter) {
        		return filter.includes(other);
        	})) {
        		return true;
        	}

        	if (!converse)
        		return other.includedIn(this, true);
        },
        includedIn: function (other, converse) {
        	// If any conjunct is included in the other,
        	// we must be too.
        	if ( this.spec.any(function (filter) {
        		return filter.includedIn(other);
        	})) {
        		return true;
        	}

        	if (!converse)
        		return other.includes(this, true);
        },

        toJSON: function () {
            return this.spec.length == 1 ? this.spec[0].toJSON() : { all: this.super() }
        },
        toString: function () {
            return this.spec.map(function (filter) { return filter.toString() }).join(' && ');
        }
    });

    return SubscriptionSpec;
});
