'use strict';

function byNumeric(a, b) { return a - b; }

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
  '([^,;\\s]*)',
  ')', // end of actual group
].join(''), 'g');
var HOST = /^([^\d,;\s<>]+)(\d*)([^,;\s<>]*)$/;

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
  var postfix = match[3];

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

function buildRanges(members) {
  var ranges = [];
  var start = members.shift();
  var end = start;
  var current;

  if (!start) return '';
  if (!members.length) return '' + start;

  function emitRange() {
    if (!start) return;
    ranges.push(start === end ? ('' + start) : (start + '-' + end));
  }

  do {
    current = members.shift();
    if (current === end + 1) {
      end = current;
    } else {
      emitRange();
      start = end = current;
    }
  } while (members.length);

  emitRange();

  return '<' + ranges.join(',') + '>';
}

function addHostToGroup(host) {
  var match = host.match(HOST);
  if (!match) {
    throw new Error('Invalid host: ' + JSON.stringify(host));
  }
  var prefix = match[1];
  var index = match[2];
  var postfix = match[3];
  var key = prefix + postfix;

  if (index === '') {
    this.simple.push(prefix + postfix);
    return this;
  }

  var group = this.sets[key] = this.sets[key] || {
    prefix: prefix,
    postfix: postfix,
    members: [],
  };
  group.members.push(+index);
}

function abbreviate(hosts) {
  if (!Array.isArray(hosts)) {
    throw new TypeError('abbreviate(string[]): `' + hosts + '` is not an array');
  }
  if (hosts.length < 1) return '';

  var sets = {};
  var simple = [];
  hosts.forEach(addHostToGroup, { sets: sets, simple: simple });

  function abbreviateGroup(key) {
    var group = sets[key];
    var members = group.members.sort(byNumeric);
    return group.prefix + buildRanges(members) + group.postfix;
  }

  return Object.keys(sets)
    .map(abbreviateGroup)
    .concat(simple)
    .sort()
    .join(',');
}
exports.abbreviate = abbreviate;
