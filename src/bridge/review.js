// The review by a helper: the server asks the bridgehead to spawn one over a
// branch, and reads what it says back under a token.
// [[spec/design_output/review#the-tool-the-session-calls]]

import {
  CALLED,
  readerAsks,
  readerSays,
  report,
  reviewSpec,
} from "../../.claude/skills/level0/lib/review.js";

const GATHERING = 300000;
const HEX = 16;

export const SPECS = () => [reviewSpec()];
export const TOOLS = { [CALLED]: reviewsBranch };
export const ANSWERED = "agent.answered";

async function reviewsBranch(e, box) {
  const name = String(e?.branch ?? "").trim();
  if (!name) return { result: { result: "review_branch takes one branch name." } };

  const ran = box.proc.run(
    [
      process.execPath,
      `${box.method}/src/scripts/cli.js`,
      "branch",
      "review",
      name,
      "--json",
    ],
    {
      cwd: box.work,
      timeoutMs: GATHERING,
    },
  );
  const material = materialOf(ran.stdout);
  if (!material) {
    const why = String(ran.stderr ?? "").trim() || String(ran.stdout ?? "").trim();
    box.log.say("warn", "review", `the verb gathered nothing for ${name}`, {
      detail: why,
    });
    return { result: { result: `${name}: the verb gathered nothing.\n\n${why}` } };
  }

  const token = `review-${box.clock.now().getTime().toString(HEX)}`;
  box.reviews = box.reviews ?? new Map();
  box.reviews.set(token, material);
  return {
    spawn: {
      prompt: readerAsks(material, box.guidance?.standing ?? ""),
      description: `read ${material.branch}`,
      subagentType: "general-purpose",
    },
    back: { event: ANSWERED, token },
  };
}

// [[spec/design_output/review#what-the-report-looks-like]]
export function onAgentAnswered(e, box) {
  const material = box.reviews?.get(String(e?.token ?? ""));
  if (!material)
    return { result: { result: "the reader answered a review nobody asked for" } };
  box.reviews.delete(String(e.token));
  const read = e?.deny
    ? { fix: 0, unread: `the spawn is refused: ${e.deny}` }
    : e?.isError
      ? { fix: 0, unread: `the reader failed: ${e.text ?? ""}` }
      : readerSays(e?.text);
  box.log.say("info", "review", `read ${material.branch}`, {
    branch: material.branch,
    detail: `check=${material.check?.code} retro=${material.retro} fix=${read.fix}`,
  });
  return { result: { result: report(material, read) } };
}

function materialOf(stdout) {
  for (const line of String(stdout ?? "")
    .split(/\r?\n/)
    .reverse()) {
    if (!line.startsWith("{")) continue;
    try {
      const read = JSON.parse(line);
      if (read.branch) return read;
    } catch {}
  }
  return null;
}
