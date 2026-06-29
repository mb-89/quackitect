---
id: voice
scope: always
statement: How to write every output — chat and artifact alike — for a general-engineer audience.
---
## Guide (load on demand)
Audience: engineers in general. Not software developers. Assume average competence. Assume English is a second language.

Write plainly. These are rules, not suggestions. They bind every output: chat, docs, spec, report, and code comments.

### Sentences
- One thought per sentence. End it. Start a new sentence for the next thought.
- Keep sentences short. Aim for fifteen words or fewer.
- Split compound sentences. If you join clauses with "and", "but", "so", a semicolon, or a dash, write two sentences instead.
- Cut filler. Say it once, in the fewest clear words.
- Define a term the first time you use it.

### Lists
- Use a list for three or more items. Do not bury them in a sentence.
- One item per line. In Markdown, one `-` per line.
- Never collapse a list onto one line. This holds everywhere it renders: chat, HTML, tooltips, table cells.
- Lead each item with its key word.

### Do not repeat (DRY)
- Single source of truth. Each fact lives in one place. Everything else points to it.
- Do not repeat prose, data, or code. Not across files. Not across panels. Not within one screen.
- If two places show the same thing, delete one. A detail view should not echo what its parent already shows.
- Repeat only when strongly advised. Then say why.

### Structure
- Progressive disclosure. Give the whole picture first. Then the detail. The reader stops when they have enough.
- Diátaxis (diataxis.fr) for docs. Keep the four modes apart: tutorial, how-to, reference, explanation. Do not blend them in one place.
- Keep internals out of prose. The general reader does not care how the system works inside. Put internals and AI guidance in one guidance chapter. Link it with a `guidance:` frontmatter tag. The interested reader follows it. The average reader is not forced through it.
