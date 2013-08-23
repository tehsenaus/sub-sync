
if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop', './subscribable', './filter', './subscriptionSpec', './extractor'],
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
            var me = this;

            this.super.apply(this, arguments);

            this.subscription = new SubscriptionSpec.Disjunction(this, []);
            this.subscriptions = [];

            this.objects = {};
            this.listeners = [];
            Resource.listeners.forEach(function (listener) {
                listener(this);
            }, this);

            var id = this.options.id;
            this.id = typeof id == 'function' ? id : function (item) {
                return item[id];
            }
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
            return Object.keys(this.objects).map(function (id) {
                return this.objects[id];
            }, this);
        },
        get: function (id) {
            if ( id in this.objects ) {
                return this.objects[id];
            } else {
                return null;
            }
        },
        setAll: function (data) {
            var numAdded = 0, numRemoved = 0, numChanged = 0, numUpdated = 0;

            data.forEach(function (item) {
                var id = this.id(item);
                if ( id in this.objects ) {
                    var object = this.objects[id],
                        newObject = this.options.update.call(this, object, item);

                    if ( object !== newObject ) {
                        this.objects[id] = newObject;
                        numChanged++;
                    } else {
                        numUpdated++;
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

            return {
                numAdded: numAdded,
                numChanged: numChanged,
                numRemoved: numRemoved,
                numUpdated: numUpdated
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
