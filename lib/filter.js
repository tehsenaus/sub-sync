if (typeof define !== 'function') { var define = require('amdefine')(module) }


define(['coop'], function (coop) {

    var Filter = new coop.Class({
        __isFilter: true,

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
            matches: function (item) {
                return predicate(this.valueFrom(item), this.value, this.key);
            },
            _includes: includes,
            _includedIn: includedIn
        })
        this.filters[inverseName] = Filter.Inverse.derived({
            name: inverseName,
            inverseName: name,
            matches: function (item) {
                return !predicate(this.valueFrom(item), this.value, this.key);
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
