
if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop', './subscribable', './filter', './subscriptionSpec'], function (coop, Subscribable, Filter, SubscriptionSpec) {

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
