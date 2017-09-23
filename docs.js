/**
  Creates an object which can iterate through the types and names of files in a
  directory. It calls {@link https://linux.die.net/man/2/getdents64|getdents64}
  with a configurable buffer size.

  @param {integer} size - Size of buffer to use when calling `getdents64`.
  @param {integer} [fd] - Open file descriptor to directory (e.g. from `fs.open`). If you don't specfify this here, you'll need to call {@link Getdents#reset|reset}. Note you'll need to close `fd` yourself - it won't be closed when iteration is complete.
 */
class Getdents
{
    constructor(size, fd)
    {
    }

    /**
      Set the directory to iterate.

      @param {integer} fd - Open file descriptor to directory.
     */
    reset(fd)
    {
    }

    /**
      Synchronously iterate over the entries in the directory (e.g. using
      `for-of`). The value of each iteration is always `undefined`. You'll need
      to read {@link Getdents#type|type} and/or {@link Getdents#name|name} at
      each iteration in order to extract information from the entry as required.
     */
    *[Symbol.iterator]()
    {
    }

    /**
      Asynchronously iterate over the entries in the directory (e.g. using
      `for-await-of`). The value of each iteration is always `undefined`.
      You'll need to read {@link Getdents#type|type} and/or
      {@link Getdents#name|name} at each iteration in order to extract
      information from the entry as required.
     */
    async *[Symbol.asyncIterator]()
    {
    }

    /**
      @returns {integer} The type of the current entry. You can use the
      `Getdents.DT_*` properties to check against the type.
     */
    get type()
    {
    }

    /**
      @returns {string} The filename of the current entry.
     */
    get name()
    {
    }

    /**
      @returns {integer} Type value of block devices.
     */
    static get DT_BLK()
    {
    }

    /**
      @returns {integer} Type value of character devices.
     */
    static get DT_CHR()
    {
    }

    /**
      @returns {integer} Type value of directories.
     */
    static get DT_DIR()
    {
    }

    /**
      @returns {integer} Type value of named pipes.
     */
    static get DT_FIFO()
    {
    }

    /**
      @returns {integer} Type value of symbolic links.
     */
    static get DT_LNK()
    {
    }

    /**
      @returns {integer} Type value of regular files.
     */
    static get DT_REG()
    {
    }

    /**
      @returns {integer} Type value of UNIX domain sockets.
     */
    static get DT_SOCK()
    {
    }

    /**
      @returns {integer} Type value of files of unknown type.
     */
    static get DT_UNKNOWN()
    {
    }
}

