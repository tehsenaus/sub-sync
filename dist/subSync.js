
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        factory(define);
    } else {
        //Browser globals case.
        var name = 'sub-sync',
            defined = {};

        if ( !root['coop'] ) {
            throw new Error(name + ": Missing dependency: coop");
        }
        defined['coop'] = root['coop'];

        factory(function (name, deps, factory) {
            var basePath = name.slice(0, name.lastIndexOf('/') + 1);

            for ( var i = 0; i < deps.length; i++ ) {
                var depPath = deps[i];

                if ( depPath[0] == '.' ) {
                    depPath = './' + basePath + depPath.slice(2);
                }
                
                var dep = defined[depPath];
                if (!dep) {
                    throw new Error(name + ": undefined module - " + depPath);
                }
                deps[i] = dep;
            }

            defined['./' + name] = factory.apply(this, deps);
        });

        root['subSync'] = defined['./sub-sync'];
    }
}(this, function (define) {
    




define('lib/subscribable',['coop'], function (coop) {

	var Subscribable = new coop.Class({
        subscribe: function () {
            return this.createSubscription();
        },
        createSubscription: function () {
            return function () {
                return this.getAll();
            }
        }
    });

	return Subscribable;
});




define('lib/filter',['coop'], function (coop) {

    var Filter = new coop.Class({
        initialize: function (key, value) {
            this.key = key;
            this.value = value;
        },
        valueFrom: function (item) {
            return item[this.key];
        },
        inverse: function () {
            return new Filter.filters[this.inverseName](this.key, this.value)
        },
        toJSON: function () {
            return [ this.key, this.name, this.value ];
        },
        toString: function () {
            return this.key + ' ' + this.name + ' ' + this.value;
        }
    });
    Filter.filters = {};
    Filter.define = function (name, predicate, inverseName) {
        inverseName = inverseName || 'n' + name;
        this.filters[name] = Filter.derived({
            name: name,
            inverseName: inverseName,
            matches: function (item) {
                return predicate(this.valueFrom(item), this.value, this.key);
            }
        })
        this.filters[inverseName] = Filter.derived({
            name: inverseName,
            inverseName: name,
            matches: function (item) {
                return !predicate(this.valueFrom(item), this.value, this.key);
            }
        })
    }

    Filter.define('eq', function (value, expected) {
        return value == expected;
    });
    Filter.define('eq', function (value, expected) {
        return value == expected;
    });
    Filter.define('lt', function (value, expected) {
        return value < expected;
    }, 'gte');
    Filter.define('gt', function (value, expected) {
        return value > expected;
    }, 'lte');
    Filter.define('in', function (value, expected) {
        return expected.indexOf(value) >= 0;
    });

    Filter.Filterable = new coop.Class({
        filter: function (key, operator, value) {
            if ( value === undefined ) {
                value = operator;
                operator = 'eq';
            }

            if ( !(operator in Filter.filters ) ) {
                throw new Error("Unknown operator: " + operator);
            }

            return this.withFilter(new Filter.filters[operator](key, value));
        }
    });

    return Filter;
});





define('lib/subscriptionSpec',['coop', './subscribable', './filter'], function (coop, Subscribable, Filter) {

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

        toJSON: function () {
            return this.spec.length == 1 ? this.spec[0].toJSON() : { all: this.super() }
        },
        toString: function () {
            return this.spec.map(function (filter) { return filter.toString() }).join(' && ');
        }
    });

    return SubscriptionSpec;
});





define('lib/resource',['coop', './subscribable', './filter', './subscriptionSpec'], function (coop, Subscribable, Filter, SubscriptionSpec) {

    var Resource = new coop.Class([coop.Options, Subscribable, Filter.Filterable], {
        options: {
            id: function (data) {
                return data.id;
            },
            ctor: function (data) {
                if ( this.options.ViewModel ) {
                    return new this.options.ViewModel(data, this)
                } else {
                    return data;
                }
            },
            update: function (item, data) {
                if ( this.options.ViewModel ) {
                    return item.update(data) || item;
                } else {
                    return data;
                }
            }
        },

        initialize: function (options) {
            this.super.apply(this, arguments);

            this.subscription = new SubscriptionSpec.Disjunction(this, []);
            this.subscriptions = [];

            this.objects = {};
            this.listeners = [];
            Resource.listeners.forEach(function (listener) {
                listener(this);
            }, this);
        },

        all: function () {
            return new SubscriptionSpec.Filters(this, []);
        },

        subscribe: function () {
            return this.all().subscribe();
        },
        addSubscription: function (filter) {
            this.subscriptions.push(filter);
            this.subscription = this.subscription.union(filter);
            return this.refresh();
        },
        removeSubscription: function (filter) {
            var idx = this.subscriptions.indexOf(filter);
            if ( idx < 0 ) return;

            // Build a new normal form subscription
            this.subscriptions.splice(idx, 1);
            this.subscription = SubscriptionSpec.Disjunction.build(this, this.subscriptions);

            return this.refresh();
        },
        refresh: function () {

        },

        getAll: function () {
            this.rev();
            return Object.keys(this.objects).map(function (id) {
                return this.objects[id];
            }, this);
        },
        get: function (id) {
            if ( id in this.objects ) {
                this.remRev();
                return this.objects[id];
            } else {
                this.addRev();
                return null;
            }
        },
        setAll: function (data) {
            var numAdded = 0, numRemoved = 0, numChanged = 0;

            data.forEach(function (item) {
                var id = this.options.id.call(this, item);
                if ( id in this.objects ) {
                    var object = this.objects[id],
                        newObject = this.options.update.call(this, object, item);

                    if ( object !== newObject ) {
                        this.objects[id] = newObject;
                        numChanged++;
                    }
                } else {
                    this.objects[id] = this.options.ctor.call(this, item);
                    numAdded++;
                }
            }, this);

            // TODO: removal
            if ( data.length < Object.keys(this.objects).length ) {

            }

            if ( numAdded ) {
                this.listeners.forEach(function (listener) {
                    listener.onObjectsAdded()
                })
            }
            if ( numRemoved || numChanged ) {
                this.listeners.forEach(function (listener) {
                    listener.onObjectsRemoved()
                })
            }
        },

        withFilter: function (filter) {
            return new SubscriptionSpec.Filters(this, [
                filter
            ]);
        }
    });
    Resource.listeners = [];

    return Resource;
});



define('sub-sync',['./lib/resource', './lib/filter', './lib/subscribable', './lib/subscriptionSpec'],
function (Resource, Filter, Subscribable, SubscriptionSpec) {
	return {
		Filter: Filter,
		Subscribable: Subscribable,
		SubscriptionSpec: SubscriptionSpec,
		Resource: Resource
	}
});
	
}));
