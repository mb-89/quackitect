---
id: req-engine-folder-is-sealed
type: "[[requirement]]"
statement: Where the engine is vendored in a host repository, the engine shall resolve every resource it serves from inside its own folder and shall write zero files into it.
kind: functional
verify_method: test
breaks_if_removed: The vendored folder stops being replaceable whole, and an engine update starts destroying builder edits.
breaks_how_badly: crippling
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay step 1
  - uc-vendor-and-overlay ext 1a
  - uc-vendor-and-overlay step 6
  - ".se/req-mine-v1.md: refusals and honesty (every refusal names the cause and the one recovery command)"
  - ".se/req-mine-v1.md: lifecycle and distribution (the binary embeds no data; every resource resolves from the live layer beside it)"
priority: should
---

## Detail

What sealing means, in each direction:

- While serving a host repository, the engine shall write zero files under its own vendored folder.
- Where the engine is vendored inside a host repository, the engine shall run with every resource it serves resolving from inside its one vendored folder.
- When a new engine version replaces the vendored folder whole, the product shall come up with zero merge operations and zero edits to builder-owned files.
