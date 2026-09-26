---
kind: [[rationale]]
---

# Why

The owner decided this for the migration, and the decision is final. The index
reads SQLite through the pure Go driver, `modernc.org/sqlite`, and cgo leaves
the tree. An agent reads this note before it asks again.

## 1. What the build stopped paying

| what cgo cost | what the pure driver costs |
|---|---|
| a C compiler on every box | nothing past Go |
| the pinned Zig download, and the probe `install.sh` runs over each compiler | nothing |
| a cold compile of about seventy seconds | an ordinary Go build |
| a build per target, Linux and Windows apart | one static binary a target |
| cgo reaching every package that imports the index | a module layout that stays plain Go |

The pure driver carries FTS5, so the search kept its ranking.

## 2. What it gave up

The same work ran through both drivers on one box, the week the owner decided.
It wrote every line into FTS5, ran a batch of FTS queries at `LIMIT 250`, then
read rows by path.

| files | full rebuild, cgo against pure | one FTS query | one point read |
|---|---|---|---|
| this tree, 1,277 | 1.4 s against 1.8 s | 0.55 ms against 0.85 ms | 15 µs against 20 µs |
| 20,000 | 10 to 15 s against 14 to 17 s | 0.7 ms against 0.95 ms | 12 µs against 18 µs |
| 50,000 | 38 s against 45 s | 0.7 ms against 1.0 ms | 13 µs against 17 µs |

cgo ran faster by a fifth to two fifths, and both drivers answered a query
under a millisecond. A session asking the index feels neither.

The v3 finding that called the tree unusable at twenty thousand files measured
`git add`, at twenty-six seconds, and left SQLite unmeasured. Its reads stayed under
two hundred milliseconds. For details, see
`spec/trace/raid/raid-asm-one-file-per-work-token-stays-workable-in-the-vault-and-the-repository.md`
on the `v3` branch.

## 3. What would make it wrong

A query past the time a session waits at the tree sizes this tree reaches. The
table above puts that far off. A slow rebuild alone makes nothing wrong, because
the watcher keeps the index warm and a rebuild runs once.

## 4. What cgo still holds

The index still builds through cgo, `github.com/mattn/go-sqlite3`, and the
installer still fetches Zig. Phase one of the migration moves the driver. It
replaces [[spec/design_output/index#the-compiler-it-needs]], and the reasoning
there stands until then.
