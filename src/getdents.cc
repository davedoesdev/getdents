#include <unistd.h>
#include <sys/syscall.h>
#include <dirent.h>
#include <napi.h>

class Getdents : public Napi::ObjectWrap<Getdents>
{
public:
    Getdents(const Napi::CallbackInfo& info);
    ~Getdents();

    static Napi::Object Initialize(Napi::Env env, Napi::Object exports);

    void Next(const Napi::CallbackInfo& info);
    Napi::Value NextSync(const Napi::CallbackInfo& info);

    Napi::Value GetFD(const Napi::CallbackInfo& info);
    void SetFD(const Napi::CallbackInfo& info, const Napi::Value& value);

private:
	friend class GetdentsAsyncWorker;

    int NextSync(uint8_t *dirp, unsigned int count);

    unsigned int fd;
};

Getdents::Getdents(const Napi::CallbackInfo& info) :
    Napi::ObjectWrap<Getdents>(info),
    fd(0)
{
}

//LCOV_EXCL_START
Getdents::~Getdents()
{
}
//LCOV_EXCL_STOP

Napi::Error ErrnoError(const Napi::Env& env, const int errnum, const char *msg)
{
    char buf[1024] = {0};
#if defined(__GLIBC__) && defined(_GNU_SOURCE)
    auto errmsg = strerror_r(errnum, buf, sizeof(buf));
    static_assert(std::is_same<decltype(errmsg), char*>::value,
                  "strerror_r must return char*");
#else
    char *errmsg = nullptr;
    auto r = strerror_r(errnum, buf, sizeof(buf));
    static_assert(std::is_same<decltype(r), int>::value,
                  "strerror_r must return int");
    if (r == 0)
    {
        errmsg = buf;
    }
#endif
    return Napi::Error::New(env,
        std::string(msg) + ": " + (errmsg ? errmsg : std::to_string(errnum)));
}

Napi::Error GetdentsErrnoError(const Napi::Env& env, const int errnum)
{
    return ErrnoError(env, errnum, "getdents64 failed");
}

int Getdents::NextSync(uint8_t *dirp, unsigned int count)
{
	return syscall(SYS_getdents64, fd, dirp, count);
}

Napi::Value Getdents::NextSync(const Napi::CallbackInfo& info)
{
    Napi::Buffer<uint8_t> b = info[0].As<Napi::Buffer<uint8_t>>();
    int r = NextSync(b.Data(), b.Length());
    if (r < 0)
    {
        throw GetdentsErrnoError(info.Env(), errno);
    }
    return Napi::Number::New(info.Env(), r);
}

class GetdentsAsyncWorker : public Napi::AsyncWorker
{
public:
    GetdentsAsyncWorker(Getdents *getdents,
                        const Napi::Function& callback,
                        const Napi::Buffer<uint8_t>& buffer) :
        Napi::AsyncWorker(callback),
		getdents(getdents), // getdents_ref keeps this around
		getdents_ref(Napi::Persistent(getdents->Value())),
        buffer_ref(Napi::Persistent(buffer)),
        dirp(buffer.Data()),
        count(buffer.Length())
	{
	}

protected:
    void Execute() override
    {
        result = getdents->NextSync(dirp, count);
        if (result < 0)
        {
            errnum = errno;
        }
    }

	void OnOK() override
	{
		Napi::Env env = Env();

		Callback().MakeCallback(
			Receiver().Value(),
			std::initializer_list<napi_value>
			{
				result < 0 ? GetdentsErrnoError(env, errnum).Value() : env.Null(),
				Napi::Number::New(env, result)
			});
	}

private: Getdents *getdents;
	Napi::ObjectReference getdents_ref;
    Napi::Reference<Napi::Buffer<uint8_t>> buffer_ref;
    uint8_t *dirp;
    unsigned int count;
	int result;
    int errnum;
};

void Getdents::Next(const Napi::CallbackInfo& info)
{
    (new GetdentsAsyncWorker(this,
							 info[1].As<Napi::Function>(),
							 info[0].As<Napi::Buffer<uint8_t>>()))
		->Queue();
}

Napi::Value Getdents::GetFD(const Napi::CallbackInfo& info)
{
    return Napi::Number::New(info.Env(), fd);
}

void Getdents::SetFD(const Napi::CallbackInfo& info, const Napi::Value& value)
{
    fd = value.As<Napi::Number>();
}

Napi::Object Getdents::Initialize(Napi::Env env, Napi::Object exports)
{
    exports.Set("Getdents", DefineClass(env, "Getdents",
    {
        InstanceMethod("next", &Getdents::Next),
        InstanceMethod("nextSync", &Getdents::NextSync),
        InstanceAccessor("fd", &Getdents::GetFD, &Getdents::SetFD),
        StaticValue("DT_BLK", Napi::Number::New(env, DT_BLK)),
        StaticValue("DT_CHR", Napi::Number::New(env, DT_CHR)),
        StaticValue("DT_DIR", Napi::Number::New(env, DT_DIR)),
        StaticValue("DT_FIFO", Napi::Number::New(env, DT_FIFO)),
        StaticValue("DT_LNK", Napi::Number::New(env, DT_LNK)),
        StaticValue("DT_REG", Napi::Number::New(env, DT_REG)),
        StaticValue("DT_SOCK", Napi::Number::New(env, DT_SOCK)),
        StaticValue("DT_UNKNOWN", Napi::Number::New(env, DT_UNKNOWN)),
        StaticValue("alignment", Napi::Number::New(env, __alignof__(struct dirent)))
    }));

    return exports;
}

Napi::Object Initialize(Napi::Env env, Napi::Object exports)
{
    return Getdents::Initialize(env, exports);
}

NODE_API_MODULE(getdents, Initialize)
