---
minted_in: i1
id: req-product-is-a-folder
type: "[[requirement]]"
statement: The engine shall keep every artifact a product owns inside that product's own root folder, with zero product-owned files outside it.
kind: functional
verify_method: test
breaks_if_removed: A second product bleeds into the first, and deleting the folder stops being the whole uninstall.
breaks_how_badly: crippling
refines:
  - uc-begin-a-product
source_refs:
  - uc-begin-a-product step 2
  - uc-begin-a-product ext 2a
priority: must
---

## Detail

## Detail

What a product owns, and what therefore lives in its folder:

- the spec and every trace node
- the machine and its instances
- records, open and closed
- notes and the inbox
- evidence files and logs

Zero of these for one product sit in another product's tree or in a shared home.
