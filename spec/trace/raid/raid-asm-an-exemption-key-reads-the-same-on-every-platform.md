---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-asm-an-exemption-key-reads-the-same-on-every-platform
type: "[[raid]]"
kind: assumption
statement: A departure is keyed by a path written with forward slashes, and that key matches the enumerated thing on Windows as well as on POSIX.
owner: the maintainer
trigger: the first run of the guard on a Windows machine
status: open
impact: Every declared departure stops matching, so a list of granted exceptions reads as a list of violations, and the guard goes red on work nobody changed.
breaks_how_badly: corrosive
how_likely: plausible
probe: unprobed. The check needs a Windows machine and this is a Linux container. What the read DID establish is that the question is real — deliverable/engine/widgets.ts line 136 writes the forward slash into the matching pattern itself, so the key is platform-shaped by construction.
probed: 2026-08-26
source_refs:
  - req-absence-from-the-exemption-list-means-not-exempt
  - fn-govern-a-conversation-under-a-stated-rule.judge-each-governed-thing
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

The existing widget guard is the sample. `deliverable/engine/widgets.ts` line
136 matches an exemption bullet with the pattern
`^-\s+(deliverable\/engine\/[\w./-]+\.ts)\s+[-–—]\s+\S`, so the forward slash
is written into the pattern itself. Line 184 then tests set membership of a
path produced by the enumerator.

The probe is to run the widget guard on Windows and read the two sides. It
holds if the enumerator also produces forward slashes. It is false if the
enumerator produces backslashes, and the tell is that every declared
exemption is reported as a stray.

The same failure was already seen once from a different cause. Lines 118 to
125 of that file record a linked engine resolving its own directory
elsewhere, reading no list, and reporting every declared exemption as an
unregistered emitter.
