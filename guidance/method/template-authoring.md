---
id: template-authoring
statement: The rules for writing a template - consulted when authoring, pulled nowhere.
---

# Template authoring — the rules

## A template IS the file it mints

One fence. Nothing beside it.

- Write the frontmatter the artifact carries.
- Give every key that must be filled a COMMENT saying what belongs there.
- Write the headings the body carries.
- Give every heading a COMMENT under it saying what belongs there.
- The author replaces each comment with real content. That is the whole job.

A YAML comment opens with `#`. A markdown comment is `<!-- -->`. Both survive
into the minted file. An unfilled section stays visible until someone strikes
the comment.

## Do not write it three times

The shape this rule replaces had an `## Example` fence, a `## Mint skeleton`
fence, and prose sections describing the same fields a third time. Three
copies of one truth. Only one of them ever gets updated.

- Strike `## Example`. The template is the example.
- Strike the second fence. The one fence is what gets minted.
- Strike `## Fields` and `## Body`. A field's meaning belongs beside the
  field, in its comment.

Prose that survives is prose about the TYPE, never about filling one node.
Where the artifact lives, what makes it standing, what checks it — that stays
above the fence.

## What a comment may not do

- It may not echo the key's own name. Empty beats an echo.
- It may not open a line with `word:` inside the fence. The engine reads any
  such line as a declared key.
- It may not name an OPTIONAL field as a live key. A key in the fence is a key
  the conformance check demands, so an optional field rides a comment instead.

## The TODO marker earns its keep

A value the author must supply reads `TODO — what belongs there`.

The conformance check counts a TODO left in place as unanswered. A skeleton
can never pass as filled work.

A default that is genuinely right is written as the value, with no TODO.
`priority: must` is one such default.
