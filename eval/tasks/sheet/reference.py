import re

REF = re.compile(r"^([A-Za-z])([1-9][0-9]?)$")


class _Err(Exception):
    def __init__(self, code):
        self.code = code


class _Cycle(Exception):
    pass


def _norm(ref):
    m = REF.match(ref.strip()) if isinstance(ref, str) else None
    if not m:
        raise ValueError(f"bad reference {ref!r}")
    return m.group(1).upper() + m.group(2)


def _key(ref):
    return int(ref[1:]), ref[0]


class Sheet:
    def __init__(self):
        self.text = {}

    def set(self, ref, text):
        r = _norm(ref)
        if text == "":
            self.text.pop(r, None)
        else:
            self.text[r] = text

    def raw(self, ref):
        return self.text.get(_norm(ref), "")

    def get(self, ref):
        try:
            return self._value(_norm(ref), ())
        except _Cycle:
            return "#CYCLE!"

    @staticmethod
    def _literal(t):
        for f in (int, float):
            try:
                return f(t)
            except ValueError:
                pass
        return t

    def _value(self, r, stack):
        if r in stack:
            raise _Cycle()
        t = self.text.get(r)
        if t is None:
            return None
        if not t.startswith("="):
            return self._literal(t)
        try:
            return _Parser(t[1:], self, stack + (r,)).run()
        except _Err as e:
            return e.code

    def cells(self):
        return sorted(self.text, key=_key)

    def to_csv(self):
        if not self.text:
            return ""
        rows = max(int(r[1:]) for r in self.text)
        cols = max(ord(r[0]) for r in self.text) - 64
        out = []
        for i in range(1, rows + 1):
            vals = []
            for j in range(cols):
                v = self.get(chr(65 + j) + str(i))
                vals.append("" if v is None else str(v))
            out.append(",".join(vals))
        return "\n".join(out)


ERRS = ("#DIV/0!", "#VALUE!", "#REF!", "#CYCLE!", "#ERR!")
TOKEN = re.compile(r"\s*(?:(\d+\.\d+|\d+)|([A-Za-z]+\d*)|(.))")


class _Parser:
    def __init__(self, src, sheet, stack):
        self.toks = []
        pos = 0
        src = src.rstrip()
        while pos < len(src):
            m = TOKEN.match(src, pos)
            num, word, op = m.groups()
            self.toks.append(("num", num) if num else ("word", word) if word else ("op", op))
            pos = m.end()
        self.i, self.sheet, self.stack = 0, sheet, stack

    def peek(self):
        return self.toks[self.i] if self.i < len(self.toks) else (None, None)

    def take(self, kind=None, val=None):
        t = self.peek()
        if t[0] is None or (kind and t[0] != kind) or (val and t[1] != val):
            raise _Err("#ERR!")
        self.i += 1
        return t

    def run(self):
        if not self.toks:
            raise _Err("#ERR!")
        v = self.expr()
        if self.i != len(self.toks):
            raise _Err("#ERR!")
        return v.result()

    # values are carried lazily so the first error in reading order wins
    def expr(self):
        v = self.term()
        while self.peek() in (("op", "+"), ("op", "-")):
            op = self.take()[1]
            v = _Bin(op, v, self.term())
        return v

    def term(self):
        v = self.unary()
        while self.peek() in (("op", "*"), ("op", "/")):
            op = self.take()[1]
            v = _Bin(op, v, self.unary())
        return v

    def unary(self):
        if self.peek() == ("op", "-"):
            self.take()
            return _Bin("-", _Const(0), self.unary())
        return self.atom()

    def atom(self):
        kind, val = self.peek()
        if kind == "num":
            self.take()
            return _Const(float(val) if "." in val else int(val))
        if (kind, val) == ("op", "("):
            self.take()
            v = self.expr()
            self.take("op", ")")
            return v
        if kind == "word":
            self.take()
            if self.peek() == ("op", "("):
                return self.func(val.upper())
            return _Ref(self.ref(val), self)
        raise _Err("#ERR!")

    def ref(self, word):
        m = re.match(r"^([A-Za-z])(\d+)$", word)
        if not m:
            raise _Err("#ERR!")
        row = int(m.group(2))
        return (m.group(1).upper() + str(row)) if 1 <= row <= 99 else None

    def func(self, name):
        if name not in ("SUM", "MIN", "MAX", "AVG"):
            raise _Err("#ERR!")
        self.take("op", "(")
        a = self.ref(self.take("word")[1])
        self.take("op", ":")
        b = self.ref(self.take("word")[1])
        self.take("op", ")")
        return _Func(name, a, b, self)


class _Const:
    def __init__(self, v):
        self.v = v

    def result(self):
        return self.v

    def num(self):
        return self.v


class _Ref:
    def __init__(self, ref, p):
        self.ref, self.p = ref, p

    def result(self):
        return self.num()

    def num(self):
        if self.ref is None:
            raise _Err("#REF!")
        v = self.p.sheet._value(self.ref, self.p.stack)
        if v is None:
            return 0
        if isinstance(v, str):
            raise _Err(v if v in ERRS else "#VALUE!")
        return v


class _Bin:
    def __init__(self, op, a, b):
        self.op, self.a, self.b = op, a, b

    def result(self):
        return self.num()

    def num(self):
        a, b = self.a.num(), self.b.num()
        if self.op == "+":
            return a + b
        if self.op == "-":
            return a - b
        if self.op == "*":
            return a * b
        if b == 0:
            raise _Err("#DIV/0!")
        return a / b


class _Func:
    def __init__(self, name, a, b, p):
        self.name, self.a, self.b, self.p = name, a, b, p

    def result(self):
        return self.num()

    def num(self):
        if self.a is None or self.b is None:
            raise _Err("#REF!")
        c1, c2 = sorted((self.a[0], self.b[0]))
        r1, r2 = sorted((int(self.a[1:]), int(self.b[1:])))
        vals = []
        for r in range(r1, r2 + 1):
            for c in range(ord(c1), ord(c2) + 1):
                v = self.p.sheet._value(chr(c) + str(r), self.p.stack)
                if v is None:
                    continue
                if isinstance(v, str):
                    raise _Err(v if v in ERRS else "#VALUE!")
                vals.append(v)
        if self.name == "SUM":
            return sum(vals)
        if self.name == "AVG":
            if not vals:
                raise _Err("#DIV/0!")
            return sum(vals) / len(vals)
        if not vals:
            return 0
        return min(vals) if self.name == "MIN" else max(vals)
