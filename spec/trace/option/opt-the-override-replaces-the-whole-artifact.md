---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-override-replaces-the-whole-artifact
type: "[[option]]"
cluster: the-walk
question: how much of an artifact an override replaces
statement: an override is a whole file standing in for a whole file, and the copy owns every line of it from that moment on
found_by: prior-art
source: the predecessor's resolver at product/engine-go/resolver.go ref main, and every path-keyed system in i16's twenty-system sweep except Sphinx
---

## Mechanism

THE OVERRIDE IS A COMPLETE ARTIFACT. Resolution picks one or the other and
never combines them. Nothing merges, and nothing calls through.

## What it costs, and every source says the same sentence

COPY A FILE AND YOU STOP RECEIVING UPDATES TO IT. Jekyll's documentation says
it outright, Hugo's and Gatsby's say it in other words, and the predecessor's
layered search has the same property by construction.

SO OVERRIDING ONE LINE MEANS OWNING THE WHOLE ARTIFACT, and every later
upstream improvement to the untouched parts of it is lost silently.

## Why it is on the chart

BECAUSE IT IS WHAT THE PREDECESSOR SHIPPED and what most of the field does.
Its two rivals on this row both exist to escape its one cost, and neither can
be judged without it standing beside them.

AND IT IS THE ONLY ONE THAT NEEDS NOTHING FROM UPSTREAM. Call-through requires
the base author to have named extension points; merging requires the artifact
to have structure. This works on any file at all, which is why it is
everywhere.
