# evidence_form — the condition

The state demands a filled EVIDENCE FORM: an A3-style one-pager in the
bound expedition's record. The condition's arguments name form TEMPLATES
(project/deliverable/machines/forms/<name>.md). Each template declares its
fields and its instance file.

How to satisfy it:

- Create or open the instance the template names (`instance:` in the
  template frontmatter — e.g. report.md in the record).
- Fill every required section with VISIBLE content. An HTML comment does
  not count: agent prefills are written commented out, and a human
  confirms each one — uncomment in the file, or the confirm button in the
  mirror. A form never passes on unconfirmed prefills.
- List evidence files in the frontmatter `files:`; each must exist in the
  record's evidence/ folder.
- Set `status: done`. The mechanical lint runs on the transition — either
  hand, the same checks.

The lint checks shape, never quality. Quality is reviewed where the walk
reviews (the report's adjudication), not here.
