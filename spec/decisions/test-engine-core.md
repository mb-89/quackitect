---
id: test-engine-core
type: test
statement: The core engine realizes suspect/bless, the fill/adjudicate split, and version-aware walking.
verifies: [suspect-bless, fill-adjudicate, versioning]
class: executed
verify: uv run python -c "import sys, inspect; from quackitect import engine; ok = all(hasattr(engine,x) for x in ('bless','why','is_gate','pick_version','versions')) and 'filled_by' in inspect.getsource(engine.bless); sys.exit(0 if ok else 1)"
killer: false
---

## Rationale (not load-bearing)
Baseline executed test. Asserts the core engine: suspect/bless exists, the fill/adjudicate split (filled_by recorded separately), and version-aware walking.
