---
id: wk-d7efda9e18
seq: 1000148
type: work
title: stale is not slow
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

The quiet-hold detector measures a reviewer in pulls, PullsBeforeHoldIsStale, and pulls are other actors' traffic, so in a busy lane every healthy reviewer looks stale. It flagged rev-10 four minutes into a review and rev-11 three minutes into one while both were mid-work. The investigate answer stays and the gauge feeding it changes. Measure staleness in time since the holder's last engine action, or count only pulls by the holder's own role, or both with time primary. The threshold rides in config the way the pull count does today.
