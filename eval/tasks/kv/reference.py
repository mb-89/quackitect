import time

_DEL = object()


class Store:
    def __init__(self, clock=time.time):
        self.clock = clock
        self.data = {}
        self.tx = []

    @staticmethod
    def _key(k):
        if not isinstance(k, str) or not k or any(c.isspace() for c in k):
            raise ValueError(f"bad key {k!r}")

    def _raw(self, k):
        for layer in reversed(self.tx):
            if k in layer:
                v = layer[k]
                return None if v is _DEL else v
        return self.data.get(k)

    def _live(self, k):
        r = self._raw(k)
        if r is None or (r[1] is not None and self.clock() >= r[1]):
            return None
        return r

    def _write(self, k, v, depth=None):
        if depth is None:
            depth = len(self.tx)
        if depth:
            self.tx[depth - 1][k] = v
        elif v is _DEL:
            self.data.pop(k, None)
        else:
            self.data[k] = v

    def set(self, key, value, ttl=None):
        self._key(key)
        if not isinstance(value, str):
            raise TypeError("value must be str")
        if ttl is not None and ttl <= 0:
            raise ValueError("ttl must be > 0")
        self._write(key, (value, None if ttl is None else self.clock() + ttl))

    def get(self, key):
        self._key(key)
        r = self._live(key)
        return r[0] if r else None

    def delete(self, key):
        self._key(key)
        if self._live(key) is None:
            return False
        self._write(key, _DEL)
        return True

    def _visible(self):
        ks = set(self.data)
        for layer in self.tx:
            ks |= set(layer)
        return [k for k in ks if self._live(k) is not None]

    def keys(self, prefix=""):
        return sorted(k for k in self._visible() if k.startswith(prefix))

    def count(self, value):
        return sum(1 for k in self._visible() if self._live(k)[0] == value)

    def begin(self):
        self.tx.append({})

    def rollback(self):
        if not self.tx:
            raise RuntimeError("no transaction")
        self.tx.pop()

    def commit(self):
        if not self.tx:
            raise RuntimeError("no transaction")
        top = self.tx.pop()
        for k, v in top.items():
            self._write(k, v)

    def snapshot(self):
        return {k: self._live(k)[0] for k in self.keys()}

    def restore(self, d):
        if self.tx:
            raise RuntimeError("inside a transaction")
        self.data = {k: (v, None) for k, v in d.items()}

    def execute(self, line):
        parts = line.split()
        if not parts:
            return ""
        cmd, args = parts[0].upper(), parts[1:]
        if cmd == "KEYS":
            if len(args) > 1:
                return "ERR wrong number of arguments"
            return " ".join(self.keys(args[0] if args else ""))
        arity = {"SET": 2, "GET": 1, "DEL": 1, "COUNT": 1, "BEGIN": 0,
                 "ROLLBACK": 0, "COMMIT": 0}
        if cmd not in arity:
            return "ERR unknown command"
        if len(args) != arity[cmd]:
            return "ERR wrong number of arguments"
        if cmd == "SET":
            self.set(*args)
            return "OK"
        if cmd == "GET":
            v = self.get(args[0])
            return "NULL" if v is None else v
        if cmd == "DEL":
            return "1" if self.delete(args[0]) else "0"
        if cmd == "COUNT":
            return str(self.count(args[0]))
        if cmd == "BEGIN":
            self.begin()
            return "OK"
        if not self.tx:
            return "NO TRANSACTION"
        (self.commit if cmd == "COMMIT" else self.rollback)()
        return "OK"

    def run_script(self, text):
        return [self.execute(ln) for ln in text.splitlines() if ln.strip()]
