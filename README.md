# Filter
## Predicate protocol
### #matches()
 #matches() returns true on match

```
p.matches(m).should.be.ok
```


 #matches() returns false on non-match

```
p.matches(nm).should.not.be.ok
```


### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


 #inverse() returns false on original match

```
pi.matches(m).should.not.be.ok;
```


 #inverse() returns true on original non-match

```
pi.matches(nm).should.be.ok;
```


### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


## #valueFrom(item, [extractor])
 #valueFrom(item, [extractor]) should select property from object

```
f.valueFrom({ x: 123 }).should.equal(123);
```


 #valueFrom(item, [extractor]) should use custom extractor

```
f.valueFrom({ x: 1 }, {
	extract: function (key, item) {
		return item[key] * 10;
	}
}).should.equal(10);
```


## #matches
 #matches should use custom extractor

```
f.matches({ x: 1 }, {
	extract: function (key, item) {
		return 'y'
	}
}).should.be.true;
```


## eq
### Predicate protocol
#### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


#### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


#### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


#### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


## neq
### Predicate protocol
#### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


#### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


#### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


#### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


### #includes()
 #includes() should include different key

```
includes(fi,f3).should.equal(true);
```


### #includedIn()
 #includedIn() should include different key

```
includes(fi,f3).should.equal(true);
```


## in
### Predicate protocol
#### #matches()
 #matches() returns true on match

```
p.matches(m).should.be.ok
```


 #matches() returns false on non-match

```
p.matches(nm).should.not.be.ok
```


#### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


#### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


#### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


 #inverse() returns false on original match

```
pi.matches(m).should.not.be.ok;
```


 #inverse() returns true on original non-match

```
pi.matches(nm).should.be.ok;
```


#### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


### #includes()
 #includes() should include eq on one of its values

```
includes(fin,f).should.equal(true);
```


### #includedIn()
 #includedIn() should include eq on one of its values

```
includes(fin,f).should.equal(true);
```


## lt
### #includes()
 #includes() should return Filter.UNKNOWN on unequal keys

```
should.strictEqual(includes(lt5,ltb), Filter.UNKNOWN);
```


 #includes() should include itself

```
includes(lt10, lt10).should.equal(true);
```


 #includes() should include stricter bounds

```
includes(lt10, lt5).should.equal(true);
```


 #includes() should not include weaker bounds

```
includes(lt10, lt20).should.equal(false);
```


### #includedIn()
 #includedIn() should return Filter.UNKNOWN on unequal keys

```
should.strictEqual(includes(lt5,ltb), Filter.UNKNOWN);
```


 #includedIn() should include itself

```
includes(lt10, lt10).should.equal(true);
```


 #includedIn() should include stricter bounds

```
includes(lt10, lt5).should.equal(true);
```


 #includedIn() should not include weaker bounds

```
includes(lt10, lt20).should.equal(false);
```


## gt
### #includes()
 #includes() should return Filter.UNKNOWN on unequal keys

```
should.strictEqual(includes(gt10,gtb), Filter.UNKNOWN);
```


 #includes() should include itself

```
includes(gt10, gt10).should.equal(true);
```


 #includes() should include stricter bounds

```
includes(gt10, gt20).should.equal(true);
```


 #includes() should not include weaker bounds

```
includes(gt10, gt5).should.equal(false);
```


 #includes() should return false when compared to lt

```
includes(gt10,lt10).should.equal(false);
```


### #includedIn()
 #includedIn() should return Filter.UNKNOWN on unequal keys

```
should.strictEqual(includes(gt10,gtb), Filter.UNKNOWN);
```


 #includedIn() should include itself

```
includes(gt10, gt10).should.equal(true);
```


 #includedIn() should include stricter bounds

```
includes(gt10, gt20).should.equal(true);
```


 #includedIn() should not include weaker bounds

```
includes(gt10, gt5).should.equal(false);
```


 #includedIn() should return false when compared to lt

```
includes(gt10,lt10).should.equal(false);
```


## lte
### #includes()
 #includes() should return true when compared to same lt

```
includes(lte10,lt10).should.equal(true);
```


 #includes() should return false when same lt compared to it

```
includes(lt10,lte10).should.equal(false);
```


### #includedIn()
 #includedIn() should return true when compared to same lt

```
includes(lte10,lt10).should.equal(true);
```


 #includedIn() should return false when same lt compared to it

```
includes(lt10,lte10).should.equal(false);
```


## gte
### #includes()
 #includes() should return true when compared to same gt

```
includes(gte10,gt10).should.equal(true);
```


 #includes() should return false when same gt compared to it

```
includes(gt10,gte10).should.equal(false);
```


### #includedIn()
 #includedIn() should return true when compared to same gt

```
includes(gte10,gt10).should.equal(true);
```


 #includedIn() should return false when same gt compared to it

```
includes(gt10,gte10).should.equal(false);
```


# Filter.Filterable
## #filter()
 #filter() should default to eq

```
var filter = f.filter('x', 'y');
filter.name.should.equal('eq');
filter.key.should.equal('x');
filter.value.should.equal('y');
```


 #filter() should take custom operators

```
var filter = f.filter('x', 'in', ['y']);
filter.name.should.equal('in');
filter.key.should.equal('x');
filter.value.should.eql(['y']);
```


 #filter() should throw on invalid operator

```
(function(){
	f.filter('x', 'inxxxx', ['y']);
}).should.throw(/^Unknown operator/);
```


# Paginator.PaginatedSubscription
## Predicate protocol
### #matches()
 #matches() returns true on match

```
p.matches(m).should.be.ok
```


 #matches() returns false on non-match

```
p.matches(nm).should.not.be.ok
```


### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


 #inverse() returns false on original match

```
pi.matches(m).should.not.be.ok;
```


 #inverse() returns true on original non-match

```
pi.matches(nm).should.be.ok;
```


### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


## SubscriptionSpec protocol
### #getAll()
 #getAll() returns matching items

```
factory(f, new MockResource(m)).getAll().should.eql(m);
```


 #getAll() doesn't return non-matching items

```
factory(f, new MockResource(nm)).getAll().should.eql([]);
```


 #getAll() uses custom extractors

```
factory(f, new MockResource(nm, function (key, item) {
	return item[key] == 'z' && 'y';
})).getAll().should.eql(nm);
```


### #all()
 #all() returns an equivalent set

```
var all = ss.all();
all.includes(ss);
all.includedIn(ss);
```


### #union()
 #union() returns a union of both sets

```
var or = ss.union(ssd);
or.includes(ss);
or.includes(ssd);
```


### #withFilter()
 #withFilter() returns an intersection of both sets

```
var and = ss.withFilter(ssd);
and.includedIn(ss);
and.includedIn(ssd);
```


### #toJSON()
 #toJSON() produces JSON representation

```
JSON.stringify(ss.toJSON()).should.be.a('string')
```


### #fromJSON()
 #fromJSON() deserializes to equal value

```
SubscriptionSpec.fromJSON(null, ss.toJSON()).equals(ss).should.be.true
```


# Resource
## #id()
 #id() extracts ids from data

```
r.id(data[0]).should.equal('y')
```


 #id() defaults to 'id'

```
new Resource().id({ id: 'test' }).should.equal('test')
```


## #setAll
 #setAll inserts data

```
var r = new Resource({ id: 'x' });
			var res = r.setAll(data);
			r.getAll(data).length.should.equal(data.length);

			res.numAdded.should.equal(data.length);
			res.numChanged.should.equal(0);
			res.numRemoved.should.equal(0);
			res.numUpdated.should.equal(0);
```


 #setAll updates data

```
var r = new Resource({ id: 'x' });
			r.setAll(data);
			var res = r.setAll([data[0], { x: 'z', y: 'z' }]);

			r.getAll(data).length.should.equal(data.length);
			r.get('z').should.eql({ x: 'z', y: 'z' });

			res.numAdded.should.equal(0);
			res.numChanged.should.equal(1);
			res.numRemoved.should.equal(0);
			res.numUpdated.should.equal(1);
```


## #get
 #get retrieves object by ID

```
var r = new Resource({ id: 'x' });
r.setAll(data);
r.get('y').should.equal(data[0])
r.get('z').should.equal(data[1])
```


 #get returns null on unknown ID

```
should.not.exist(r.get('xxxx'));
```


## #getAll
 #getAll retrieves objects

```
var r = new Resource({ id: 'x' });
r.setAll(data);
r.getAll(data).should.eql(data);
```


# Sort.ByCol
 Sort.ByCol extracts column

```
s.valueFrom({ x: 'abc' }).should.equal('abc')
```


 Sort.ByCol returns negative when in ascending order

```
s.compare({ x: 1 }, { x: 2 }).should.be.within(-Infinity, -1)
```


 Sort.ByCol returns positive when in descending order

```
s.compare({ x: 2 }, { x: 1 }).should.be.within(1, Infinity)
```


 Sort.ByCol returns zero when equal

```
s.compare({ x: 1 }, { x: 1 }).should.equal(0)
```


 Sort.ByCol sorts by column

```
var sorted = set.sort('x');
console.log(sorted.toJSON())
sorted.getAll().map(function (x) { return x.x; }).should.eql([1,2,3]);
```


# Sort.SortedSubscription
## Predicate protocol
### #matches()
 #matches() returns true on match

```
p.matches(m).should.be.ok
```


 #matches() returns false on non-match

```
p.matches(nm).should.not.be.ok
```


### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


 #inverse() returns false on original match

```
pi.matches(m).should.not.be.ok;
```


 #inverse() returns true on original non-match

```
pi.matches(nm).should.be.ok;
```


### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


## SubscriptionSpec protocol
### #getAll()
 #getAll() returns matching items

```
factory(f, new MockResource(m)).getAll().should.eql(m);
```


 #getAll() doesn't return non-matching items

```
factory(f, new MockResource(nm)).getAll().should.eql([]);
```


 #getAll() uses custom extractors

```
factory(f, new MockResource(nm, function (key, item) {
	return item[key] == 'z' && 'y';
})).getAll().should.eql(nm);
```


### #all()
 #all() returns an equivalent set

```
var all = ss.all();
all.includes(ss);
all.includedIn(ss);
```


### #union()
 #union() returns a union of both sets

```
var or = ss.union(ssd);
or.includes(ss);
or.includes(ssd);
```


### #withFilter()
 #withFilter() returns an intersection of both sets

```
var and = ss.withFilter(ssd);
and.includedIn(ss);
and.includedIn(ssd);
```


### #toJSON()
 #toJSON() produces JSON representation

```
JSON.stringify(ss.toJSON()).should.be.a('string')
```


### #fromJSON()
 #fromJSON() deserializes to equal value

```
SubscriptionSpec.fromJSON(null, ss.toJSON()).equals(ss).should.be.true
```


# SubscriptionSpec.Disjunction
## Predicate protocol
### #matches()
 #matches() returns true on match

```
p.matches(m).should.be.ok
```


 #matches() returns false on non-match

```
p.matches(nm).should.not.be.ok
```


### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


 #inverse() returns false on original match

```
pi.matches(m).should.not.be.ok;
```


 #inverse() returns true on original non-match

```
pi.matches(nm).should.be.ok;
```


### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


## SubscriptionSpec protocol
### #getAll()
 #getAll() returns matching items

```
factory(f, new MockResource(m)).getAll().should.eql(m);
```


 #getAll() doesn't return non-matching items

```
factory(f, new MockResource(nm)).getAll().should.eql([]);
```


 #getAll() uses custom extractors

```
factory(f, new MockResource(nm, function (key, item) {
	return item[key] == 'z' && 'y';
})).getAll().should.eql(nm);
```


### #all()
 #all() returns an equivalent set

```
var all = ss.all();
all.includes(ss);
all.includedIn(ss);
```


### #union()
 #union() returns a union of both sets

```
var or = ss.union(ssd);
or.includes(ss);
or.includes(ssd);
```


### #withFilter()
 #withFilter() returns an intersection of both sets

```
var and = ss.withFilter(ssd);
and.includedIn(ss);
and.includedIn(ssd);
```


### #toJSON()
 #toJSON() produces JSON representation

```
JSON.stringify(ss.toJSON()).should.be.a('string')
```


### #fromJSON()
 #fromJSON() deserializes to equal value

```
SubscriptionSpec.fromJSON(null, ss.toJSON()).equals(ss).should.be.true
```


# SubscriptionSpec.Filters
## Predicate protocol
### #matches()
 #matches() returns true on match

```
p.matches(m).should.be.ok
```


 #matches() returns false on non-match

```
p.matches(nm).should.not.be.ok
```


### #includes()
 #includes() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includes() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includes() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #includedIn()
 #includedIn() returns true on equivalent sets

```
should.strictEqual( includes(p, pe), true)
```


 #includedIn() returns falsey value on disjoint sets

```
(includes(p, pd) || false).should.not.be.ok
```


 #includedIn() returns Filter.UNKNOWN on possibly overlapping sets

```
should.strictEqual( includes(p, punr), Filter.UNKNOWN )
```


### #inverse()
 #inverse() is disjoint with original

```
(pi.includes(p) || false).should.not.be.ok;
(p.includes(pi) || false).should.not.be.ok;
```


 #inverse() returns false on original match

```
pi.matches(m).should.not.be.ok;
```


 #inverse() returns true on original non-match

```
pi.matches(nm).should.be.ok;
```


### #toString()
 #toString() returns a string

```
p.toString().should.be.a('string')
```


## SubscriptionSpec protocol
### #getAll()
 #getAll() returns matching items

```
factory(f, new MockResource(m)).getAll().should.eql(m);
```


 #getAll() doesn't return non-matching items

```
factory(f, new MockResource(nm)).getAll().should.eql([]);
```


 #getAll() uses custom extractors

```
factory(f, new MockResource(nm, function (key, item) {
	return item[key] == 'z' && 'y';
})).getAll().should.eql(nm);
```


### #all()
 #all() returns an equivalent set

```
var all = ss.all();
all.includes(ss);
all.includedIn(ss);
```


### #union()
 #union() returns a union of both sets

```
var or = ss.union(ssd);
or.includes(ss);
or.includes(ssd);
```


### #withFilter()
 #withFilter() returns an intersection of both sets

```
var and = ss.withFilter(ssd);
and.includedIn(ss);
and.includedIn(ssd);
```


### #toJSON()
 #toJSON() produces JSON representation

```
JSON.stringify(ss.toJSON()).should.be.a('string')
```


### #fromJSON()
 #fromJSON() deserializes to equal value

```
SubscriptionSpec.fromJSON(null, ss.toJSON()).equals(ss).should.be.true
```
