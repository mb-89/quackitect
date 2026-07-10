---
id: req-build-cheap
type: requirement
statement: quack build and dispatch shall stay cheap - the compile skipped when unchanged, verdicts kept surgically, no needless child process - the numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When no engine source changed since the last build, quack build shall skip the compile and re-baseline within one second on the reference machine. *(was req-build-fast-path)*
2. When quack build re-baselines, the engine shall keep every verdict whose inputs did not change. *(was req-verdict-surgical)*
3. When a command needs no fresh binary, the engine shall spawn no child engine process. *(was req-launcher-single-dispatch)*
