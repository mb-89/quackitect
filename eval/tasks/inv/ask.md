Write a Python module `inv.py` at the repository root with a class `Inventory`, with unit tests under `tests/`.

Rules:
1. `add(sku, qty, name=None)`. SKUs are case-insensitive and stored upper-case. `qty` must be a positive `int`, otherwise `ValueError` (this includes `0`, negatives, floats and strings). The first add of a SKU must give a name, otherwise `ValueError`. Later adds may leave the name out; a later name that differs from the stored one raises `ValueError`.
2. `remove(sku, qty)`. `qty` follows the rule for `add`. An unknown SKU raises `KeyError`. Removing more than the stock raises `ValueError` and changes nothing. A SKU whose stock reaches 0 stays known.
3. `stock(sku) -> int`; an unknown SKU raises `KeyError`.
4. `report() -> list[str]`: one line per SKU, sorted by SKU, formatted `f"{sku}\t{name}\t{qty}"`.
5. `low(threshold) -> list[str]`: the SKUs whose stock is below `threshold`, sorted.
6. `history`: a list attribute; every successful add or remove appends a tuple `("add" or "remove", SKU, qty)`.
7. `save(path)` writes CSV with the header `sku,name,qty` and one row per SKU; names holding commas or quotes round-trip. `Inventory.load(path)` is a classmethod returning an `Inventory` with the same stock and names and an empty history.
