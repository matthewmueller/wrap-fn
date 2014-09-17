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

    it('catch synchronous errors', function(done) {
      var called = 0;

      function sync(a, b) {
        called++;
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);

        throw new Error('some error');
      }

      function next(err) {
        assert(err);
        assert(called);
        assert('some error' == err.message);
        done();
      }

      wrap(sync, next).call({ ctx: 'ctx' }, 'a', 'b')
    });

    it('should support promises', function(done) {
      var called = 0;

      function promise(a) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        called++;

        return {
          then: function (resolve) {
            resolve(a);
          }
        };
      }

      function next(err, a) {
        assert('a' == a);
        assert(called);
        assert(!err);
        done();
      }

      wrap(promise, next).call({ ctx: 'ctx' }, 'a')
    });

    it('handle promise errors', function(done) {
      var called = 0;

      function promise(a, b) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        called++;

        return {
          then: function (resolve, reject) {
            reject(new Error('some error'));
          }
        }
      }

      function next(err) {
        assert(err);
        assert(called);
        assert('some error' == err.message);
        done();
      }

      wrap(promise, next).call({ ctx: 'ctx' }, 'a', 'b')
    });
  })

  describe('async', function(done) {
    it('should pass args and preserve context', function(done) {
      var called = 0;

      function async(a, b, fn) {
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

      wrap(async, next).call({ ctx: 'ctx' }, 'a', 'b')
    });

    it('handle errors', function(done) {
      var called = 0;

      function async(a, b, fn) {
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

      wrap(async, next).call({ ctx: 'ctx' }, 'a', 'b')
    });
  })

  describe('generator', function() {
    it('should pass args and preserve context', function(done) {
      var called = 0;

      function *gen(a, b) {
        assert(this.ctx = 'ctx');
        assert('a' == a);
        assert('b' == b);
        yield process.nextTick;
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
