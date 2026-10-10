Write a Python module `rpn.py` at the repository root: a reverse Polish notation evaluator, with unit tests under `tests/`.

Rules:
1. `evaluate(expr, env=None)` splits `expr` on whitespace. A number token is an optional `-`, digits, and an optional `.digits` part: `3`, `-2`, `4.5`. Integers stay `int`.
2. Operators `+ - * / ^` pop b, then a, and push `a op b`. `^` is power. `/` is true division and always yields a float (`"6 2 /"` gives `3.0`). `+ - * ^` on two ints give an int.
3. `dup` duplicates the top, `swap` swaps the top two, `drop` discards the top.
4. Any other lowercase name `[a-z]+` pushes `env[name]`. A token `=name` pops the top and stores it in `env[name]`, mutating the dict passed in.
5. When the tokens run out: exactly one value left is returned. No value left is allowed only if the expression made an assignment, and then `evaluate` returns `None`. Every other end state raises `ValueError`.
6. `evaluate` raises `ValueError` for: a blank expression, stack underflow, division by zero, an unknown name, and any token that fits no rule above (`%`, `3x`).
7. `evaluate_lines(text)` evaluates each line with one shared env, skips blank lines and lines starting with `#`, and returns the list of results that are not `None`. Example: `"5 =r\nr r *\n2 r +"` gives `[25, 7]`.
