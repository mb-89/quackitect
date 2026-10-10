Write a Python module `sheet.py` at the repository root with a class `Sheet`, a small spreadsheet engine, with unit tests under `tests/`.

Cells and values:
1. A cell reference is one letter `A`-`Z` and a row `1`-`99` (`A1`, `z99`); references are case-insensitive. `set(ref, text)` with an invalid reference raises `ValueError`.
2. `set(ref, text)` stores the text; `raw(ref)` returns it, or `""` for a cell never set. Setting `""` empties the cell.
3. `get(ref)` returns the value: `None` for an empty cell; for text not starting with `=`, an `int` if it parses as one, else a `float` if it parses as one, else the text itself.
4. Text starting with `=` is a formula, evaluated whenever `get` is called, so a change to any cell shows in every cell depending on it.

Formulas:
5. A formula holds numbers, cell references, `+ - * /`, parentheses and unary minus, with the usual precedence; `+ - *` on two ints give an int, `/` always gives a float. Spaces are ignored.
6. An empty cell counts as `0` in arithmetic.
7. `SUM(range)`, `MIN(range)`, `MAX(range)` and `AVG(range)` take one range `A1:B3`: the rectangle between the two corners, inclusive, whichever corner comes first. Function names are case-insensitive. Empty cells in the range are skipped. `MIN` and `MAX` of no values give `0`; `AVG` of no values gives `#DIV/0!`.

Errors are values, returned by `get` as strings:
8. `#DIV/0!` for a division by zero.
9. `#VALUE!` when a text value is used in arithmetic or in a function.
10. `#REF!` for a reference outside `A1`-`Z99` inside a formula (`=A100`).
11. `#CYCLE!` for every cell whose evaluation reaches itself, directly or through other cells, and for every cell depending on such a cell.
12. `#ERR!` for a formula that does not parse (`=1+`, `=SUM(A1)`, `=FOO(A1:A2)`).
13. A formula that uses a cell holding an error yields that same error; when several apply, the first in the formula's left-to-right reading wins.

Output:
14. `cells()` returns the references of non-empty cells, upper-case, ordered by row, then column.
15. `to_csv()` returns rows `1` to the highest non-empty row and columns `A` to the highest non-empty column, comma-separated, rows joined by `\n`; an empty cell is the empty string, other values use `str()`.
