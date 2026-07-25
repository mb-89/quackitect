---
id: se.law-imports-are-read-only
kind: decision
statement: "AN IMPORT IS READ-ONLY. Whatever mechanism implements it, anything declared as an import may only READ what it imports: resolve it by path, read its files, record its version. It may NEVER write into it, move it, delete it, build inside it, or create any filesystem structure through which another operation could reach it - no symlink, no junction, no hardlink, no mount, no install step that writes to the source. Only a VENDORED dependency may be modified, and only our own copy of it. The mechanism is not the rule; the DIRECTION OF WRITES is the rule, and any new import mechanism must be checked against it before adoption. Owner ruling, 2026-07-25, generalized deliberately: a rule naming one forbidden mechanism only invites the next one."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: "A tool can destroy the thing it imports. Witnessed 2026-07-25: package.json declared the kb module as an npm file:-protocol dependency, npm implemented that as a symlink into the sibling benjamin checkout, and a routine `git worktree remove --force` followed the link and deleted benjamin's working tree and its .git. The symlink was only the mechanism of the day - what actually failed was that a write reached the imported source at all."
applies_to: every dependency declared as an import - modules, software, references - and every mechanism that might implement one
---


