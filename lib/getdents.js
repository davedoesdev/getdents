const os = require('os'),
      util = require('util'),
      Getdents = require('bindings')('getdents.node').Getdents;

let read16, read64;
/* istanbul ignore else */
if (os.endianness() === 'LE')
{
	read16 = function (buf, pos)
	{
		return buf.readUInt16LE(pos);
	};
}
else
{
	read16 = function (buf, pos)
	{
		return buf.readUInt16BE(pos);
	};
}

/*
struct linux_dirent64 {
   ino64_t        d_ino;    // 64-bit inode number
   off64_t        d_off;    // 64-bit offset to next structure
   unsigned short d_reclen; // Size of this dirent
   unsigned char  d_type;   // File type
   char           d_name[]; // Filename (null-terminated)
};
*/

/* nyc currently doesn't like 'async *[Symbol.asyncIterator]()' syntax
   so we set it in the constructor to this function until it's fixed */
async function* nyc_workaround()
{
    let n;
    while ((n = await this._pnext(this._buf)) > 0)
    {
        yield* this._process(n);
    }
}

class Getdents2 extends Getdents
{
    constructor(size, fd)
    {
        super();
        this._buf = Buffer.alloc(size);
        this.reset(fd);
        this._pnext = util.promisify(this.next);

        this[Symbol.asyncIterator] = nyc_workaround;
    }

    reset(fd)
    {
        this.fd = fd === undefined ? 0 : fd;
        this._next = 0;
    }

    *_process(n)
    {
        this._pos = 0;
        while (this._pos < n)
        {
            this._next = this._pos +
                         read16(this._buf, this._pos + 16); // d_reclen
            yield;
            this._pos = this._next;
        }
    }

    *[Symbol.iterator]()
    {
        let n;
        while ((n = super.nextSync(this._buf)) > 0)
        {
            yield* this._process(n);
        }
    }

    /*
    async *[Symbol.asyncIterator]()
    {
        let n;
        while ((n = await this._pnext(this._buf)) > 0)
        {
            yield* this._process(n);
        }
    }
    */

    type()
    {
        return this._buf[this._pos + 18]; // d_type
    }

    name()
    {
        let name_start = this._pos + 19, // d_name
            search_start = this._next - Getdents.alignment,
            name_end = this._buf.indexOf(0, Math.max(search_start, name_start));
        return this._buf.toString('utf8', name_start, name_end);
    }
}

exports.Getdents = Getdents2;
