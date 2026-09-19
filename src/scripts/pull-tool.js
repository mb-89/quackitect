// The pull tool's input, read into the argv a person types. The hook hands
// the raw input over, so a change here reaches a running session at its next
// call, and the hook holds the verb and the flag alone.
// [[spec/design_output/pull#the-hand-out]]

const TOOL = "--tool";
const JUDGE = "--judge";

// [[spec/design_output/pull#the-hand-out]]
export function toolArgv(said = {}) {
  const out = ["pull"];
  const ticket = String(said.ticket ?? "").trim();
  const verdict = String(said.verdict ?? "").trim();
  if (ticket) out.push(ticket);
  if (verdict === "pass") out.push("--pass");
  if (verdict === "fail" || verdict === "became") {
    out.push(`--${verdict}`, String(said.reason ?? "").trim());
  }
  if (said.fields && typeof said.fields === "object") {
    out.push("--fields", JSON.stringify(said.fields));
  }
  return out;
}

// The argv a pull runs under: the tool's input where --tool names one, and the argv as typed otherwise. The judge reads the ticket alone. [[spec/design_output/pull#the-checks]]
export function pullArgvOf(argv) {
  const at = (argv ?? []).indexOf(TOOL);
  if (at < 0) return argv;
  let said = {};
  try {
    said = JSON.parse(String(argv[at + 1] ?? "{}")) ?? {};
  } catch {}
  const out = toolArgv(said);
  return argv.includes(JUDGE) ? [...out.slice(0, 2), JUDGE] : out;
}
