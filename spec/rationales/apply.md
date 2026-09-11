---
kind: [[rationale]]
explains: [[spec/design_output/apply]]
---

# Why

Every rule in the write tools has a price behind it. v4 and v3 both carried an
applier, and the shape they reached came out of work they lost on the way.

# The journal came second

The first applier wrote the file and kept nothing else. `.se` sits outside git.
So a file the engine overwrote went for good, unless a later apply happened to
journal that text as its own before.

Two work tokens went that way:

| what the entry held | what it cost |
|---|---|
| a blank template | the token's whole text |
| a state one apply short | everything the last edit said |

So the entry keeps both halves in full, and no hash stands in for the text. It
costs the size of the file again. That cost is what a journal of an edit buys.

The journal also moved in front of the write. A journal nobody could write used
to leave a bulk edit nobody could undo. That is the incident the whole thing
exists to prevent.

# The entry had no owner

The folder held a bare list of files. The undo took the newest list in it,
whoever had written it. One agent on a tree misses that for years.

Ten agents on one tree meant the newest apply belonged to somebody else most of
the time. And an undo is what an agent reaches for the moment it makes a
mistake. That is the moment it is least likely to check who wrote last.

Measured once, on that tree: an undo named on one token restored a file
belonging to another actor's token. The newer content went for good, both files
being untracked.

# Two answers on line endings

v3's patch applied a CRLF or LF mismatch in the file's own endings, and named
the correction on the result. v4 went the other way and stayed byte-exact,
because the edit says which bytes to replace.

The owner chose v4's answer for v5, working on Windows, where the question
bites hardest. A silent correction is a write nobody asked for.

# Preview became optional

v3 made `preview: true` the first call of any sweep, and read the blast radius
back before it wrote. That was the safety net where there was nothing to undo
with.

The journal is a better net. It catches the mistakes a preview hides: the ones
that look right. Preview stayed on, as a flag nobody has to reach for.
