// The list the tree's language server answers: its port where an editor's
// server listens, and a run of its checker where none does.
// [[spec/design_output/lsp#a-port-serves-the-list]]

import { join, resolve } from "node:path";
import { PRIVATE, RUN } from "../../.claude/skills/level0/lib/folders.js";
import { files, lsp, outside, root } from "./cli-doors.js";

// The pointer the server writes, spelled again from pointerPath in src/lsp/port.go because a Go module exports nothing to JavaScript. [[spec/design_output/lsp#a-port-serves-the-list]]
export const PANEL = `${RUN}/panel.json`;
// The longest the port holds an answer, settleWait in src/lsp/port.go, so the lint waits as long as the server does. [[spec/design_output/lsp#a-port-serves-the-list]]
export const PORT_WAIT = 180_000;

// A private note's row holds no push. [[spec/design_output/lsp#a-port-serves-the-list]]
export async function serverFaults(where) {
  const said = (await portFaults(where)) ?? checkFaults(where);
  return said ? said.filter((one) => !privateRow(one.file)) : null;
}

export function privateRow(file) {
  const path = String(file ?? "")
    .split("\\")
    .join("/");
  return path === PRIVATE || path.startsWith(`${PRIVATE}/`);
}

// The pointer names a live server on this tree, or the answer is nothing and the checker runs. [[spec/design_output/lsp#a-port-serves-the-list]]
async function portFaults(where) {
  const at = join(root, PANEL);
  if (!files.exists(at)) return null;
  let said;
  try {
    said = JSON.parse(files.read(at));
  } catch {
    return null;
  }
  if (!said?.port || !outside.alive(said.pid)) return null;
  if (resolve(String(said.root ?? "")) !== resolve(root)) return null;
  const query = where
    .filter((one) => one !== ".")
    .map((one) => `path=${encodeURIComponent(one)}`)
    .join("&");
  try {
    const answer = await fetch(
      `http://127.0.0.1:${said.port}/findings${query ? `?${query}` : ""}`,
      { signal: AbortSignal.timeout(PORT_WAIT) },
    );
    const listing = await answer.json();
    return listing?.ok && Array.isArray(listing.found) ? listing.found : null;
  } catch {
    return null;
  }
}

function checkFaults(where) {
  if (!files.exists(lsp)) return null;
  const ran = outside.run([lsp, "check", ...where], { cwd: root });
  if (ran.exitCode !== 0) return null;
  try {
    const said = JSON.parse(ran.stdout || "[]");
    return Array.isArray(said) ? said : null;
  } catch {
    return null;
  }
}
