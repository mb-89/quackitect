---
id: wt-opening-work-at-a-record-that-is-seeded-but-not-yet-walked-p
type: "[[work-token]]"
statement: |-
  Opening work at a record that is seeded but not yet walked puts it somewhere that does not outlive the machine, and nothing warns.

  WHAT HAPPENS. The open verb takes a position and mints a token with a state lifetime, held in the session's own store. That is right for work being done here and now: it lives while the position lives and goes when the position is left.

  WHY IT IS WRONG FOR A SEEDED RECORD. A record seeded today may not be walked for a month, and the machine-local store does not last a month. Every item standing at a seeded record today is a file in version control instead, so the two mechanisms disagree about where the same thing belongs.

  THE FAILURE IS SILENT. The call succeeds, the answer says where it landed, and the answer does not say that it will not be there later. A hand that has just been told to remember something believes it was remembered.

  MEASURED 2026-08-28. An instruction given in chat was opened at a record twenty-six positions away from the walk and had to be written into version control by hand afterwards.

  WHAT WOULD SETTLE IT. Either the verb reads the position and mints durably when the position is a record nobody is standing in, or it refuses and names the durable route. Guessing is worse than either.
place: i69-the-method-checks-what-it-claims-to-chec
ready_when: ready when the work verbs are next opened
---

## Why it stands

Opening work at a record that is seeded but not yet walked puts it somewhere that does not outlive the machine, and nothing warns.

WHAT HAPPENS. The open verb takes a position and mints a token with a state lifetime, held in the session's own store. That is right for work being done here and now: it lives while the position lives and goes when the position is left.

WHY IT IS WRONG FOR A SEEDED RECORD. A record seeded today may not be walked for a month, and the machine-local store does not last a month. Every item standing at a seeded record today is a file in version control instead, so the two mechanisms disagree about where the same thing belongs.

THE FAILURE IS SILENT. The call succeeds, the answer says where it landed, and the answer does not say that it will not be there later. A hand that has just been told to remember something believes it was remembered.

MEASURED 2026-08-28. An instruction given in chat was opened at a record twenty-six positions away from the walk and had to be written into version control by hand afterwards.

WHAT WOULD SETTLE IT. Either the verb reads the position and mints durably when the position is a record nobody is standing in, or it refuses and names the durable route. Guessing is worse than either.

## When it comes back

ready when the work verbs are next opened
