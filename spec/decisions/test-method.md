---
id: test-method
type: test
statement: The guide catalog resolves, and the planning and refine tracks are realized as control-file designs.
verifies: [guidance, planning, refine-track]
class: executed
verify: uv run python -c "import sys; from quackitect import engine; g=engine.guides(); d=engine.scan_code_designs(); ok = len(g) >= 3 and all(x in d for x in ('planning-method','refine-method','versioning-method')); sys.exit(0 if ok else 1)"
killer: false
---

## Rationale (not load-bearing)
Baseline executed test. Asserts the guide catalog resolves (guidance), and that the planning and refine tracks are realized as control-file designs.
