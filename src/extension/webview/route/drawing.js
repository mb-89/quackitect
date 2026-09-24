// The drawing's entry. It draws the graph its host hands it, and speaks to the
// host through messages alone. The bundle step writes it into the one script
// a webview loads.
// [[spec/design_output/drawing#the-page-draws-a-route]]

import { ReactFlow } from "@xyflow/react";
import { createElement, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";
import "./drawing.css";
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
  if (said?.kind === "graph") return { ...state, graph: said.graph ?? EMPTY };
  if (said?.kind === "theme" && SCHEMES.has(said.theme)) {
    return { ...state, theme: said.theme };
  }
  return state;
}

// The label carries the title, so a pointer resting on a step reads what it does. [[spec/design_output/drawing#the-layout-reads-the-graph]]
function withTitles(flow) {
  const nodes = flow.nodes.map((one) => ({
    ...one,
    data: { label: createElement("span", { title: one.data.title }, one.data.label) },
  }));
  return { ...flow, nodes };
}

// [[spec/design_output/drawing#the-page-draws-a-route]]
function Route({ host }) {
  const [state, setState] = useState({ graph: EMPTY, theme: "light", drawn: 0 });

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

  const flow = useMemo(() => withTitles(laidOut(state.graph)), [state.graph]);
  return createElement(ReactFlow, {
    key: state.drawn,
    nodes: flow.nodes,
    edges: flow.edges,
    colorMode: state.theme,
    fitView: true,
    nodesDraggable: false,
    nodesConnectable: false,
    proOptions: { hideAttribution: true },
  });
}

const at = typeof document === "undefined" ? null : document.getElementById("route");
if (at) createRoot(at).render(createElement(Route, { host: hostOf(window) }));
