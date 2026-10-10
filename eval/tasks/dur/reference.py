import re
import sys

UNITS = {"d": 86400, "h": 3600, "m": 60, "s": 1}
ORDER = "dhms"


def parse(s):
    t = s.strip().lower()
    if not t:
        raise ValueError("empty duration")
    if t.isdigit():
        return int(t)
    if re.sub(r"\d+[a-z]", "", t).strip():
        raise ValueError(f"bad duration: {s!r}")
    total, last = 0, -1
    for n, u in re.findall(r"(\d+)([a-z])", t):
        if u not in UNITS:
            raise ValueError(f"unknown unit {u!r}")
        i = ORDER.index(u)
        if i <= last:
            raise ValueError("units out of order or repeated")
        last = i
        total += int(n) * UNITS[u]
    return total


def fmt(n):
    if n < 0:
        raise ValueError("negative duration")
    if n == 0:
        return "0s"
    out = ""
    for u in ORDER:
        q, n = divmod(n, UNITS[u])
        if q:
            out += f"{q}{u}"
    return out


def add(a, b):
    return fmt(parse(a) + parse(b))


if __name__ == "__main__":
    try:
        print(fmt(sum(parse(x) for x in sys.argv[1:])))
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        sys.exit(2)
