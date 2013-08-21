if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop'], function (coop) {

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
