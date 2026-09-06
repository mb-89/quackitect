---
kind: [[rationale]]
title: a cloud box writes refs/heads and nothing else
explains:
  - src/engine/claim.go
  - src/engine/claimsync.go
---

## decided

A cloud box publishes on refs/heads and nowhere else.
Nothing this project pushes may name a tag, a note or a ref of its own.

## why

Measured on 2026-09-06, one commit object, one session, six pushes minutes apart.
refs/heads was created twice.
refs/se, refs/notes, refs/tags and refs/tags/archive each answered HTTP 403.
A delete of a branch just created answered 403 as well.

The cause is the git proxy rather than GitHub.
Anthropic's sandboxing note says the proxy verifies the contents of the git interaction, and that it validates branch names.
So it reads the receive-pack body and matches each ref update against a branch-name policy.
A tag, a note and a custom ref are not in that vocabulary, and they fail closed.

It is not a Cloudflare rule.
Issue 57829 guessed that, drew no corroboration, and was closed as a duplicate.
The proxy applies whatever the environment's network access is set to, so the egress relay logged nothing while these pushes failed.

Two reports from other boxes say the same thing.
Issue 65923 has branch pushes working and refs/tags rejected in one session, closed as not planned with no reply.
Issue 85454 has the same refusal for a delete, and the REST path answering that write access is not permitted through this proxy.

## costs

refs/se/claims cannot carry a claim off a cloud box, and never could.
The archive tags under refs/tags/archive cannot travel either.
A push that can never succeed reads exactly like a network blip, because the code cannot tell permanent from temporary.

## revisit when

- a tag or a note pushes from a cloud box, so the policy has grown past branches
- one check refuses a push outside refs/heads, so each caller stops discovering it alone
