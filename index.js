'use strict';

function flatten(array) {
  return [].concat.apply([], array);
}

function matchAll(regex, text) {
  /* eslint no-cond-assign: 0 */
  var out = [];
  var match;
  while ((match = regex.exec(text)) !== null) {
    out.push(match);
  }
  return out;
}

var GROUP = new RegExp([
  // Every match starts either at the beginning or after ,/;, surrounded by optional whitespace
  '(?:^|\\s*[,;]\\s*)',
  // This is the actual group, e.g. "my-host.example.com" or "my<pattern>xyz"
  '(?:',
  // The prefix is mandatory right now
  '([^<>,;\\s]+)',
  // Optional: a range (e.g. <1,2-4,8>) section
  '(?:',
  '<([^>]*)>', // We capture the actual range expression
  ')?',
  // The trailing part is optional
  '([^,;\\s]+)?',
  ')', // end of actual group
].join(''), 'g');

function parseSubRange(subRange) {
  var parts = subRange.split(/\s*-\s*/);
  var start = +parts[0];
  var end = +parts[1];

  var out = [ start ];
  while (end > start) {
    out.push(++start);
  }
  return out;
}

function parseRange(range) {
  return flatten(range.split(/\s*,\s*/).map(parseSubRange));
}

function parseGroup(match) {
  var prefix = match[1];
  var range = match[2];
  var postfix = match[3] || '';

  if (/[<>]/.test(postfix)) {
    if (range) {
      throw new SyntaxError('Multiple ranges in one group: ' + JSON.stringify(match[0]));
    }
    throw new SyntaxError('Invalid range definition in ' + JSON.stringify(match[0]));
  }

  function buildName(n) {
    return prefix + n + postfix;
  }

  if (!range) {
    return prefix + postfix;
  }

  return parseRange(range).map(buildName);
}

function expand(pattern) {
  if (Array.isArray(pattern)) {
    return flatten(pattern.map(expand));
  }
  if (!/\S/.test(pattern)) {
    return [];
  }

  var groups = matchAll(GROUP, pattern).map(parseGroup);
  return flatten(groups);
}
exports.expand = expand;
