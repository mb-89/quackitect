# Wire the language server

Level zero holds its rules at the write door and on the command line. The editor
sees none of them.

## Do this

1. Add `src/level0/lsp.js`, a language server speaking over stdin and stdout.
2. Answer `textDocument/didOpen` and `didChange` with `textDocument/publishDiagnostics`.
3. Read the findings from `src/level0/lib/vale.js`, so one rule set serves every door.
4. Carry the rule name as the diagnostic `code`, so the panel groups by rule.
5. Write a test under `src/level0/test/` driving one open and one change.

## What holds

- `./RUNME.sh check` stays green
- the diagnostic names the same rule the write door names
