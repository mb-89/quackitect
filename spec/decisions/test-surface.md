---
id: test-surface
type: test
statement: The command surface, composition (gather), and notes pipeline are present and runnable.
verifies: [command-surface, composition, notes-pipeline]
class: executed
verify: uv run python -c "import sys; from quackitect import cli, engine; ok = set(cli.CMDS) >= {'status','next','bless','note','ship','report','gather','lint','verify'} and hasattr(engine,'gather') and hasattr(engine,'add_note'); sys.exit(0 if ok else 1)"
killer: false
---

## Rationale (not load-bearing)
Baseline executed test. Asserts the command surface (the determinizer commands exist), composition (gather), and the notes pipeline (add_note).
