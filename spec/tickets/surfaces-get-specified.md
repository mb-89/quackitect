---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change, with the test that covers it
    from: anyone
    by: anyone
    to: retro
    input: ask
    reads: [[spec/guidance/working]]
    needs: ["branch test"]
    checklist: ["the change follows the ask, or the discussion says why it departs", "the cleanup the change reveals is in the change, or is a note of its own", "every fact the change adds stands in one place, and a note points at the file instead of repeating it"]
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests that cover the change, or the check where it touches no code
      - name: check
        form: command
        expects: 0
        says: the check is green on the commit
      - name: says
        form: text
        says: what changes and why, for a reader who was not there
process: [[spec/processes/trivial]]
process_hash: 05e53b89dab63152
group: the-migration-writes-its-specs
step: do
---

# Ask

A design note specifies a module as one file, and how the registry builds every
surface off it. The surfaces are the command line, HTTP with its OpenAPI
document, SSE, MCP, the hook tools, the editor and the window. It names `q.Doc`, `q.Show` and `q.Cfg`.
[[spec/design_input/the-index-holds-the-model#a-module-is-one-file]] asks it. So
does [[spec/design_input/the-index-holds-the-model#the-registry-builds-each-surface]].

The foundation builds the `q` core and the `/v1` routes on this note. Without
it each surface names its own shapes again.

- a design note under `spec/design_output` says it, and `./RUNME.sh lint` passes over it
- `./RUNME.sh check` exits 0

# do

<!-- makes the change, with the test that covers it -->

## tests

    ./RUNME.sh check > /dev/null 2>&1 && echo green

## check

    ./RUNME.sh check

## says

[[spec/design_output/surfaces]] specifies a module as one file and the surfaces
the registry builds:

- a topic folder is one package, and each file holds one registration and its test
- the options `q.Doc`, `q.Show`, `q.Tool`, `q.Deadline` and `q.Cfg`, and who reads each
- the command line, HTTP with its OpenAPI document, SSE, MCP, the hook tools, the editor and the window
- the config schema, generated from the declarations

Weighed: `q.Tool` as a mark, against every action as a tool. The mark wins,
because an agent's tool list stays short and each tool a choice. Assumed: MCP
adds `index/get` and `index/why` beside the marked actions.

## checked

- the change follows the ask: the note covers the module file, each surface and the options
- the cleanup it reveals: none, because the note changes no file a reader holds
- the note points at the model, the views and the hook protocol notes, and restates none


# Discussion

<!-- what anybody adds, at any time, on this ticket -->
