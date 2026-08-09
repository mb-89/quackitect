---
id: opt-idempotent-scaffold-with-drift-detection
type: "[[option]]"
statement: make scaffolding repeatable on an existing tree, and report where the tree has drifted from the template rather than overwriting it
cluster: cluster-the-bootstrap
found_by: prior-art
source: "scaffold-project skill, https://lobehub.com/skills/opsmachine-om-agency-scaffold-project"
---

## Mechanism

Running the same scaffold twice does not corrupt what is there. The tool
compares the tree against the template, reports the drift, and updates what
the person accepts. The source names idempotency as the hard part of
scaffolding, and re-running generation on an existing repo as where it
usually breaks.

WHAT IT WOULD COST HERE. This system scaffolds once and never again, so a
product that has drifted from its template has no road back. The overlay
mechanism reports drift for method files and nothing does it for the product
tree.

The cost is a comparison that has to know which differences are the
builder's own work. A scaffold that reported every deliberate edit as drift
would be noise, and this system already has a name for that failure.
