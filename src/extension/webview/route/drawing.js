// The drawing's entry. It draws the graph its host hands it, and speaks to the
// host through messages alone. The bundle step writes it into the one script
// a webview loads.
// [[spec/design_output/drawing#the-page-draws-a-route]]

import { ReactFlow } from "@xyflow/react";
import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "./drawing.css";
import { dropped, moved, reachedIn } from "./edit.js";
import { laidOut } from "./layout.js";

const EMPTY = { nodes: [], edges: [] };
const SCHEMES = new Set(["light", "dark"]);

// The one call a webview carries, and nothing where the page stands alone. [[spec/design_output/drawing#the-page-speaks-in-messages]]
function hostOf(scope) {
  if (typeof scope.acquireVsCodeApi !== "function") return { postMessage: () => {} };
  return scope.acquireVsCodeApi();
}

// A message from the host, read into the state it changes. [[spec/design_output/drawing#the-page-speaks-in-messages]]
export function readMessage(said, state) {
  if (said?.kind === "graph") {
    const steps = Array.isArray(said.steps) ? said.steps : null;
    return { ...state, graph: said.graph ?? EMPTY, steps, held: said.held === true };
  }
  if (said?.kind === "theme" && SCHEMES.has(said.theme)) {
    return { ...state, theme: said.theme };
  }
  return state;
}

// A button inside a node, whose press stays off the node's own press. [[spec/design_output/drawing#the-page-takes-an-edit]]
function button(kind, text, press) {
  return createElement(
    "button",
    {
      key: kind,
      type: "button",
      className: `nodrag ${kind}`,
      disabled: !press,
      onClick: (event) => {
        event.stopPropagation();
        press?.();
      },
    },
    text,
  );
}

// The pointer's button, and a step ahead's edits, each posting what the host runs. [[spec/design_output/drawing#the-page-takes-an-edit]]
function controlsOf(node, state, post) {
  const out = [];
  if (node.at) {
    out.push(
      state.held
        ? button("handback", "hand back", () => post({ kind: "handback", step: node.id }))
        : button("take", "take", () => post({ kind: "take", step: node.id })),
    );
  }
  if (!state.steps || node.reached) return out;
  const reached = reachedIn(state.graph);
  const edit = (steps) => steps && (() => post({ kind: "edit", steps }));
  out.push(button("up", "↑", edit(moved(state.steps, node.id, -1, reached))));
  out.push(button("down", "↓", edit(moved(state.steps, node.id, 1, reached))));
  out.push(button("drop", "✕", edit(dropped(state.steps, node.id, reached))));
  return out;
}

// The label carries the title, so a pointer resting on a step reads what it does. [[spec/design_output/drawing#the-layout-reads-the-graph]]
function withLabels(flow, state, post) {
  const byId = new Map((state.graph.nodes ?? []).map((one) => [one.id, one]));
  const nodes = flow.nodes.map((one) => ({
    ...one,
    data: {
      label: createElement(
        "span",
        { title: one.data.title },
        one.data.label,
        ...controlsOf(byId.get(one.id) ?? {}, state, post),
      ),
    },
  }));
  return { ...flow, nodes };
}

// A press on a node jumps to its chapter, where the engine names one. [[spec/design_output/drawing#the-page-takes-an-edit]]
export function jumpOf(node) {
  if (!node?.chapter) return null;
  return { kind: "jump", step: node.id, chapter: node.chapter, line: node.line };
}

// [[spec/design_output/drawing#the-page-draws-a-route]]
function Route({ host }) {
  const [state, setState] = useState({
    graph: EMPTY,
    steps: null,
    held: false,
    theme: "light",
    drawn: 0,
  });

  useEffect(() => {
    const hear = (event) =>
      setState((was) => {
        const next = readMessage(event.data, was);
        return next.graph === was.graph ? next : { ...next, drawn: was.drawn + 1 };
      });
    window.addEventListener("message", hear);
    host.postMessage({ kind: "ready" });
    return () => window.removeEventListener("message", hear);
  }, [host]);

  const post = useCallback((one) => host.postMessage(one), [host]);
  const flow = useMemo(
    () => withLabels(laidOut(state.graph), state, post),
    [state, post],
  );
  const press = useCallback(
    (_event, node) => {
      const said = jumpOf(state.graph.nodes?.find((one) => one.id === node.id));
      if (said) post(said);
    },
    [state.graph, post],
  );
  return createElement(ReactFlow, {
    key: state.drawn,
    nodes: flow.nodes,
    edges: flow.edges,
    onNodeClick: press,
    colorMode: state.theme,
    fitView: true,
    nodesDraggable: false,
    nodesConnectable: false,
    proOptions: { hideAttribution: true },
  });
}

const at = typeof document === "undefined" ? null : document.getElementById("route");
if (at) createRoot(at).render(createElement(Route, { host: hostOf(window) }));
