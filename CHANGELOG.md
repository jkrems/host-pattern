1.1.1
-----
* Only publish index.js - @jkrems
  https://github.com/jkrems/host-pattern/pull/3

1.1.0
-----
* Added `abbreviate(hosts: string[])` - @jkrems
  https://github.com/jkrems/host-pattern/pull/2
  - Add validation for abbr argument
  - Make expand(abbr([])) work, clean up reduce
  - Fix bug where non-numbered hosts could vanish
  - Remove superfluous `[]`
  - Support for abbreviate

1.0.0
-----
* Initial version with support for `expand`
