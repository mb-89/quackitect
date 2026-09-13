// The reader that goes before trunk. This file holds what a review gathers,
// the questions a model answers, and the shape of the report. The verb and the
// hooks module both load it, so one report shape serves both.
// [[spec/design_output/review#what-the-report-looks-like]]

export const TOOL = "review_branch";
export const CALLED = `mcp__level0__${TOOL}`;
export const BRIEF = "HANDOVER.md";
export const WORKTREE = ".se/review";
export const DIFF_CAP = 120000;

export const ASKED = ["brief", "beyond", "tests"];

// [[spec/design_output/review#the-five-questions]]
// [[spec/design_output/work#every-brief-carries-the-contract]]
export function retroIn(text) {
  const heading = /^#{1,6}[^\S\n]+[^\n]*\b(?:retro\w*|surprises?|dead ends?)\b/im;
  return heading.test(String(text ?? ""));
}

export function reviewSpec() {
  return {
    name: TOOL,
    description: [
      "Reads a work branch against the brief it was cut with, and answers a",
      "short report: what the branch does, what it touches beyond the brief,",
      "which rules it adds without a test, whether the check passes, and",
      "whether the handback carries a retro. It holds no merge back. Takes one",
      "branch name, with or without the work/ prefix.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        branch: {
          type: "string",
          description: "The branch to read, such as the-config-holds-numbers.",
        },
      },
      required: ["branch"],
    },
  };
}

// [[spec/design_output/review#what-the-reader-answers]]
export function readerAsks(material, rules) {
  return [
    "You read one work branch and answer three questions about it. A person",
    "merges this branch either way, so your answer holds nothing back: it",
    "spares the reader the diff and names what to fix next.",
    "",
    `# The branch: ${material.branch}`,
    "",
    "## Question one",
    "",
    "Does the branch do what the brief asks? Name what the brief asks for and",
    "goes missing, or say it is done.",
    "",
    "## Question two",
    "",
    "Is everything the diff touches beyond the brief a trivial fix? A branch",
    "fixes what it trips over, so a file outside the brief is no fault by",
    "itself. A diversion is: a redesign of something the brief leaves alone.",
    "Name the files beyond the brief and say which kind each one is.",
    "",
    "## Question three",
    "",
    "Does every rule the branch adds carry a test proving it fires? A rule",
    "firing on nothing looks alive. So the question is whether a test feeds",
    "the rule something bad and asserts the rule refuses it. Name every rule",
    "the diff adds and say which of them a test drives that way.",
    "",
    "# How this tree is worked",
    "",
    String(rules ?? "").trim(),
    "",
    "# The brief, as the branch was cut with it",
    "",
    fence(material.brief),
    "",
    "# The handback, as the branch carries it now",
    "",
    fence(material.handback),
    "",
    "# The shape of the diff",
    "",
    fence(material.stat),
    "",
    "# The diff",
    "",
    fence(material.diff),
    "",
    "# What you answer",
    "",
    "Answer one JSON object and nothing else. Every value is one short line,",
    "or several lines where a list serves the reader better:",
    "",
    fence(
      JSON.stringify(
        {
          brief: "done, and nothing beyond it",
          beyond: "src/doors/git.js, a one-line fix, trivial",
          tests: "2 rules added, 1 carries no test:\nStopRule fires on nothing",
          fix: 2,
        },
        null,
        2,
      ),
    ),
    "",
    "`fix` counts the things in your three answers a person acts on. Write 0",
    "where the branch stands clean. Keep every line short enough to read whole.",
  ].join("\n");
}

function fence(text) {
  return ["```", String(text ?? "").trimEnd() || "(empty)", "```"].join("\n");
}

// [[spec/design_output/review#what-the-reader-answers]]
export function readerSays(text) {
  const said = String(text ?? "");
  const fenced = /```(?:json)?\s*([\s\S]*?)```/.exec(said);
  const body = fenced ? fenced[1] : said.slice(said.indexOf("{"));
  try {
    const read = JSON.parse(body);
    const out = { fix: Number.isFinite(read.fix) ? Math.max(0, read.fix | 0) : 0 };
    for (const key of ASKED) out[key] = line(read[key]);
    return out;
  } catch {
    return { fix: 1, brief: "", beyond: "", tests: "", unread: said.trim() };
  }
}

function line(said) {
  if (Array.isArray(said)) return said.map(String).join("\n");
  return said === undefined || said === null ? "" : String(said);
}

// [[spec/design_output/review#what-the-report-looks-like]]
export function report(said, read = {}) {
  const check = said.check ?? {};
  const mechanical = (check.ok ? 0 : 1) + (said.retro ? 0 : 1);
  const fix = mechanical + (read.fix ?? 0);
  const unread = String(read.unread ?? "").trim();
  if (!fix && !unread) {
    return `${said.branch}   nothing to fix. Run work merge to take it in.`;
  }

  const rows = [
    ["check", check.ok ? "passes" : redly(check)],
    ["retro", said.retro ? "present" : "absent from the handback"],
    ["brief", read.brief],
    ["tests", read.tests],
    ["beyond", read.beyond],
    ["reader", unread],
  ].filter(([, value]) => String(value ?? "").trim());

  const pad = 10;
  const out = [said.branch, ""];
  for (const [name, value] of rows) {
    const lines = String(value).split("\n");
    out.push(`${name.padEnd(pad)} ${lines[0]}`);
    for (const rest of lines.slice(1)) out.push(`${" ".repeat(pad)} ${rest}`);
  }
  out.push("", closing(fix));
  return out.join("\n");
}

function redly(check) {
  const says = String(check.says ?? "").trim();
  const head = `answers ${check.code ?? "nothing"}`;
  return says ? `${head}:\n${says}` : head;
}

function closing(fix) {
  const many = `${fix} thing${fix === 1 ? "" : "s"} to fix`;
  return `${fix ? many : "Nothing to fix"}. Run work merge once every fix lands.`;
}
