var should = require("should")

var Filter = require("../lib/filter");

describe('Filter', function() {

	var f = new Filter.filters['eq']('x', 'y');
	
	describe('eq', function(){
		var f2 = new Filter.filters['eq']('x', 'y');
		var f3 = new Filter.filters['eq']('x', 'z')
		var fy = new Filter.filters['eq']('y', 'y')

		itIncludes( function(includes){

		    it('should match on equal keys and values', function(){
				includes(f,f2).should.equal(true);
		    })

		    it('should return false on unequal values', function(){
				includes(f,f3).should.equal(false);
		    })

		    it('should return Filter.UNKNOWN on unequal keys', function(){
				should.strictEqual(includes(f,fy), Filter.UNKNOWN);
		    })

		    it('should return Filter.UNKNOWN on unequal keys', function(){
				should.strictEqual(includes(f,fy), Filter.UNKNOWN);
		    })
		})
	    
	})


	describe('neq', function(){

		var fi = f.inverse();
	  	var f2 = new Filter.filters['eq']('x', 'y')
		var f3 = new Filter.filters['eq']('x', 'z')

	    itIncludes( function(includes){

	    	it('should not include same key', function(){
				includes(fi,f2).should.equal(false);
		    })

		    it('should include different key', function(){
				includes(fi,f3).should.equal(true);
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


function itIncludes(fn) {
	describe('#includes()', function () {
		fn(function (a, b) {
			return a.includes(b)
		});
	});

	describe('#includedIn()', function () {
		fn(function (a, b) {
			return b.includedIn(a)
		});
	});
}

