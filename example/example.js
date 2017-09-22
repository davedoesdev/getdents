const fs = require('fs'),
      assert = require('assert'),
      Getdents = require('getdents').Getdents;

fs.open('/tmp', 'r', function (err, fd)
{
    assert.ifError(err);

    let getdents = new Getdents(1024 * 1024, fd);

    getdents.more(function more(err, ended)
    {
        assert.ifError(err);
        
        if (ended)
        {
            return fs.close(this.fd);
        }

        for (let _ of getdents)
        {
            if (getdents.type() === Getdents.DT_REG)
            {
                console.log(getdents.name());
            }
        }

        this.more(more);
    });
});
