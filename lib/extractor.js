if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(['coop'], function (coop) {

	var Extractor = new coop.Class({
		extract: function (key, item) {
			return item[key];
		}
	});

	return Extractor;
});
