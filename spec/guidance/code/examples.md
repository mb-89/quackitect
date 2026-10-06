---
kind: [[guidance]]
tags: [testing]
scope: ["every behavior test, and every ticket naming one"]
rationale: [[spec/rationales/examples]]
---

# Actionables

1. Show a normal behavior as a user example, and an edge as a developer case naming its edge. A behavior shown in a test alone teaches no user, and drifts from the tutorial. [[spec/design_output/examples#the-places]] *
2. Write an example's steps as `./RUNME.sh` calls, each with `# expect:` lines asserting the behavior it shows. [[spec/design_output/examples#the-format]]
3. Delete a test asserting again what an example shows. A second assertion of one behavior drifts from the first, and spends the lines the ratio counts. [[spec/design_output/examples#the-suite]] *
4. Give every verb, tab and door-facing feature an example naming it under `interface`. [[spec/design_output/examples#the-checks]]
5. Name in a ticket's `done_when` the example that proves it, once the harness runs examples in the check. [[spec/design_output/examples#the-checks]]
