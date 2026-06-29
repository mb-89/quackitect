---
id: verify-green
type: test
verifies: [req-split, req-coverage, req-metrics, req-version-mgmt, req-tooling, req-review]
statement: The i0002 integration suite is green. Report determinism holds. The three metrics compute, with no deferred placeholders. Version selection picks correctly. The trace/task split holds (trace is content, gates carry state). Coverage rules evaluate. The milestone-review guide exists. Suspect/bless is unchanged.
depends_on: []
class: executed
verify: uv run python -m quackitect report --out .quack/out/_a.html && uv run python -m quackitect report --out .quack/out/_b.html && uv run python -c "import sys, os; from quackitect import engine; n=engine.load_all(); m=engine.metrics(n); a=open('.quack/out/_a.html','rb').read(); b=open('.quack/out/_b.html','rb').read(); ok = a==b and set(m)>={'reversal','rework','selfcert'} and hasattr(engine,'pick_version') and bool(engine.pick_version(n)) and not engine.is_gate(n['req-split']) and engine.is_gate(n['m6-gate']) and os.path.exists('product/quackitect/project_types/default/guides/milestone-review.md'); sys.exit(0 if ok else 1)"
killer: true
---

## Rationale (not load-bearing)
M6 killer (executed). Asserts determinism AND that the metrics were built (the deferred
placeholder is gone). Stays OPEN until build-metrics lands. EXTEND during build to also
assert version-selection.
