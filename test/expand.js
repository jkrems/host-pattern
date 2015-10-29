'use strict';

var assert = require('assertive');

var expand = require('../').expand;

describe('expand', function() {
  it('ignores empty strings', function() {
    assert.deepEqual([], expand(' \n\t \t '));
    assert.deepEqual([], expand(''));
  });

  it('expands a comma-separated list of elements', function() {
    assert.deepEqual([ 'ab', 'cde', 'xy' ], expand('ab, cde  , xy'));
  });

  it('expands a semicolon-separated list of elements', function() {
    assert.deepEqual([ 'ab', 'cde', 'xy' ], expand('ab; cde  ; xy'));
  });

  it('supports "-" ranges', function() {
    assert.deepEqual([ 'ab1xyz', 'ab2xyz', 'ab3xyz' ], expand('ab<1-3>xyz'));
  });

  it('ignores empty <> ranges', function() {
    assert.deepEqual([ 'abxy' ], expand('ab<>xy'));
  });

  it('allows combining all the features', function() {
    assert.deepEqual([
      'a1', 'a2', 'a3', 'a5', 'a7', 'a11', 'a12', 'a13', 'a14',
      'b',
      'g44',
      'foo.y-9._do3',
    ], expand('a<1-3,5,7,11-14>,b,g<44>,foo.y-<9>._do3'));
  });

  it('fails with additional <> ranges', function() {
    var err = assert.throws(function() {
      expand('ab<1,2>xy<1>z');
    });
    assert.include('Multiple ranges', err.message);
  });

  it('fails on unclosed range expressions', function() {
    var err = assert.throws(function() {
      expand('ab<xy');
    });
    assert.include('Invalid range', err.message);
  });
});
