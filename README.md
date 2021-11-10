This is a Node.js module for calling
[`getdents64`](https://linux.die.net/man/2/getdents64) on Linux from
Javascript.

You might want to use this instead of `fs.readdir` if [you have a
directory containing many
files](http://be-n.com/spw/you-can-list-a-million-files-in-a-directory-but-not-with-ls.html).

API documentation is available
[here](http://rawgit.davedoesdev.com/davedoesdev/getdents/master/docs/index.html).

# Example

List regular files in `/tmp`:

``` javascript
const fs = require('fs'),
      assert = require('assert'),
      Getdents = require('getdents').Getdents;

fs.open('/tmp', 'r', async function (err, fd)
{
    assert.ifError(err);

    let getdents = new Getdents(1024 * 1024, fd);

    for await (let _ of getdents)
    {
        if (getdents.type === Getdents.DT_REG)
        {
            console.log(getdents.name);
        }
    }
});
```

# Install

``` bash
npm install getdents
```

# Licence

[MIT](LICENCE)

# Test

``` bash
grunt test
```

# Coverage

``` bash
grunt coverage
```

LCOV results are available
[here](http://rawgit.davedoesdev.com/davedoesdev/getdents/master/coverage/lcov-report/index.html).

Coveralls page is [here](https://coveralls.io/r/davedoesdev/getdents).
