Write a Python module `kv.py` at the repository root with a class `Store`, an in-memory key-value store with nested transactions, expiry and a command language, with unit tests under `tests/`.

Rules:
1. `Store(clock=time.time)` takes the clock as a callable returning seconds.
2. `set(key, value, ttl=None)`, `get(key)` (returns `None` for a missing key), `delete(key)` (returns `True` if a visible key was deleted, else `False`).
3. A key is a non-empty `str` without whitespace, otherwise `ValueError`. A value must be a `str`, otherwise `TypeError`. `ttl`, when given, must be greater than 0, otherwise `ValueError`.
4. A key set with `ttl` disappears once `clock() >= time_of_set + ttl`: `get` returns `None`, `delete` returns `False`, and it leaves `keys`, `count` and `snapshot`.
5. `begin()` opens a transaction; transactions nest. Reads inside a transaction see its uncommitted writes and deletes. `rollback()` discards the innermost transaction. `commit()` folds the innermost transaction into the one around it, or into the store when it is the outermost. `rollback()` or `commit()` with no open transaction raises `RuntimeError`. A `ttl` set inside a transaction survives its commit.
6. `keys(prefix="")` returns the visible keys starting with `prefix`, sorted. `count(value)` returns how many visible keys hold `value`.
7. `snapshot()` returns a dict of every visible key and value. `restore(d)` replaces all data with `d` (no expiry); inside a transaction it raises `RuntimeError`.
8. `execute(line) -> str` runs one command. Command names are case-insensitive; keys and values are case-sensitive and contain no spaces.
   - `SET k v` gives `OK`; `GET k` gives the value or `NULL`; `DEL k` gives `1` or `0`; `COUNT v` gives the count; `KEYS` or `KEYS prefix` gives the keys joined by single spaces (empty string for none).
   - `BEGIN` gives `OK`; `ROLLBACK` and `COMMIT` give `OK`, or `NO TRANSACTION` when none is open.
   - An unknown command gives `ERR unknown command`; a known command with the wrong number of arguments gives `ERR wrong number of arguments`.
9. `run_script(text) -> list[str]` runs each non-blank line through `execute` and returns the outputs in order.
