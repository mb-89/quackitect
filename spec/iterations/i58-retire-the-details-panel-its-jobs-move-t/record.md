---
id: i58-retire-the-details-panel-its-jobs-move-t
status: seeded
opened: 2026-08-21T13:17:40.513Z
goal: "Retire the details panel. Its jobs move to the preview surface and to the editor panel, and the panel itself is removed rather than slimmed."
vision: "DONE LOOKS LIKE: deliverable/engine/renderclient-detail.ts no longer renders a details pane, nothing calls showDetails, and every job that pane held has a named new home or a recorded decision to drop it.\n\nTHE OWNER RULED THIS ON 2026-08-21 and it is not reopened here. This iteration executes it.\n\nWHY IT COMES LAST. Removing the only durable reference surface is the one step with no way back. Once the previews carry its jobs, deleting it is evidence rather than a bet. That ordering is the whole reason this is a third record instead of a line in the first.\n\nWHAT THE PANE ACTUALLY DOES TODAY, so nothing is dropped by accident. Its core is jsonTable, which takes any object and prints every key as a row, collapsing arrays over three items behind a disclosure triangle. That generic dump is WHY it is overloaded: nothing decides what matters. The pane also fetches /api/recdecisions to fill part of itself, which is a shape a static export cannot carry at all.\n\nTHE ENTRY POINT IS showDetails, and it already crosses the frame boundary: with no local pane it posts the subject to the parent host instead, with the comment that details are a surface the host owns. That channel is worth keeping even as the pane goes, because it is the existing door for a preview that a narrow sidebar would clip.\n\nTHREE OTHER OVERLAY SURFACES LIVE IN THE SAME FILE and their fate belongs in this iteration's scope question, not in a later surprise: the modal, the toast, and the pane itself. Adding previews without settling these leaves four overlapping overlays where there were three.\n\nTHE HONEST RISK, recorded here because it was argued and overruled rather than missed. The pane is overloaded because of jsonTable, not because it is a panel. If the abstracts feeding the previews are derived from the same objects jsonTable prints, this iteration will have moved a dump rather than removed one. The check is whether every abstract stands alone as a concise version of its thing, and that check belongs at this iteration's gate."
inputs:
  - "i56-build-the-help-dictionary-and-the-previe"
  - "i57-migrate-every-help-surface-in-the-produc"
  - "note-027b8e463fe8"
  - "deliverable/engine/renderclient-detail.ts"
depends_on:
  - "i57-migrate-every-help-surface-in-the-produc"
---

# i58-retire-the-details-panel-its-jobs-move-t

## Goal

Retire the details panel. Its jobs move to the preview surface and to the editor panel, and the panel itself is removed rather than slimmed.

## Rough vision

DONE LOOKS LIKE: deliverable/engine/renderclient-detail.ts no longer renders a details pane, nothing calls showDetails, and every job that pane held has a named new home or a recorded decision to drop it.

THE OWNER RULED THIS ON 2026-08-21 and it is not reopened here. This iteration executes it.

WHY IT COMES LAST. Removing the only durable reference surface is the one step with no way back. Once the previews carry its jobs, deleting it is evidence rather than a bet. That ordering is the whole reason this is a third record instead of a line in the first.

WHAT THE PANE ACTUALLY DOES TODAY, so nothing is dropped by accident. Its core is jsonTable, which takes any object and prints every key as a row, collapsing arrays over three items behind a disclosure triangle. That generic dump is WHY it is overloaded: nothing decides what matters. The pane also fetches /api/recdecisions to fill part of itself, which is a shape a static export cannot carry at all.

THE ENTRY POINT IS showDetails, and it already crosses the frame boundary: with no local pane it posts the subject to the parent host instead, with the comment that details are a surface the host owns. That channel is worth keeping even as the pane goes, because it is the existing door for a preview that a narrow sidebar would clip.

THREE OTHER OVERLAY SURFACES LIVE IN THE SAME FILE and their fate belongs in this iteration's scope question, not in a later surprise: the modal, the toast, and the pane itself. Adding previews without settling these leaves four overlapping overlays where there were three.

THE HONEST RISK, recorded here because it was argued and overruled rather than missed. The pane is overloaded because of jsonTable, not because it is a panel. If the abstracts feeding the previews are derived from the same objects jsonTable prints, this iteration will have moved a dump rather than removed one. The check is whether every abstract stands alone as a concise version of its thing, and that check belongs at this iteration's gate.

## Inputs

- i56-build-the-help-dictionary-and-the-previe
- i57-migrate-every-help-surface-in-the-produc
- note-027b8e463fe8
- deliverable/engine/renderclient-detail.ts
