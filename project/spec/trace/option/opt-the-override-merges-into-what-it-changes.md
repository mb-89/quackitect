---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-override-merges-into-what-it-changes
type: "[[option]]"
statement: an override states only the keys it changes, and the machine merges them into the received artifact key by key rather than replacing the whole of it
cluster: the-walk
question: how much of an artifact an override replaces
found_by: prior-art
source: "Kustomize strategic merge patches (kubectl.docs.kubernetes.io/references/kustomize/kustomization/patches/), Helm values precedence and null-deletes (helm.sh/docs/chart_template_guide/values_files/), Hugo theme components data and i18n merging (gohugo.io/hugo-modules/theme-components/), Jekyll _data merging (jekyllrb.com/docs/themes/)"
---

## Mechanism

THE OVERRIDE IS A PARTIAL DOCUMENT. It names some keys and says nothing about
the rest. Resolution walks both structures together and takes the override's
value wherever it has one.

FOUR SYSTEMS DO THIS, and three of them do it ONLY for structured data while
replacing whole files for everything else.

- Hugo states the split outright: data and translation files merge deeply by
  key, while templates and static files are merged at file level and the
  left-most wins.
- Jekyll merges `_data` by key and replaces layouts, includes and assets
  wholesale. Its documentation recommends the data route specifically as the
  way to avoid forking a whole include.
- Helm merges values through a fixed precedence chain, and setting a key to
  null DELETES it rather than setting it empty.
- Kustomize's strategic merge patches carry only the fields being changed.

WHAT IT BUYS. Upstream keeps ownership of everything the copy did not mention.
A later change to an untouched key arrives normally, which is the property
whole-file replacement cannot have.

AND IT NEEDS NO SUPER-CALL, because nothing was replaced in the first place. It
reaches the same outcome as [[opt-the-override-calls-through-to-what-it-replaced]]
without the upstream author having to name extension points in advance.

WHAT IT COSTS. It only works on artifacts with STRUCTURE. Three of the four
systems fall back to whole-file replacement for prose and templates, which is
most of what this product's method actually consists of.

SO IT WANTS A DECISION ABOUT WHAT AN ARTIFACT IS. Merging reaches a method
document's frontmatter easily and its paragraphs not at all, unless the
document's sections are themselves addressable.

AND DEEP MERGING SURPRISES PEOPLE. Helm's own documentation carries a worked
case where two competing definitions coalesce into invalid output rather than
one winning. A merge that produces something neither side wrote is a failure
mode replacement does not have.
