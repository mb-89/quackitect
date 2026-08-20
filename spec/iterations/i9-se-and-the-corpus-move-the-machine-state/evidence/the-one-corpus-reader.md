---
form: the-one-corpus-reader
by: agent
signed_off: 2026-08-20T10:56:08.633Z
reopened: "2026-08-20T10:45:02.505Z — the four enumerated readers disagree on an unreadable file, nothing pins the count, and a private split survives in mirror.ts"
authors: agent
files:
---

# Evidence form / the-one-corpus-reader

## current_situation

The chunk stood, and the comparison it claimed was still comparing one thing with itself.

FOUR READERS WERE ENUMERATED AND ALL FOUR REACHED ONE FUNCTION. A set built from four calls into one implementation still has one element, so the pairwise cases were as unfalsifiable with four entries as with one.

NOTHING PINNED THE COUNT. The case asserted at least one reader, so three entries could be deleted and the whole battery stayed green.

AND THE FOUR DID DISAGREE, on the one shape the cases omitted. The guard's entry was fed an empty string for a file that cannot be read, so it answered `absent` where the other three answered `unreadable`.

A private split also survived in the mirror, written in a form the check could not see.

## built

`notes.ts`, `frontmatter.ts`, `corpusreaders.ts`, `sweep.ts`, `guard.ts`, `mirror.ts`, `forms.ts`, `lint.ts`, `model-fs.ts`, `binpreflight.ts`, `binrecord-inspect.ts`, `binbackfill-minted.ts`.

### One parse, and it never throws

`inspectCorpusText(path, raw)` is the engine's only reading of a frontmatter block. `inspectCorpusNode(path)` reads the file and delegates. It returns a verdict as DATA, so each caller applies its own policy without needing its own parser.

THE VERDICT DISTINGUISHES TWO TROUBLES. `absent` is a node with no block: a failure to a reader that demands one, a legal skip to a reader walking every markdown file. `unreadable` is a block that is there and wrong, or a file that cannot be read at all. Nobody may skip that.

ONE VOCABULARY REACHES EVERY READER, and the path is named once in it rather than twice.

### Four policies over it

The lane's door refuses. The sweep records a finding and skips an absent block, because it walks every markdown file. The write guard refuses the write and adds the line number in the FILE, asking the split for the offset rather than keeping the number itself. The code preflight collects, because a preflight names every failure in one pass.

### Nine private splits

The evidence first said five. `splitsItself` counts them mechanically and preflight refuses on any. Each widening of it found more: the record inspector, the linter's mask, two `minted_in` stampers, the mirror's page render, and the form stamper.

FIVE OF THE NINE CARRIED THE SAME BUG in one of two shapes. Two tested for a fence at byte zero and could not see a Windows line ending. Three had no byte-order-mark handling: one rendered frontmatter into the page instead of hiding it, and one would have prepended a SECOND frontmatter block to a file that already had one.

THE CHECK'S LIMIT IS NAMED IN IT. It matches five literal forms, and a split written a sixth way is invisible. The regex form was added after one sat in that blind spot.

### The enumerator, and what it is actually for

`corpusreaders.ts` lists four readers, each entry the call its own module makes. It has its own module because putting it in `trace.ts` made trace import the guard and the sweep, and almost every test imports trace: the battery went from 71 seconds to 139.

THE COUNT IS PINNED AT FOUR, not floored at one. A floor let three entries be deleted with nothing going red.

THE CASES NOW INCLUDE A FILE THAT IS NOT THERE, which is how the guard's disagreement was found. That entry no longer hands the guard an empty string for a missing file.

### The tree

1555 pass, 7 fail. Lint green, preflight green, corpus sweep green over 1969 nodes.

## follow_up

### What the comparison does and does not prove

ALL FOUR ENTRIES DELEGATE TO ONE FUNCTION, so on the shapes the cases cover they cannot disagree. The pairwise assertion is true by construction today, and saying otherwise would be the overclaim this chunk was sent back for twice.

WHAT IT GUARDS IS THE SHAPE. A fifth reader added with its own parse stops matching, and `splitsItself` refuses it before the comparison ever runs. The list makes divergence visible; the check makes divergence impossible to add quietly.

THE ONE CLASS WHERE THEY DID DIVERGE was a file that cannot be read, and it was invisible because the cases had no such class. That is the lesson worth carrying: a comparison is only as complete as its input set, and the input set was derived from how a node can be malformed rather than from how a read can fail.

### The check that keeps finding things

Each widening found another split. Nine so far, from a starting count of five. Nothing says the ninth is the last, and the check names its own blind spot rather than implying otherwise.

## anything_else

