// The browser side. A click becomes a message and nothing else: the page draws
// no new value of its own, because the extension writes the file and hands the
// page its HTML again.
// [[spec/design_output/extension#a-click-becomes-a-message]]

import { fresh, pressed } from "./gesture.js";

const GONE = "gone";

export function messageFor(said, at, held) {
  if (said?.widget === "action") {
    const message = said.reads
      ? { kind: "show", key: said.key, reads: said.reads }
      : { kind: "run", key: said.key, runs: said.runs };
    return { message, state: held };
  }
  const options = String(said?.options ?? "")
    .split(" ")
    .filter(Boolean);
  const ran = pressed(held, at, {
    options,
    value: said?.value,
    gesture: Number(said?.gesture) || undefined,
  });
  if (ran.writes === undefined) return { message: undefined, state: ran.state };
  return {
    message: { kind: "set", key: said?.key, value: ran.writes },
    state: ran.state,
  };
}

// [[spec/design_output/extension#the-filter-reads-an-expression]]
export function matches(said, filter) {
  if (!filter) return true;
  try {
    return new RegExp(filter, "i").test(String(said ?? ""));
  } catch {
    return String(said ?? "").includes(filter);
  }
}

export function show(root, filter) {
  for (const row of root.querySelectorAll(".row")) {
    mark(row, matches(row.dataset?.said, filter));
  }
  for (const node of root.querySelectorAll("details.keys, details.file")) {
    const rows = [...node.querySelectorAll(".row")];
    mark(node, !rows.length || rows.some((row) => !row.classList.contains(GONE)));
  }
}

function mark(node, shown) {
  if (shown) node.classList.remove(GONE);
  else node.classList.add(GONE);
}

// [[spec/design_output/extension#the-gear-picks-the-sections]]
export function picked(root, picks) {
  for (const node of root.querySelectorAll("details.section")) {
    const name = node.dataset?.section;
    const want = picks?.[name];
    if (want === undefined) continue;
    mark(node, want);
    const box = root.querySelector(`.pick[data-pick="${name}"]`);
    if (box) box.checked = want;
  }
}

// [[spec/design_output/extension#a-click-becomes-a-message]]
export function wire(root, post, view, now) {
  const held = new Map();
  const said = view.get() ?? {};

  root.addEventListener("click", (event) => {
    const gear = event.target?.closest?.(".gear");
    if (gear) {
      const box = root.querySelector(".chooser");
      if (box) box.hidden = !box.hidden;
      return;
    }

    const at = event.target?.closest?.(".widget");
    if (!at) return;
    const was = held.get(at.dataset.key) ?? fresh();
    const one = messageFor(at.dataset, now(), was);
    held.set(at.dataset.key, one.state);
    if (one.message) post(one.message);
  });

  root.addEventListener("change", (event) => {
    const at = event.target;
    const pick = at?.dataset?.pick;
    if (pick) {
      const picks = { ...(view.get()?.picks ?? {}), [pick]: Boolean(at.checked) };
      view.set({ ...view.get(), picks });
      picked(root, picks);
      return;
    }
    if (!at?.dataset?.key || at.closest?.(".widget")) return;
    post({ kind: "set", key: at.dataset.key, value: at.value });
  });

  root.addEventListener("input", (event) => {
    const at = event.target;
    if (!at?.classList?.contains?.("filter")) return;
    view.set({ ...view.get(), filter: at.value });
    show(root, at.value);
  });

  root.addEventListener("toggle", (event) => {
    const at = event.target;
    const name = at?.dataset?.section;
    if (!name) return;
    view.set({ ...view.get(), open: { ...view.get()?.open, [name]: at.open } });
  });

  restore(root, said);
  return { held };
}

export function restore(root, said) {
  for (const node of root.querySelectorAll("details.section")) {
    const want = said?.open?.[node.dataset?.section];
    if (want !== undefined) node.open = want;
  }
  const box = root.querySelector(".filter");
  if (box && said?.filter) box.value = said.filter;
  picked(root, said?.picks);
  show(root, said?.filter ?? "");
}

if (typeof document !== "undefined" && typeof acquireVsCodeApi === "function") {
  const said = acquireVsCodeApi();
  wire(
    document,
    (message) => said.postMessage(message),
    { get: () => said.getState(), set: (one) => said.setState(one) },
    () => performance.now(),
  );
}
