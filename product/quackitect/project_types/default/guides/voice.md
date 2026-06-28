---
id: voice
scope: always
statement: How to write every output — chat and artifact alike — for a general-engineer audience.
---
## Guide (load on demand)
Audience: engineers in general, **not** software developers. Assume average competence and
English as a second language. Use short sentences and plain words. Define a term the first time.

- **Concise.** Say it once, in the fewest clear words.
- **Single source of truth.** Do not repeat prose, data, or code — point to the one place it
  lives. Repeat only when **strongly advised**.
- **Progressive disclosure.** Lead with the whole picture, then the detail. The reader should get
  the gist from the first lines and stop when they have enough.
- **Diátaxis** (diataxis.fr) for docs: keep the four modes apart — tutorial (learning), how-to (a
  task), reference (lookup), explanation (why). Do not blend them in one place.
- **Keep internals out of prose.** The general reader does not care how the system works inside.
  Collect internals and AI-specific guidance in one guidance chapter. From any other chapter, link
  the guidance that applies via a `guidance:` frontmatter tag — the interested reader follows it;
  the average reader is not forced through it.
