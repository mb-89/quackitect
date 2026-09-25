---
kind: [[design_output]]
---

# Scope

One web page draws a ticket's route, or a process's, out of the graph the
emitter answers. This note covers the page, the messages it trades with its
host, and the test driving it. The plan stands in
[[spec/design_input/the-editor-draws-the-ticket#the-drawing-draws-a-route]].

# The page draws a route

`src/extension/webview/route/drawing.js` is the entry, and install bundles it
into the one script a webview loads. For details, see
[[spec/design_input/the-editor-draws-the-ticket#the-owner-rules]].

The page mounts on the element `route`, and draws nothing until a graph
arrives. It holds no file and reads no disk: the host hands it every graph.

## The layout reads the graph

`src/extension/webview/route/layout.js` turns the emitter's graph into the
nodes and edges React Flow draws, and `@dagrejs/dagre` places them top to
bottom. Every node and every edge the graph carries draws once.

| the graph carries | the node wears the class |
|---|---|
| `kind` | `leaf` or `phase` |
| `at` | `at`, where the pointer stands |
| `person` | `person` |
| `dotted` | `dotted`, where `when` names a condition |
| `skipped` | `skipped`, and `why` rides the title |
| `returns` | `returns`, and the count rides the label |
| `reached` | `reached`, where `ticket route` refuses an edit to the step |

An edge wears its `kind` as its class: `pass`, `fail` or `holds`. A fail edge
moves, so a return reads apart from the road ahead.

## The theme follows the host

The page draws in the editor's colours, and the variables the editor sets on a
webview carry them. A `theme` message picks the light or the dark scheme React
Flow draws its own parts in.

# The page speaks in messages

The page and its host trade messages alone, so any host drives it: the editor,
a side panel, or the fake host a test builds.

| from | kind | carries | when |
|---|---|---|---|
| page | `ready` | nothing | once, when the page mounts |
| host | `graph` | `graph`, the emitter's answer, `steps`, the route, and `held`, where the person holds the pointer's leaf | on open, and on every change |
| host | `theme` | `theme`, `light` or `dark` | on open, and on every change |
| page | `jump` | `step`, `chapter` and `line`, the node's place | a press on a node carrying a place |
| page | `take` | `step`, the pointer's leaf | a press on the pointer's button, where `held` stands false |
| page | `handback` | `step`, the pointer's leaf | a press on the pointer's button, where `held` stands true |
| page | `edit` | `steps`, the whole route `ticket route` takes | a press on a step's move or drop |

The host posts to the page with the webview's `postMessage`, and the page
listens on `message`. The page posts through `acquireVsCodeApi`, the one
call a webview carries.

A message of a kind the page holds no reading for changes nothing.

# The page takes an edit

`src/extension/webview/route/edit.js` works an edit on the `steps` the host
hands the page, and answers the whole route. A step ahead of the pointer
carries the buttons up, down and drop. A move swaps the step with its
sibling, and the page greys out a button whose edit touches a `reached` step.
A `reached` step carries no buttons. For the rule, see
[[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]].

The page draws no edit of its own: the host runs `ticket route`, and the next
`graph` message draws the route it writes. A graph message with no `steps`
draws no edit buttons. A pick of the hand, the condition or a fail edge waits
on the desk trial the design input names.

# A fake host drives it

`test/contract/drawing-page.test.js` loads the bundle into the browser install
resolves, with a fake `acquireVsCodeApi` catching what the page posts. It
posts a graph and a theme, reads the page back, and presses a node, the
pointer and each edit. For the browser, see
[[spec/design_input/the-editor-draws-the-ticket#install-resolves-a-browser]].
A box with no browser skips the case and names why.
