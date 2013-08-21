if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop'], function (coop) {

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
