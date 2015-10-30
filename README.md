# host-pattern

## Install

```
npm install --save host-pattern
```

## Usage

### `expand`

```js
var hostPattern = require('host-pattern');

// Lists (comma-separated):
hostPattern.expand('example.net,www.host.com');
// [
//   "example.net",
//   "www.host.com"
// ]

// Ranges:
hostPattern.expand('my-host<1,3-5>.example.com');
// [
//   "my-host1.example.com",
//   "my-host3.example.com",
//   "my-host4.example.com",
//   "my-host5.example.com"
// ]
```

### `abbreviate`

```js
var hostPattern = require('host-pattern');

// Lists (comma-separated):
hostPattern.abbreviate([ 'example.net', 'www.host.com' ]);
// 'example.net,www.host.com'

// Ranges:
hostPattern.abbreviate([
  'my-host1.example.com',
  'my-host3.example.com',
  'my-host4.example.com',
  'my-host5.example.com',
]);
// 'my-host<1,3-5>.example.com'
```
