import re

NUM = re.compile(r"-?\d+(\.\d+)?$")
NAME = re.compile(r"[a-z]+$")


def evaluate(expr, env=None):
    env = {} if env is None else env
    toks = expr.split()
    if not toks:
        raise ValueError("blank expression")
    st, assigned = [], False

    def pop():
        if not st:
            raise ValueError("stack underflow")
        return st.pop()

    for t in toks:
        if NUM.match(t):
            st.append(float(t) if "." in t else int(t))
        elif t in ("+", "-", "*", "/", "^"):
            b, a = pop(), pop()
            if t == "/":
                if b == 0:
                    raise ValueError("division by zero")
                st.append(a / b)
            else:
                st.append({"+": a + b, "-": a - b, "*": a * b, "^": a ** b}[t])
        elif t == "dup":
            a = pop()
            st += [a, a]
        elif t == "swap":
            b, a = pop(), pop()
            st += [b, a]
        elif t == "drop":
            pop()
        elif t.startswith("=") and NAME.match(t[1:]):
            env[t[1:]] = pop()
            assigned = True
        elif NAME.match(t):
            if t not in env:
                raise ValueError(f"unknown name: {t}")
            st.append(env[t])
        else:
            raise ValueError(f"bad token: {t}")
    if len(st) == 1:
        return st[0]
    if not st and assigned:
        return None
    raise ValueError(f"stack has {len(st)} items")


def evaluate_lines(text):
    env, out = {}, []
    for line in text.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        r = evaluate(line, env)
        if r is not None:
            out.append(r)
    return out
