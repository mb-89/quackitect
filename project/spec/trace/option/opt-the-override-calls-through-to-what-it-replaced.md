---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-override-calls-through-to-what-it-replaced
type: "[[option]]"
statement: an override replaces a named part of an artifact and can invoke the version it replaced, so upstream changes to the untouched parts still arrive
cluster: the-walk
question: how much of an artifact an override replaces
found_by: prior-art
source: "XSLT 1.0 xsl:apply-imports (www.w3.org/TR/xslt-10 s5.6), Sphinx's ! template prefix (www.sphinx-doc.org/en/master/development/html_themes/templating.html), Nix overlays' prev argument (NixOS/nixpkgs doc/using/overlays.chapter.md), Yocto bbappend (docs.yoctoproject.org/dev-manual/layers.html)"
---

## Mechanism

THE OVERRIDE IS A DELTA, NOT A REPLACEMENT. It names the part it is changing
and leaves the rest of the artifact standing, with a way to reach the original
from inside the override.

FOUR SYSTEMS IN A TWENTY-SYSTEM SWEEP OFFER IT, and no more.

- XSLT's `xsl:apply-imports` invokes the template the override replaced.
- Sphinx prefixes a template name with `!` to extend the theme's own version
  of that same template, then overrides individual blocks inside it.
- A Nix overlay receives `prev`, so `foo = prev.foo.override {...}` is a
  super-call on the package it is replacing.
- Yocto's append files carry the same instruction as advice: do not copy the
  whole recipe, append only the parts you need to change.

WHY IT MATTERS MORE THAN THE OVERRIDE MECHANISM ITSELF. Every path-keyed
system in the sweep except Sphinx forces a whole-file fork, and each one's own
documentation says a version of the same sentence — copying a file stops you
receiving updates to it. Jekyll says it outright.

SO THIS IS THE ANSWER TO THE STANDING COST of every replacement scheme,
including [[opt-a-mirror-beside-an-overlay]]. Overriding one line of one
artifact currently means owning the whole artifact, and a later upstream change
to an untouched part of it never arrives and nothing says so.

WHAT IT COSTS, AND THE PRICE IS PAID BY THE UPSTREAM AUTHOR. The parts an
override can reach are the parts upstream chose to name. Sphinx's block
granularity is fixed by the theme author, and Rails' cleanest variant requires
the engine author to have factored the class in advance. A copy cannot override
a part nobody named.

SO IT WANTS A DECISION ABOUT GRAIN, and that decision is upstream's. What is
the smallest nameable piece of a method artifact — a document, a section, a
frontmatter key, a rule? Every answer is a different product.

AND IT SITS AWKWARDLY BESIDE ONE OWNER RULING. Nothing here is sealed, so a
copy may replace anything. A super-call adds a SECOND, gentler way to change
something, and the two coexist — Nix has both. It does not fence anything off.
