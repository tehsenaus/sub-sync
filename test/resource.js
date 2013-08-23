var should = require("should");

var Resource = require("../lib/resource");


describe('Resource', function () {

	var r = new Resource({ id: 'x' }),
		data = [
			{ x: 'y' }, { x: 'z' }
		];

	describe('#id()', function () {
		
		it('extracts ids from data', function () {
			r.id(data[0]).should.equal('y')
		})

		it('defaults to \'id\'', function () {
			new Resource().id({ id: 'test' }).should.equal('test')
		})
	})

	describe('#setAll', function () {

		it('inserts data', function () {
			var r = new Resource({ id: 'x' });
			var res = r.setAll(data);
			r.getAll(data).length.should.equal(data.length);

			res.numAdded.should.equal(data.length);
			res.numChanged.should.equal(0);
			res.numRemoved.should.equal(0);
			res.numUpdated.should.equal(0);
		});

		it('updates data', function () {
			var r = new Resource({ id: 'x' });
			r.setAll(data);
			var res = r.setAll([data[0], { x: 'z', y: 'z' }]);

			r.getAll(data).length.should.equal(data.length);
			r.get('z').should.eql({ x: 'z', y: 'z' });

			res.numAdded.should.equal(0);
			res.numChanged.should.equal(1);
			res.numRemoved.should.equal(0);
			res.numUpdated.should.equal(1);
		});
	})

	describe('#get', function () {
		it('retrieves object by ID', function () {
			var r = new Resource({ id: 'x' });
			r.setAll(data);
			r.get('y').should.equal(data[0])
			r.get('z').should.equal(data[1])
		});

		it('returns null on unknown ID', function () {
			should.not.exist(r.get('xxxx'));
		});
	})

	describe('#getAll', function () {
		it('retrieves objects', function () {
			var r = new Resource({ id: 'x' });
			r.setAll(data);
			r.getAll(data).should.eql(data);
		});
	})
})
