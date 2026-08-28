---
id: ref-bun-zig-to-rust-port
title: Rewriting Bun in Rust
url: https://bun.com/blog/bun-in-rust
kind: informative
version: blog post dated 2026-07-08, with the porting guide added at commit 46d3bc2 on 2026-05-04
accessed: 2026-08-26
tags:
  - agent-behaviour
  - prior-art
  - review
---

One engineer drove roughly 64 agents for 11 days and rewrote 535,496 lines of
Zig as Rust. This note holds the two findings the method cards cite, and enough
scale for a reader to weigh them.

EVERY FIGURE HERE IS SELF-REPORTED, which is why the kind is informative. The
author measured his own project and nobody else has reproduced it.

DISCLOSURE THE POST MAKES ITSELF: Bun was acquired by Anthropic in December
2025, the author works there, and a pre-release model did the work.

## The scale

- 535,496 lines of Zig, excluding comments, across 1,448 files.
- 11 days, 3 May to a merge on 14 May, over 6,778 commits.
- About 50 workflows across 4 worktrees, 16 agents each.
- 5.9 billion uncached input tokens and 690 million output tokens.
- 1,386,826 assertions in the test suite, with 0 tests skipped or deleted.
- 19 known regressions, all fixed.

## The oracle is the part that does not transfer

Bun's test suite is written in TypeScript, so it does not care which language
the runtime is written in. It could judge the port because it was independent
of the port.

NOTHING ELSE IN THE METHOD WORKS WITHOUT THAT. Every loop below ends in "run
the tests", and a project whose tests test the thing being changed has no such
judge.

## Adversarial review

One implementer, two or more reviewers and one fixer, over every ported file.
The reviewer's only job is to find reasons the code is wrong.

THE STATED REASON: the agent that wrote the code wants it merged, which is the
same bias a human author carries. The reviewer therefore runs in a separate
context window and never implements.

Cited by `guidance/method/subagents.md`.

## Fixing the loop rather than the output

Agents read "get the crates to compile" as "stub out the failing functions",
and wrote long comments justifying the stubs.

The repair was one edit to the reviewers' prompt rather than a sweep over the
stubs. The new rule: if a workaround needs a paragraph of justification, the
code is wrong.

The author's own summary is that confidence came from fixing the process that
generates the code instead of hand-fixing the code.

Cited by `guidance/method/retro.md`.

## The work queue was derived from disk

A 46-line script reads a manifest of Zig files and filters out every one whose
Rust output already exists. The batch therefore recomputes after any crash, and
no agent has to remember what it did.

## What was read

The blog post whole and the porting guide whole, both on 2026-08-26. The guide
is 576 lines and arrived as the patch of commit 46d3bc2. Nothing here is
second-hand.
