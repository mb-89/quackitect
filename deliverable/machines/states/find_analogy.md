---
state: find_analogy
state_kind: work
priority: operational
tags: finders
entry_read:
  - deliverable/machines/methods/meth-analogy-transfer.md
exit_script:
  - deliverable/engine/bin/outward-search.ts
legal_tools: se_file_read, se_file_write, se_file_patch, se_file_search, se_file_glob, se_file_list, se_log_query, se_answer, se_web_search, se_web_fetch
evidence:
  - name: applies
    template: choice-with-rationale
    options:
      - yes
      - no
    passing:
      - yes
      - no
    rationale_for:
      - no
    description: whether this finder applies here
    guidance: |
      Pick `yes` where this finder ran. It needs no essay.

      Pick `no` and the engine demands the reason on the same line.

      A SKIP WITH NO REASON IS NOT A SKIP. It is a search nobody did,
      wearing a search's clothes, and the engine refuses it.
  - name: abstractions
    template: table
    columns:
      - cluster
      - abstract_problem
      - domains
    column_help:
      - which function cluster is being abstracted
      - the problem one level up, in nobody's jargon
      - every field that faces it, nature included, comma separated
    picks:
      cluster: $clusters
    description: each cluster restated one level up, with every field that already faces it
    guidance: |
      Not "archive rendering" but "showing a large history without
      drowning the reader". The abstraction is the work; the domains
      follow from it.

      NAME MANY DOMAINS, NOT THREE. Three was one person's reading, never
      the method. Include NATURE deliberately — biomimetic design is this
      method with biology as the source.

      Say which domains you could not describe honestly. An admitted gap
      beats a confident paragraph about a field nobody knows.

      The method is [[meth-analogy-transfer]].
  - name: options
    template: refs
    of: option
    description: one option node per transferred mechanism, each naming its source domain
    guidance: |
      Say what survived the translation AND what deliberately did not.
      A transfer with no losses was not a transfer.
guidance: FINDER 4 of 5 - the same abstract function, solved in another field. Abstract the cluster one level up. Name the domains that already face it. Describe each mechanism in ITS own terms, then transfer. Runs in parallel with the other four. Transfer the mechanism, never the surface. The method rides in from meth-analogy-transfer.md by tag.
---

# Find the analogy

The fourth finder. It reaches outside the domain entirely, which is why it
turns up options the other four structurally cannot.

## THE ABSTRACTION IS THE WHOLE WORK

Get it too concrete and no other field has the problem. Get it too abstract
and every field does, uselessly.

The level to aim for is where a librarian, an air traffic controller and an
immunologist would all recognise the question.

## DESCRIBE THE SOURCE HONESTLY BEFORE TRANSFERRING

In its own terms, with its own constraints. A mechanism summarised as
whatever we already wanted to hear is not a finding, and that failure is
invisible afterwards.

## WHAT DID NOT SURVIVE IS PART OF THE FINDING

Every transfer loses something. Naming the loss is what separates an analogy
from a slogan, and it is what the gate reads.
