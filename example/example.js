const fs = require('fs'),
      assert = require('assert'),
      Getdents = require('getdents').Getdents;

fs.open('/tmp', 'r', async function (err, fd)
{
    assert.ifError(err);

    let getdents = new Getdents(1024 * 1024, fd);

    for await (let _ of getdents)
    {
        if (getdents.type() === Getdents.DT_REG)
        {
            console.log(getdents.name());
        }
    }
});
