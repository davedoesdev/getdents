const assert = require('assert');
const fs = require('fs');
const Getdents = require('.').Getdents;

function print_filenames(getdents)
{
    for (let x of getdents)
    {
        if (getdents.type() !== Getdents.DT_DIR)
        {
            console.log(getdents.name());
        }
    }
}

fs.open('build', 'r', function (err, fd)
{
    assert.ifError(err);
    let getdents = new Getdents(fd, 1024 * 1024);
    while (getdents.moreSync())
    {
        print_filenames(getdents);
    }
    fs.closeSync(fd);
});

fs.open('build', 'r', function (err, fd)
{
    assert.ifError(err);
    let getdents = new Getdents(fd, 1024 * 1024);
    getdents.more(function more(err, ended)
    {
        assert.ifError(err);

        if (ended)
        {
            return fs.closeSync(this.fd);
        }

        print_filenames(this);
        this.more(more);
    });
});
