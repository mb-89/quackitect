Write a Python module `dur.py` at the repository root that parses, formats and adds durations, with unit tests under `tests/`.

Rules:
1. `parse(s) -> int` returns seconds. A duration is one or more components `<n><unit>`, units `d` (86400 s), `h`, `m`, `s`, each used at most once and in the order d, h, m, s. Example: `parse("1d2h3m4s") == 93784`.
2. Surrounding whitespace is ignored, whitespace between components is allowed (`"1h 30m"`), and units are case-insensitive (`"1H30M"`).
3. A bare non-negative integer is seconds: `parse("90") == 90`. `parse("0s") == 0`.
4. `parse` raises `ValueError` for: an empty or blank string, an unknown unit, units out of order, a repeated unit, a unit without a number, a negative number, and a decimal number (`"1.5h"`).
5. `fmt(n) -> str` writes seconds canonically: largest units first, zero components left out, `"0s"` for zero. `fmt(90061) == "1d1h1m1s"`, `fmt(3600) == "1h"`. A negative `n` raises `ValueError`.
6. `add(a, b) -> str` returns `fmt(parse(a) + parse(b))`.
7. `python -m dur ARG...` prints the canonical sum of all arguments and exits 0; on any invalid argument it prints `error: <message>` to stderr and exits with status 2.
