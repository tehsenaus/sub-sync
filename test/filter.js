var should = require("should"),
	implementsPredicateProtocol = require("./protocol/predicate"),
	itIncludes = implementsPredicateProtocol.itIncludes;

var Filter = require("../lib/filter");

describe('Filter', function() {

	var f = new Filter.filters['eq']('x', 'y');
	
	implementsPredicateProtocol(function (filter) {
		return filter;
	});

	describe('#valueFrom', function(){
		it('should select property from object', function () {
			f.valueFrom({ x: 123 }).should.equal(123);
		})
	});

	describe('#valueFrom', function(){
		it('should use custom extractor', function () {
			f.valueFrom({ x: 1 }, {
				extract: function (key, item) {
					return item[key] * 10;
				}
			}).should.equal(10);
		})
	});

	describe('#matches', function(){
		it('should use custom extractor', function () {
			f.matches({ x: 1 }, {
				extract: function (key, item) {
					return 'y'
				}
			}).should.be.true;
		})
	});

	describe('eq', function(){
		var fSame = new Filter.filters['eq']('x', 'y');
		var fDisjoint = new Filter.filters['eq']('x', 'z')
		var fUnrelated = new Filter.filters['eq']('y', 'y')

		implementsPredicateProtocol.testOn(f, {
			same: fSame,
			disjoint: fDisjoint,
			unrelated: fUnrelated
		});    
	})


	describe('neq', function(){

		var fi = f.inverse();
	  	var f2 = new Filter.filters['eq']('x', 'y')
		var f3 = new Filter.filters['eq']('x', 'z')

		implementsPredicateProtocol.testOn(fi, {
			same: f2.inverse(),
			disjoint: f2
		});

	    itIncludes( function(includes){

		    it('should include different key', function(){
				includes(fi,f3).should.equal(true);
		    })

		})
	    
	})


	var fin = new Filter.filters['in']('x', ['x','y']);
	describe('in', function(){
		implementsPredicateProtocol.testOn(fin, {
			same: new Filter.filters['in']('x', ['x','y']),
			disjoint: new Filter.filters['in']('x', ['z']),
			unrelated: new Filter.filters['in']('y', ['x','y']),
			shouldMatch: {'x': 'y'},
			shouldNotMatch: {'x': 'z'}
		});

		itIncludes(function (includes) {
			it('should include eq on one of its values', function(){
				includes(fin,f).should.equal(true);
		    })
		})
	})


	var lt10 = new Filter.filters['lt']('a', 10);

	describe('lt', function(){

		var lt5 = new Filter.filters['lt']('a', 5)
		var lt20 = new Filter.filters['lt']('a', 20)
		var ltb = new Filter.filters['lt']('b', 20)

	    itIncludes( function(includes){

	    	it('should return Filter.UNKNOWN on unequal keys', function(){
				should.strictEqual(includes(lt5,ltb), Filter.UNKNOWN);
		    })

	    	it('should include itself', function(){
				includes(lt10, lt10).should.equal(true);
		    })

	    	it('should include stricter bounds', function(){
				includes(lt10, lt5).should.equal(true);
		    })

	    	it('should not include weaker bounds', function(){
				includes(lt10, lt20).should.equal(false);
		    })

		})
	    
	})

	var gt10 = new Filter.filters['gt']('a', 10);
	describe('gt', function(){

		var gt5 = new Filter.filters['gt']('a', 5)
		var gt20 = new Filter.filters['gt']('a', 20)
		var gtb = new Filter.filters['gt']('b', 20)

	    itIncludes( function(includes){

	    	it('should return Filter.UNKNOWN on unequal keys', function(){
				should.strictEqual(includes(gt10,gtb), Filter.UNKNOWN);
		    })

	    	it('should include itself', function(){
				includes(gt10, gt10).should.equal(true);
		    })

	    	it('should include stricter bounds', function(){
				includes(gt10, gt20).should.equal(true);
		    })

	    	it('should not include weaker bounds', function(){
				includes(gt10, gt5).should.equal(false);
		    })

	    	it('should return false when compared to lt', function(){
				includes(gt10,lt10).should.equal(false);
		    })
		})
	    
	})
	
	var lte10 = gt10.inverse();
	describe('lte', function(){

	    itIncludes( function(includes){

	    	it('should return true when compared to same lt', function(){
				includes(lte10,lt10).should.equal(true);
		    })

		    it('should return false when same lt compared to it', function(){
				includes(lt10,lte10).should.equal(false);
		    })
		})
	    
	})

	var gte10 = lt10.inverse();
	describe('gte', function(){

	    itIncludes( function(includes){

	    	it('should return true when compared to same gt', function(){
				includes(gte10,gt10).should.equal(true);
		    })

		    it('should return false when same gt compared to it', function(){
				includes(gt10,gte10).should.equal(false);
		    })
		})
	    
	})
});


describe('Filter.Filterable', function() {
	var f = new (Filter.Filterable.derived({
		withFilter: function (filter) {
			return filter;
		}
	}))();

	describe('#filter()', function () {
		it('should default to eq', function(){
			var filter = f.filter('x', 'y');
			filter.name.should.equal('eq');
			filter.key.should.equal('x');
			filter.value.should.equal('y');
	    })

	    it('should take custom operators', function(){
			var filter = f.filter('x', 'in', ['y']);
			filter.name.should.equal('in');
			filter.key.should.equal('x');
			filter.value.should.eql(['y']);
	    })

	    it('should throw on invalid operator', function(){
	    	(function(){
				f.filter('x', 'inxxxx', ['y']);
			}).should.throw(/^Unknown operator/);
	    })
	});
});
