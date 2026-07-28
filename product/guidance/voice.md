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
- A sentence chaining three or more comma- or semicolon-joined items is an unrendered list. Render it as a list. Two-item joins stay judgment.

### Paragraphs
- One thought group per paragraph. A new thought starts a new paragraph.
- A wall of text is a defect. Readers are not native speakers. Their patience is limited. Structure is mercy.
- Long prose carries line breaks. Every HTML surface renders them (pre-wrap). The lane refuses a breakless wall mechanically (SE-C-125). The render cannot invent paragraphs — the author supplies them.
- Found a wall of text? Refactor it. Split it into paragraphs, one thought group each. Give the paragraphs SMALL HEADINGS when there are more than a few. This binds existing text as much as new text.
- Embedded prose fields follow the same rules. State guidance, tool descriptions, form help — short sentences, paragraphs, lists. Never one long block.

### Lists
- Use a list for three or more items. Do not bury them in a sentence.
- Every enumeration is a Markdown list. Always. Not prose, not comma chains.
- One item per line. In Markdown, one `-` per line.
- Never chain several things with commas inside one item. Nest a sub-list instead.
- No compound sentences inside an item. Short simple sentences only.
- If an item grows, split it. Make two items, or a sub-list.
- Never collapse a list onto one line. This holds everywhere it renders: chat, HTML, tooltips, table cells, question boxes.
- Keep list items FLAT where the surface renders nesting poorly (notifications). One line per item. No sub-bullets there.
- A question card collapses line breaks in its question text. Keep the question line to one sentence. Put structured content in the option previews. They render markdown.
- Lead each item with its key word.
- Link the referent. An item that points at a file, note, or URL carries it as a link.

### Identifiers
- Expand every identifier in the message that uses it. Never assume an id travels.
- The reader adjudicates from chat and the board. They have not read the evidence files where the ids live.
- Prefer the plain phrase. Use the id only where traceability needs it.
- An unexpanded id reads as precision and carries nothing.

### AI involvement
- The AI-involvement marks measure involvement. Never quality. Never trust.
- The author owns all published content, whatever the AI share. "The AI wrote it, I did not review it" is unacceptable.
- Quality with AI ratchets up. Never trade quality for speed or comfort. That trade ends in slop.

### Figures
- Prefer a diagram over prose when it transports the information better. Use figures generously.
- Author every figure in a text-based form: inline SVG with real text, Mermaid, or ASCII. A machine must be able to read it.
- Give each figure one line saying what to see in it.

### Visual design
- The owner owns visual design. A sketch is a contract: render exactly what it shows.
- Never add a visual element the sketch does not show. A missing affordance becomes a question to the owner, never a silent addition.
- A prefill is a suggestion, never content. Anything the AI prefills for a person stays inert (commented out) until that person confirms it — one confirmation per prefill, never in bulk.
- Every widget gets a maximize control. It opens the widget full-screen as a modal over the grayed page. Close returns to the layout.
- Click for detail. Clicking an element shows its details: a dedicated surface if one exists, the details pane as the fallback.
- Help is a detail, never a button. Clicking a control surfaces its context-sensitive help in the details pane. No dedicated help buttons or icons exist anywhere.
- Panes hold their size. Content never resizes the layout. The maximize modal is the room to breathe.
- Interacting with a field never collapses its surface. No fold closes, no scroll resets, no pane re-opens — the reader keeps their place through every click.
- Color carries meaning, never decoration: green = pass, red = failure or rejection, yellow = attention.
- Feedback within a second. Any interaction that can take longer than a second shows loading feedback at once. A progress bar with real progress where progress exists; an indeterminate bar otherwise. Silence reads as breakage.

### Do not repeat (DRY)
- Single source of truth. Each fact lives in one place. Everything else points to it.
- Markdown is the truth. Anything whose truth lives in markdown keeps it Obsidian-compatible and human-editable IN THE REAL WORLD — a million-line file is not editable. Generated surfaces derive from the markdown, never the reverse. Log files are the one exception.
- Machines are drawn. A state machine's truth is its Obsidian canvas, and a person edits it in Obsidian, in the real world (owner law, 2026-07-28). The engine accepts what a person naturally draws. A mechanism that depends on metadata Obsidian does not surface to its editor is a defect — rework the mechanism, never the person.
- Do not repeat prose, data, or code. Not across files. Not across panels. Not within one screen.
- If two places show the same thing, delete one. A detail view should not echo what its parent already shows.
- A field that restates another field is NOISE. A statement that repeats the id, a title that repeats the name, a label that echoes the filename - strike it. Empty is better than an echo; a field is filled only when it ADDS something.
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

### Working visibly
- On a long task chain, keep a visible todo list. Use the harness's task-list surface when it has one.
- Check items off as you finish them. The reader sees where you are without asking.
- Update the list when the plan changes. A stale list misleads worse than none.

### Answered questions
- A direct question from a person gets its answer RECORDED, not only chatted. Use se_answer with the question and the full answer.
- The log shows an aq entry. The feed line is the question. The click shows both.
- Chat can be lost mid-turn. The harness may swallow an answer while you work. The log entry is the durable copy. Record it in the same breath as the chat answer.
- The question and the answer are SEPARATE PARAGRAPHS wherever they appear together. In se_answer they are separate fields already. In a note or a report, a blank line divides them. Never one run-on blob.
- WRITE THE ANSWER ONCE. Compose it a single time, record it, then print THAT SAME TEXT in chat. Never write a second version for the reader.
- Two versions cost tokens twice and leave the reader comparing them to see whether they agree. That is work you handed them for nothing.
- Sources and links belong in the RECORDED copy too, not bolted onto the chat one.

### The sycophancy guard (applies to every assessment)
- Praise is a signal, not a nicety. Endorse only what survives the disconfirming question.
- If ours is genuinely better, say so plainly. If it is a tradeoff, name the tradeoff: what we gain, what we pay. Never dress a tradeoff as a win.
- In any comparison, state what the other side does better first. Then what ours does.
- A validation-shaped question finds validation. Say so, and offer the falsifying question.
- If the ledger records a risk against the design, cite it in the same breath as any praise.

### Dated guidance (applies to every citation, and to your own instincts)
- Do not ask how OLD a piece of guidance is. Ask which resource it was RATIONING.
- Rations human LABOUR: suspect it. That cost collapsed once a machine started doing the work.
- Rations human JUDGEMENT or ATTENTION: it still holds. There is still one owner, and they still have to look at the diff.
- Most guidance predates AI and was written for human teams. Split it along that seam instead of quoting or discarding it whole.
- This binds the assistant's own instincts too. The training assumes writing the code is the expensive part. Where a recommendation rests on that assumption, say so rather than asserting it.

### Explaining a problem
- Explain it plainly first, like to a smart outsider. What the parts do. What changed. Who is right.
- Name each mechanism by what it does ("the checker", "the live table"). Not by its internal identifier.
- Give the verdict in one sentence before any options ("the book is right, the checker is outdated"). This is BLUF - the bottom line up front; the method card holds the depth (product/deliverable/machines/methods/bluf.md).
- Then ask the decision as short numbered questions. As few as possible.

### Structure
- Progressive disclosure. Give the whole picture first. Then the detail. The reader stops when they have enough.
- Longer texts (roughly five paragraphs and up) take the PYRAMID shape. A TLDR or abstract at the top. Then the high-level view. Then deepening detail. The fully detailed discussion sits at the bottom. A single paragraph needs none of this. The method card holds the depth - product/deliverable/machines/methods/progressive-disclosure.md.
- Diátaxis (diataxis.fr) for docs. Keep the four modes apart: tutorial, how-to, reference, explanation. Do not blend them in one place.
- Keep internals out of prose. The general reader does not care how the system works inside. Put internals and AI guidance in one guidance chapter. Link it with a `guidance:` frontmatter tag. The interested reader follows it. The average reader is not forced through it.
- ENTRY documents carry no method jargon (owner law, 2026-07-12). The README and anything a stranger reads FIRST use plain language only - a method term (suspect, bless, cone, gate) may appear where its definition is one click away (the book's termrefs), never bare in the front door. The i17 red-team and the i19 cold-read both caught exactly this; the terms lint cannot see the README, so the rule holds by authorship.
