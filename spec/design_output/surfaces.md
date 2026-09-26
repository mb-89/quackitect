---
kind: [[design_output]]
refines:
  - [[spec/design_input/the-index-holds-the-model]]
---

# Scope

A module as one file, and how the registry builds every surface off it. For the
argument, see [[spec/rationales/the-registry-builds-surfaces]]. The provider
kinds and the catalog stand in [[spec/design_output/model]].

# A module is one file

A topic folder under `modules/` is one Go package. Each file in it holds one
registration, its input struct, and a test beside it:

| the file | what it holds |
|---|---|
| `modules/work/open_tasks.go` | the input struct, and `q.Derived("work/open-tasks", ...)` in a package variable |
| `modules/work/open_tasks_test.go` | the cases, over the struct and the door fakes |

The package variable registers at `init`, so a new file joins the topic at the
next build. The file names no HTTP library, no MCP and no editor.

# The options

A registration takes options beside its function:

| the option | what it declares | who reads it |
|---|---|---|
| `q.Doc` | one line on what the value or the action is | every surface, as its help |
| `q.Show` | where the editor draws it, such as `q.Badge{On: "work/editor"}` | the sidebar |
| `q.Tool` | that agents call it | the hook tools and MCP |
| `q.Deadline` | how long a run takes at most | the watchdog |
| `q.Cfg` | a config key the module reads, with its default and doc | `cfg/`, and the generated config schema |

# What each surface gets

| the surface | what the registry builds |
|---|---|
| the command line | `quack get <name>`, `quack watch <name>`, `quack run <action>` with a flag per input field, and help off `q.Doc` |
| HTTP | `GET /v1/values/<name>` and `POST /v1/actions/<name>`, each with its type through Huma in the OpenAPI 3.1 document at `/v1/openapi.json`, with pages at `/docs` |
| SSE | `GET /v1/watch` with the names or a topic, pushing each change with its revision |
| MCP | a tool per action marked `q.Tool`, beside `index/get` and `index/why` |
| the hook tools | the same list, in the file [[spec/design_output/hook-protocol#the-tool-list]] names |
| the editor | the `index/shows` rows, which the sidebar draws |
| the window | the registry tabs, per [[spec/design_output/views#the-registry-tabs]] |
| the config schema | `spec/config/level0.schema.json`, generated from every `q.Cfg` and `q.Show` |

A name's segments become the path's segments. A call over HTTP shows the token
the standing file names.

# The generic contract tests

The contract tests run over every registration, so a new file meets them with
no case of its own. For the list, see
[[spec/design_output/migration#the-tests-after-the-move]].
