
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



define('lib/extractor',['coop'], function (coop) {

	var Extractor = new coop.Class({
		extract: function (key, item) {
			return item[key];
		}
	});

	return Extractor;
});




define('lib/filter',['coop', './extractor'], function (coop, Extractor) {

    var Filter = new coop.Class([Extractor], {
        __isFilter: true,

        initialize: function (key, value) {
            this.key = key;
            this.value = value;
        },

        inverse: function () {
            return new Filter.filters[this.inverseName](this.key, this.value)
        },

        valueFrom: function (item, extractor) {
            return (extractor || this).extract(this.key, item);
        },

        // Set inclusion checks
        includes: function (other, converse) {
            if ( this._includes && other.__isFilter ) {
                if ( this.key !== other.key ) {
                    return Filter.UNKNOWN;
                }

                var r = this._includes(other);
                if ( r || r === false ) return r;
            }

            if (!converse)
                return other.includedIn(this, true);
        },
        includedIn: function (other, converse) {
            if ( this._includedIn && other.__isFilter ) {
                if ( this.key !== other.key ) {
                    return Filter.UNKNOWN;
                }

                var r = this._includedIn(other);
                if ( r || r === false ) return r;
            }

            if (!converse)
                return other.includes(this, true);
        },

        toJSON: function () {
            return [ this.key, this.name, this.value ];
        },
        toString: function () {
            return this.key + ' ' + this.name + ' ' + this.value;
        }
    });

    Filter.Inverse = Filter.derived({
        isInverse: true,

        // Set inclusion - always check from non-inverted form
        _includes: function (other) {
            return this.inverse()._includedIn(other.inverse())
        },
        _includedIn: function (other) {
            return this.inverse()._includes(other.inverse())
        }
    });

    Filter.filters = {};
    Filter.define = function (name, predicate, includes, includedIn, inverseName) {
        inverseName = inverseName || 'n' + name;

        this.filters[name] = Filter.derived({
            name: name,
            inverseName: inverseName,
            matches: function (item, extractor) {
                return predicate(this.valueFrom(item, extractor), this.value, this.key);
            },
            _includes: includes,
            _includedIn: includedIn
        })
        this.filters[inverseName] = Filter.Inverse.derived({
            name: inverseName,
            inverseName: name,
            matches: function (item, extractor) {
                return !predicate(this.valueFrom(item, extractor), this.value, this.key);
            }
        })
    }

    function isEqual(value, expected) {
        return value == expected;
    }
    function isSameEquality(other) {
        if ( other.name == 'eq' ) {
            return isEqual(this.value, other.value);
        } else if ( other.name == 'neq' ) {
            return false;
        }
    }
    Filter.define('eq', isEqual, isSameEquality, function (other) {
        if ( other.name == 'neq' ) {
            return !isEqual(this.value, other.value)
        } else {
            return isSameEquality.call(this, other);
        }
    });


    // Numeric orderings
    function falseIfNumeric(other) {
        if (/[lg]t(e)?/.test(other.name)) {
            return false;
        }
    }
    Filter.define('lt', function (value, expected) {
        return value < expected;
    }, function (other) {
        if ( other.name == 'lt' ) {
            return this.value >= other.value;
        } else if ( other.name == 'lte' ) {
            return this.value > other.value;
        } else {
            return falseIfNumeric(other);
        }
    }, function (other) {
        if ( other.name.lastIndexOf('lt', 0) === 0 ) {
            return this.value <= other.value;
        } else {
            return falseIfNumeric(other);
        }
    }, 'gte');

    Filter.define('gt', function (value, expected) {
        return value > expected;
    }, function (other) {
        if ( other.name == 'gt' ) {
            return this.value <= other.value;
        } else if ( other.name == 'gte' ) {
            return this.value < other.value;
        } else {
            return falseIfNumeric(other);
        }
    }, function (other) {
        if ( other.name.lastIndexOf('gt', 0) === 0 ) {
            return this.value >= other.value;
        } else {
            return falseIfNumeric(other);
        }
    }, 'lte');



    // 'in' predicate
    function isIn(value, expected) {
        return expected.indexOf(value) >= 0;
    }
    function isSuperSet(other) {
        if ( other.name == 'eq' ) {
            return isIn(other.value, this.value);
        } else if ( other.name == 'in' ) {
            return other.value.every(function (value) {
                return isIn(value, this.value);
            }, this);
        }
    }
    function isSubSet(other) {

        // Empty set
        if ( !this.value.length ) {
            return true;
        }

        if ( other.name == 'eq' ) {
            // Singleton set - equal
            return this.value.length === 1 && isEqual(this.value[0], other.value);
        } else if ( other.name == 'neq' ) {
            return !isIn(other.value, this.value);
        } else if ( other.name == 'nin' ) {
            return !other.value.some(function (value) {
                return isIn(value, this.value);
            }, this);
        }
    }
    Filter.define('in', isIn, isSuperSet, isSubSet);


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
                return filter.matches(item, this.resource);
            }, this)
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
    SubscriptionSpec.Disjunction.build = function(resource, alternatives, optimize) {
        var filter = new SubscriptionSpec.Disjunction(resource, []);
        alternatives.forEach(function (alt) {
        	if ( !optimize || !filter.includes(alt) ) {
            	filter = filter.or(alt);
            }
        });
        return filter;
    }

    SubscriptionSpec.Filters = new coop.Class([SubscriptionSpec], {
        matches: function (item) {
            return this.spec.every(function (filter) {
                return filter.matches(item, this.resource);
            }, this)
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
        	if ( this.spec.some(function (filter) {
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
            if ( this.spec.length ) {
                return this.spec.map(function (filter) { return filter.toString() }).join(' && ');
            } else {
                return "*";
            }
        }
    });
    

    SubscriptionSpec.Decorator = SubscriptionSpec.derived({
        matches: function (item) {
            return this.spec.matches(item);
        },

        union: function (other) {
            return this.decorate(this.spec.union(other))
        },

        withFilter: function (filter) {
            return this.decorate(this.spec.withFilter(other))
        },

        inverse: function () {
            return this.decorate(this.spec.inverse())
        },

        includes: function (other, converse) {
            return this.spec.includes(other, converse);
        },
        includedIn: function (other, converse) {
            return this.spec.includedIn(other, converse);
        }
    });

    return SubscriptionSpec;
});





define('lib/resource',['coop', './subscribable', './filter', './subscriptionSpec', './extractor'],
function (coop, Subscribable, Filter, SubscriptionSpec, Extractor) {

    var Resource = new coop.Class([coop.Options, Extractor, Subscribable, Filter.Filterable], {
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
            if ( !this.subscription.includes(filter) ) {
                this.subscription = this.subscription.union(filter);
                return this.refresh();
            }
        },
        removeSubscription: function (filter) {
            var idx = this.subscriptions.indexOf(filter);
            if ( idx < 0 ) return;

            // Build a new normal form subscription
            this.subscriptions.splice(idx, 1);
            this.subscription = SubscriptionSpec.Disjunction.build(this, this.subscriptions, true);

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





define('lib/sort',['coop', './subscribable', './filter', './subscriptionSpec', './extractor'],
function (coop, Subscribable, Filter, SubscriptionSpec, Extractor) {

	var Sort = new coop.Class([Extractor], {
		compare: function (a,b, extractor) {
			var va = this.valueFrom(a, extractor),
				vb = this.valueFrom(b, extractor);
			return va < vb ? -1 : va > vb ? 1 : 0;
		}
	})

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
;


define('sub-sync',['./lib/resource', './lib/filter', './lib/subscribable', './lib/subscriptionSpec', './lib/sort'],
function (Resource, Filter, Subscribable, SubscriptionSpec, Sort) {
	return {
		Filter: Filter,
		Subscribable: Subscribable,
		SubscriptionSpec: SubscriptionSpec,
		Resource: Resource,
		Sort: Sort
	}
});
	
}));
