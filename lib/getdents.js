const os = require('os'),
      util = require('util'),
      _Getdents = require('bindings')('getdents.node').Getdents;

let read16;
if (os.endianness() === 'LE')
{
	read16 = function (buf, pos)
	{
		return buf.readUInt16LE(pos);
	};
}
/* c8 ignore start */
else
{
	read16 = function (buf, pos)
	{
		return buf.readUInt16BE(pos);
	};
}
/* c8 ignore stop */

let zero_inode = Buffer.alloc(8);

/*
struct linux_dirent64 {
   ino64_t        d_ino;    // 64-bit inode number
   off64_t        d_off;    // 64-bit offset to next structure
   unsigned short d_reclen; // Size of this dirent
   unsigned char  d_type;   // File type
   char           d_name[]; // Filename (null-terminated)
};
*/

class Getdents extends _Getdents
{
    constructor(size, fd)
    {
        super();
        this._buf = Buffer.alloc(size);
        this.reset(fd);
        this._pnext = util.promisify(this.next);
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
            /* istanbul ignore else */
            if (!this._buf.slice(0, 8).equals(zero_inode)) // d_ino
            {
                this._next = this._pos +
                             read16(this._buf, this._pos + 16); // d_reclen
                yield;
                this._pos = this._next;
            }
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

    async *[Symbol.asyncIterator]()
    {
        let n;
        while ((n = await this._pnext(this._buf)) > 0)
        {
            yield* this._process(n);
        }
    }

    get type()
    {
        return this._buf[this._pos + 18]; // d_type
    }

    get name()
    {
        let name_start = this._pos + 19, // d_name
            search_start = this._next - _Getdents.alignment,
            name_end = this._buf.indexOf(0, Math.max(search_start, name_start));
        return this._buf.toString('utf8', name_start, name_end);
    }
}

exports.Getdents = Getdents;
