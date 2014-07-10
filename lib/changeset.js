if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop'],
function (coop) {

	var Changeset = new coop.Class({
		initialize: function (changes) {
			this.changes = changes;
		},

		applyChanges: function (onCreate, onUpdate, onDelete) {
			this.changes.forEach(function (c) {
				c.applyChanges(onCreate, onUpdate, onDelete);
			})
		},

		toJSON: function () {
			return {
				changes: this.changes.map(function (c) {
					return c.toJSON();
				})
			}
		}
	});

	Changeset.Create = new coop.Class({
		initialize: function (objects) {
			this.objects = objects;
		},

		applyChanges: function (onCreate, onUpdate, onDelete) {
			this.objects.forEach(function (o) {
				onCreate(o);
			})
		},

		toJSON: function () {
			return {
				create: this.objects.map(function (o) {
					return o;
				})
			}
		}
	})

}
