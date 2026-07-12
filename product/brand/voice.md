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
- Every enumeration is a Markdown list. Always. Not prose, not comma chains.
- One item per line. In Markdown, one `-` per line.
- Never chain several things with commas inside one item. Nest a sub-list instead.
- No compound sentences inside an item. Short simple sentences only.
- If an item grows, split it. Make two items, or a sub-list.
- Never collapse a list onto one line. This holds everywhere it renders: chat, HTML, tooltips, table cells.
- Lead each item with its key word.
- Link the referent. An item that points at a file, note, or URL carries it as a link.

### AI involvement
- The AI-involvement marks measure involvement. Never quality. Never trust.
- The author owns all published content, whatever the AI share. "The AI wrote it, I did not review it" is unacceptable.
- Quality with AI ratchets up. Never trade quality for speed or comfort. That trade ends in slop.

### Figures
- Prefer a diagram over prose when it transports the information better. Use figures generously.
- Author every figure in a text-based form: inline SVG with real text, Mermaid, or ASCII. A machine must be able to read it.
- Give each figure one line saying what to see in it.

### Do not repeat (DRY)
- Single source of truth. Each fact lives in one place. Everything else points to it.
- Do not repeat prose, data, or code. Not across files. Not across panels. Not within one screen.
- If two places show the same thing, delete one. A detail view should not echo what its parent already shows.
- Repeat only when strongly advised. Then say why.

### Comments & provenance
- Write comments the way people write them: only where a reader would be surprised.
- A comment states a constraint the artifact cannot show itself. Nothing else.
- Never comment that a rule was followed, who ruled it, or when. No dates. No step numbers. No law citations at application sites.
- The why lives ONCE, in its designated home: an ADR, a `decided_via`, an evidence doc, a note, the ledger. Everywhere else, the artifact just IS the consequence.
- A deliberate choice that must survive future edits gets a TEST or a LINT, not a comment. A comment is the weakest guard.

### People & privacy
- No personal data in anything stored or published. That covers spec, evidence docs, trace nodes, reports, and entry files. Use the stakeholder ROLE instead: the owner, the adjudicator, the driving agent, the maintainer.
- Do not write "human vs agent" in prose. Say "people" or "persons", or name the role. The engine's actor stamp is a recorded metric with fixed vocabulary. Prose is not.

### Explaining a problem
- Explain it plainly first, like to a smart outsider. What the parts do. What changed. Who is right.
- Name each mechanism by what it does ("the checker", "the live table"). Not by its internal identifier.
- Give the verdict in one sentence before any options ("the book is right, the checker is outdated").
- Then ask the decision as short numbered questions. As few as possible.

### Structure
- Progressive disclosure. Give the whole picture first. Then the detail. The reader stops when they have enough.
- Diátaxis (diataxis.fr) for docs. Keep the four modes apart: tutorial, how-to, reference, explanation. Do not blend them in one place.
- Keep internals out of prose. The general reader does not care how the system works inside. Put internals and AI guidance in one guidance chapter. Link it with a `guidance:` frontmatter tag. The interested reader follows it. The average reader is not forced through it.
- ENTRY documents carry no method jargon (owner law, 2026-07-12). The README and anything a stranger reads FIRST use plain language only - a method term (suspect, bless, cone, gate) may appear where its definition is one click away (the book's termrefs), never bare in the front door. The i17 red-team and the i19 cold-read both caught exactly this; the terms lint cannot see the README, so the rule holds by authorship.
