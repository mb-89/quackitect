---
id: report-determinism
statement: `quack report` produces byte-identical HTML across two runs on an unchanged ledger.
depends_on: [report-impl]
class: executed
verify: uv run python -m quackitect report --out .quack/out/_a.html && uv run python -m quackitect report --out .quack/out/_b.html && uv run python -c "import sys;sys.exit(0 if open('.quack/out/_a.html','rb').read()==open('.quack/out/_b.html','rb').read() else 1)"
killer: true
---

## Rationale (not load-bearing)
L4/Build (tests pass — executed). The real executed verify v0 lacked: determinism is the
report's load-bearing property, so it is RUN, not asserted. Closes the v0 open edge and
subsumes the archived gherkin note. Verify command refined when the command is built
(uv run python for portability; the self-test's python3 is unavailable on this box).
