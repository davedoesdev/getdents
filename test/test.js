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

        it('should list files and directories (sync)', function ()
        {
            let entries = new Map();

            for (const _ of getdents)
            {
                entries.set(getdents.name(), getdents.type());
            }

            expect(entries.size).to.equal(6);
            expect(entries.get('one')).to.equal(Getdents.DT_REG);
            expect(entries.get('two')).to.equal(Getdents.DT_REG);
            expect(entries.get('three')).to.equal(Getdents.DT_REG);
            expect(entries.get('dir2')).to.equal(Getdents.DT_DIR);
            expect(entries.get('.')).to.equal(Getdents.DT_DIR);
            expect(entries.get('..')).to.equal(Getdents.DT_DIR);
        });

        it('should list files and directories (async)', async function ()
        {
            let entries = new Map();

            for await (const _ of getdents)
            {
                entries.set(getdents.name(), getdents.type());
            }

            expect(entries.size).to.equal(6);
            expect(entries.get('one')).to.equal(Getdents.DT_REG);
            expect(entries.get('two')).to.equal(Getdents.DT_REG);
            expect(entries.get('three')).to.equal(Getdents.DT_REG);
            expect(entries.get('dir2')).to.equal(Getdents.DT_DIR);
            expect(entries.get('.')).to.equal(Getdents.DT_DIR);
            expect(entries.get('..')).to.equal(Getdents.DT_DIR);
        });

        it('should throw error for invalid file descriptor', function ()
        {
            getdents.reset();

            expect(function ()
            {
                for (let _ of getdents)
                {
                }
            }).to.throw('getdents64 failed: Not a directory');
        });

        it('should callback with error for invalid file descriptor', async function ()
        {
            getdents.reset();

            let raised = false;
            try
            {
                for await (const _ of getdents)
                {
                }
            }
            catch (ex)
            {
                expect(ex.message).to.equal('getdents64 failed: Not a directory');
                raised = true;
            }

            expect(raised).to.be.true;
        });
    });
}

listdir(1024 * 1024);
listdir(48);
