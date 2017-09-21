const os = require('os'),
    Getdents = require('bindings')('getdents.node').Getdents;
let read16, read64;
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

class Getdents2 extends Getdents
{
    constructor(fd, size)
    {
        super(fd);
        this._buf = Buffer.alloc(size);
        this._n = 0;
        this._next = 0;
    }

    *[Symbol.iterator]()
    {
        this._pos = 0;

        while (this._pos < this._n)
        {
            this._next = this._pos +
                         read16(this._buf, this._pos + 16); // d_reclen
            yield;
  			this._pos = this._next;
        }
    }

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

    moreSync()
    {
        this._n = super.nextSync(this._buf);
        return this._n > 0;
    }

    more(cb)
    {
        super.next(this._buf, (err, n) =>
        {
            if (err)
            {
                return cb.call(this, err);
            }

            this._n = n;
            cb.call(this, null, n === 0);
        });
    }
}

exports.Getdents = Getdents2;
