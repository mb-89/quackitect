// The drawing's entry. The bundle step reads this and writes one script and
// one style sheet a webview loads, since a webview loads no module.
// [[spec/design_input/the-editor-draws-the-ticket#one-file-holds-both-halves]]

import { ReactFlow } from "@xyflow/react";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "@xyflow/react/dist/style.css";

const at = document.getElementById("route");
if (at) createRoot(at).render(createElement(ReactFlow, { nodes: [], edges: [] }));
