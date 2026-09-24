// The grace door. The engine wants something of the agent: it says so on a
// call, lets that many calls pass with the ask riding each result, and then
// refuses every call until the agent reacts. One ask stands at a time, and
// the calls that end a turn pass whatever stands.
// [[spec/design_output/stop#the-grace]]

// [[spec/design_output/stop#the-grace]]
export function wants(box, ask) {
  if (box.grace) return false;
  box.grace = {
    id: String(ask.id ?? ""),
    why: String(ask.why ?? ""),
    react: String(ask.react ?? ""),
    // The call that answers the ask, which passes whatever the grace holds, because a refused answer locks the box. [[spec/design_output/stop#the-grace]]
    tool: String(ask.tool ?? ""),
    left: Math.max(0, Number(ask.calls) || 0),
  };
  // The grace is the agent's to answer, so its lines stand under debug. [[spec/design_output/stop#the-grace]]
  box.log.say("debug", "grace", `the engine wants ${box.grace.id}: ${box.grace.why}`, {
    detail: `${box.grace.left} call(s) of grace`,
  });
  return true;
}

// The agent reacted, or the ask fell away, so the calls pass again. [[spec/design_output/stop#the-grace]]
export function reacted(box, id) {
  if (!box.grace || box.grace.id !== String(id)) return false;
  box.log.say("debug", "grace", `${box.grace.id} is answered, and the calls pass`);
  box.grace = null;
  return true;
}

// Every call meets the ask: the grace lets it pass with the ask riding, and a spent grace refuses it. [[spec/design_output/stop#the-grace]]
export function holdsGrace(e, box, passes = new Set()) {
  const grace = box.grace;
  const tool = String(e?.tool ?? "");
  if (!grace || e?.agentId || passes.has(tool) || (grace.tool && tool === grace.tool)) return null;
  if (grace.left > 0) {
    grace.left -= 1;
    return { after: { context: [graceBlock(grace)] } };
  }
  box.log.say(
    "debug",
    "grace",
    `${grace.id} is unanswered, and ${e?.tool ?? "the call"} is refused`,
    {
      tool: String(e?.tool ?? ""),
    },
  );
  return { result: { deny: refusedByGrace(grace) } };
}

// [[spec/design_output/stop#the-grace]]
export function graceBlock(grace) {
  const more =
    grace.left > 0
      ? `${grace.left} more call(s) pass after this one`
      : "this is the last call that passes";
  return [
    "# What the engine asks for",
    "",
    `${grace.why} ${more}, and then every call is refused until you ${grace.react}.`,
  ].join("\n");
}

// [[spec/design_output/stop#the-grace]]
export function refusedByGrace(grace) {
  return `${grace.why} The grace is spent, so this call is refused. ${capital(grace.react)}, and the calls pass again.`;
}

function capital(said) {
  return said ? said[0].toUpperCase() + said.slice(1) : said;
}
