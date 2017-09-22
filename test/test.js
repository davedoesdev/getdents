const fs = require('fs'),
      path = require('path'),
      expect = require('chai').expect,
      Getdents = require('..').Getdents,
      dirname = path.join(__dirname, 'dir1');

function listdir(bufsize)
{
    describe('list directory (bufsize=' + bufsize + ')', function ()
    {
        let fd, getdents;

        before(function ()
        {
            getdents = new Getdents(bufsize);
        });

        beforeEach(function (cb)
        {
            fs.open(dirname, 'r', function (err, fd2)
            {
                if (err) { return cb(err); }
                fd = fd2;
                getdents.reset(fd);
                expect(getdents.fd).to.equal(fd);
                cb();
            });
        });

        afterEach(function (cb)
        {
            fs.close(fd, cb);
        });

        it('should be empty initially', function ()
        {
            let count = 0;
            for (let _ of getdents)
            {
                count++;
            }
            expect(count).to.equal(0);
        });

        it('should list files and directories (sync)', function ()
        {
            let entries = new Map();

            while (getdents.moreSync())
            {
                for (let _ of getdents)
                {
                    entries.set(getdents.name(), getdents.type());
                }
            }

            expect(entries.size).to.equal(6);
            expect(entries.get('one')).to.equal(Getdents.DT_REG);
            expect(entries.get('two')).to.equal(Getdents.DT_REG);
            expect(entries.get('three')).to.equal(Getdents.DT_REG);
            expect(entries.get('dir2')).to.equal(Getdents.DT_DIR);
            expect(entries.get('.')).to.equal(Getdents.DT_DIR);
            expect(entries.get('..')).to.equal(Getdents.DT_DIR);
        });

        it('should list files and directories (async)', function (cb)
        {
            let entries = new Map();

            getdents.more(function more(err, ended)
            {
                if (err) { return cb(err); }

                if (ended)
                {
                    expect(entries.size).to.equal(6);
                    expect(entries.get('one')).to.equal(Getdents.DT_REG);
                    expect(entries.get('two')).to.equal(Getdents.DT_REG);
                    expect(entries.get('three')).to.equal(Getdents.DT_REG);
                    expect(entries.get('dir2')).to.equal(Getdents.DT_DIR);
                    expect(entries.get('.')).to.equal(Getdents.DT_DIR);
                    expect(entries.get('..')).to.equal(Getdents.DT_DIR);
                    return cb();
                }

                for (let _ of this)
                {
                    entries.set(this.name(), this.type());
                }

                this.more(more);
            });
        });

        it('should throw error for invalid file descriptor', function ()
        {
            getdents.reset();

            expect(function ()
            {
                getdents.moreSync();
            }).to.throw('getdents64 failed: Not a directory');
        });

        it('should callback with error for invalid file descriptor', function (cb)
        {
            getdents.reset();

            getdents.more(function (err)
            {
                expect(err.message).to.equal('getdents64 failed: Not a directory');
                cb();
            });
        });
    });
}

listdir(1024 * 1024);
listdir(48);
