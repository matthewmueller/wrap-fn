/**
 * Module Dependencies
 */

var support = require('generator-support');
var assert = require('assert');
var wrap = require('..');

/**
 * Tests
 */

describe('wrap-fn', function() {

  describe('noop', function() {
    it('should work if fn is undefined', function(done) {

      function next(err, a, b) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        assert(!err);
        done();
      }

      wrap(null, next).call({ ctx: 'ctx'}, 'a', 'b');
    })
  })

  describe('sync', function() {
    it('should pass args and preserve context', function(done) {
      var called = 0;

      function sync(a, b) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        called++;
        return 'a';
      }

      function next(err, a) {
        assert('a' == a);
        assert(called);
        assert(!err);
        done();
      }

      wrap(sync, next).call({ ctx: 'ctx' }, 'a', 'b')
    });

    it('handle errors', function(done) {
      var called = 0;

      function sync(a, b) {
        called++;
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);

        return new Error('some error');
      }

      function next(err) {
        assert(err);
        assert(called);
        assert('some error' == err.message);
        done();
      }

      wrap(sync, next).call({ ctx: 'ctx' }, 'a', 'b')
    });
  })

  describe('async', function(done) {
    it('should pass args and preserve context', function(done) {
      var called = 0;

      function sync(a, b, fn) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        called++;
        fn(null, a, b)
      }

      function next(err, a, b) {
        assert(!err);
        assert(called);
        assert('a' == a);
        assert('b' == b);
        done();
      }

      wrap(sync, next).call({ ctx: 'ctx' }, 'a', 'b')
    });

    it('handle errors', function(done) {
      var called = 0;

      function sync(a, b, fn) {
        called++;
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        fn(new Error('some error'));
      }

      function next(err, a, b) {
        assert(err);
        assert(called);
        assert('some error' == err.message);
        done();
      }

      wrap(sync, next).call({ ctx: 'ctx' }, 'a', 'b')
    });
  })

  describe('generator', function() {
    it('should pass args and preserve context', function(done) {
      var called = 0;

      function *gen(a, b) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        yield wait(100);
        called++;
        return a;
      }

      function next(err, a) {
        assert(!err);
        assert(called);
        assert('a' == a);
        done();
      }

      wrap(gen, next).call({ ctx: 'ctx' }, 'a', 'b')
    });

    it('handle errors', function(done) {
      var called = 0;

      function *gen(a, b) {
        called++;
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        throw new Error('some error');
        return a;
      }

      function next(err, a) {
        assert(!a);
        assert(err);
        assert(called);
        assert('some error' == err.message);
        done();
      }

      wrap(gen, next).call({ ctx: 'ctx' }, 'a', 'b')
    });
  })

});

function wait(ms) {
  return function(fn) {
    setTimeout(fn, ms);
  }
}


