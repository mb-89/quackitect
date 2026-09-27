// The pull tool's input, read into the argv a person types. The hook hands
// the raw input over, so a change here reaches a running session at its next
// call, and the hook holds the verb and the flag alone.
// [[spec/design_output/pull#the-hand-out]]

const TOOL = "--tool";

// [[spec/design_output/pull#the-hand-out]]
export function toolArgv(said = {}) {
  const out = ["pull"];
  const ticket = String(said.ticket ?? "").trim();
  const verdict = String(said.verdict ?? "").trim();
  if (ticket) out.push(ticket);
  // A gate's words take the flags a review's take. [[spec/design_output/pull#the-gate]]
  const word = { accept: "pass", reject: "fail" }[verdict] ?? verdict;
  if (word === "pass") out.push("--pass");
  if (word === "fail" || word === "became" || word === "answered") {
    out.push(`--${word}`, String(said.reason ?? "").trim());
  }
  if (said.fields && typeof said.fields === "object") {
    out.push("--fields", JSON.stringify(said.fields));
  }
  return out;
}

// The argv a pull runs under: the tool's input where --tool names one, and the argv as typed otherwise. [[spec/design_output/pull#the-hand-out]]
export function pullArgvOf(argv) {
  const at = (argv ?? []).indexOf(TOOL);
  if (at < 0) return argv;
  let said = {};
  try {
    said = JSON.parse(String(argv[at + 1] ?? "{}")) ?? {};
  } catch {}
  return toolArgv(said);
}
