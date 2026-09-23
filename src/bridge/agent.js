// The Agent door. A call waiting on its helper holds the turn, so the door
// refuses it and names the background road.
// [[spec/design_output/level0#an-agent-call-runs-behind]]

export const SAYS = [
  "This Agent call carries run_in_background: false, and the turn waits on the helper while the owner waits on you.",
  "Call it again with run_in_background: true, and read its hand-back when it lands.",
].join(" ");

// A helper's own Agent call meets the same door. [[spec/design_output/level0#a-helper-ends-no-turn]]
export function onAgent(e, box) {
  if (e?.run_in_background !== false) return { pass: true };
  box.log.say("debug", "gate", "refused an Agent call waiting on its helper", {
    tool: String(e?.tool ?? ""),
  });
  return { result: { deny: SAYS } };
}
