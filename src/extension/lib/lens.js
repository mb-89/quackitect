// The buttons a ticket carries in the editor: which ones stand, the line each
// one runs, and the word the pull answers. The editor draws them, and every
// choice here reads a string, so a test holds it with no editor running.
// [[spec/design_output/extension#a-ticket-carries-its-buttons]]

const FOLDERS = ["spec/tickets", ".se/tickets"];
// The marker of [[spec/tickets/marked-groups-stay-cloud]], owned by `CLOUD_MARK` in src/scripts/work-merge.js and spelled again here because the extension bundles alone.
const CLOUD = "cloud";
// The index values the lens reads: the standing holds, the tickets the cloud holds, and every ticket, whose change draws a ticket again. [[spec/tickets/the-lens-reads-v1]]
const STANDING = "holds/standing";
const CLOUDS = "tickets/cloud";
const TICKETS = "tickets/all";
// The verb programs, whose folder `VERBS` in src/scripts/verb-run.js owns, spelled again here because the extension bundles alone. [[spec/tickets/cli-js-leaves]]
const PROGRAMS = "src/scripts/verbs";
const COMMAND = "quackitect.ticket";
// The names the pull reads a harness off, from [[spec/design_output/pull#the-hand-rule]].
const HARNESS = ["CLAUDECODE", "CLAUDE_CODE_REMOTE", "SE_CLOUD"];
const PERSON = "person";
const ANSWERS = ["work", "refused", "wait", "spawn", "done"];
const HANDS_BACK = new Set(["pass", "fail", "back"]);
const TAKERS = new Set(["", "anyone", PERSON]);
const WORK_ROOT = "SE_WORK_ROOT";

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
function ticketOf(path) {
  const said = String(path ?? "").replace(/\\/g, "/");
  for (const folder of FOLDERS) {
    const found = new RegExp(`(?:^|/)${folder.replace(".", "\\.")}/([^/]+)\\.md$`).exec(
      said,
    );
    if (found) return found[1];
  }
  return "";
}

function frontLines(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  if (lines[0]?.trim() !== "---") return [];
  const ends = lines.indexOf("---", 1);
  return ends < 0 ? [] : lines.slice(1, ends);
}

function fieldOf(text, key) {
  const line = frontLines(text).find((one) => one.startsWith(`${key}:`));
  return line ? bare(line.slice(key.length + 1)) : "";
}

function bare(said) {
  return String(said ?? "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

// One row per step as the frontmatter nests it, with its `by` and whether a verdict field stands. [[spec/design_output/pull#the-answers]]
function stepsIn(text) {
  const steps = [];
  let openers = [];
  let items = [];
  for (const line of frontLines(text)) {
    const found = /^(\s*)(- )?([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!found) continue;
    const [, space, dash, key, value] = found;
    const at = space.length;
    if (dash) {
      openers = openers.filter((one) => one.at <= at);
      items = items.filter((one) => one.at < at);
      items.push(itemOf(openers.at(-1), at, steps));
      keyOn(items.at(-1), key, value);
      continue;
    }
    openers = openers.filter((one) => one.at < at);
    items = items.filter((one) => one.at + 2 <= at);
    const owner = items.at(-1);
    if (!value) openers.push({ at, key, owner });
    else keyOn(owner, key, value);
  }
  return steps;
}

// An item under a route's steps is a step whatever key opens it, and its name arrives on any of its lines. [[spec/tickets/a-count-meets-the-lint]]
function itemOf(opener, at, steps) {
  if (opener?.key === "evidence" && opener.owner?.kind === "step")
    return { at, kind: "evidence", step: opener.owner.step };
  if (opener?.key !== "steps") return { at, kind: "other" };
  const above = opener.owner?.kind === "step" ? opener.owner.step : null;
  if (above) above.leaf = false;
  const step = { path: "", by: "", verdict: false, leaf: true, above };
  steps.push(step);
  return { at, kind: "step", step };
}

function keyOn(item, key, value) {
  if (item?.kind === "step" && key === "name") {
    const above = item.step.above;
    item.step.path = above ? `${above.path}/${bare(value)}` : bare(value);
  }
  if (item?.kind === "step" && key === "by") item.step.by = bare(value);
  if (item?.kind === "evidence" && key === "form" && bare(value) === "verdict")
    item.step.verdict = true;
}

// The nearest `by` up the chain, the way the pull reads it. [[spec/design_output/pull#the-hand-rule]]
function byOf(step) {
  for (let one = step; one; one = one.above) {
    if (one.by) return one.by;
  }
  return "anyone";
}

function leafAt(text, path) {
  const leaves = stepsIn(text).filter((one) => one.leaf);
  const wanted = path || fieldOf(text, "step");
  return wanted ? leaves.find((one) => one.path === wanted) : leaves[0];
}

// A hold whose hand reads person is this desk's own. [[spec/design_output/pull#the-hand-and-the-hold]]
function personHolds(hold) {
  const hand = String(hold?.hand ?? "").trim();
  return hand === PERSON || hand.startsWith(`${PERSON} `);
}

function lens(title, act, ticket, path) {
  if (!act) return { title, command: "", arguments: [] };
  return { title, command: COMMAND, arguments: [act, ticket, path] };
}

// [[spec/design_output/extension#a-ticket-carries-its-buttons]]
function lensesOf({ path, text, holds, cloud }) {
  const ticket = ticketOf(path);
  if (!ticket) return [];
  // A ticket the cloud holds, by its own marker or its group's off tickets/cloud, takes no hand here. [[spec/tickets/the-lens-reads-v1]]
  if (cloud || fieldOf(text, CLOUD) === "true") return [];
  // A hold is a state of the ticket, so a ticket past open draws no held button. [[spec/design_output/pull#the-hand-and-the-hold]]
  if (fieldOf(text, "state") !== "open") return [];
  const naming = (holds ?? []).filter((one) => one?.ticket === ticket);
  const mine = naming.find(personHolds);
  if (mine) return handBackOf(ticket, path, text, mine);
  if (naming.length)
    return [lens(`held by ${naming[0].hand} at ${naming[0].step}`, "", ticket, path)];
  const leaf = leafAt(text, "");
  const step = leaf?.path ?? fieldOf(text, "step");
  const by = leaf ? byOf(leaf) : "anyone";
  if (!TAKERS.has(by)) return [lens(`${step} stands for ${by}`, "", ticket, path)];
  return [lens(`Take this ticket at ${step}`, "take", ticket, path)];
}

function handBackOf(ticket, path, text, hold) {
  const leaf = leafAt(text, hold.step);
  const drop = lens("Drop", "drop", ticket, path);
  if (leaf?.verdict)
    return [
      lens(`Hand back ${hold.step}: the verdict decides`, "back", ticket, path),
      drop,
    ];
  return [
    lens(`Hand back ${hold.step}: pass`, "pass", ticket, path),
    lens("Hand back: fail…", "fail", ticket, path),
    drop,
  ];
}

// [[spec/design_output/pull#the-answers]]
function argvOf(act, ticket, reason) {
  const lines = {
    take: [ticket],
    back: [ticket],
    pass: [ticket, "--pass"],
    fail: [ticket, "--fail", String(reason ?? "")],
    drop: ["--drop"],
  };
  return lines[act] ? ["ticket", "pull", ...lines[act]] : [];
}

// The route a press in the drawing moves, as the whole list `ticket route` takes. [[spec/tickets/the-host-runs-the-verbs]]
function routeArgvOf(ticket, steps) {
  return ["ticket", "route", ticket, `--steps=${JSON.stringify(steps ?? [])}`];
}

// A save over a ticket naming a process and carrying no route runs the fill, which writes what the mint writes. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
function fillArgvOf(path, text) {
  if (!ticketOf(path)) return [];
  if (!fieldOf(text, "process") || stepsIn(text).length) return [];
  return ["ticket", "fill", String(path).replace(/\\/g, "/")];
}

// The action a verb's words post to, with the words past the verb and the person mark. [[spec/tickets/the-lens-calls-actions]]
function actionOf(argv) {
  const [topic, verb, ...args] = argv;
  return { name: `${topic}/${verb}`, input: { args, person: true } };
}

// [[spec/tickets/the-lens-calls-actions]]
function actsOn(door, argv) {
  const one = actionOf(argv);
  return door.index.acts(one.name, one.input);
}

// The child runs as a person, so the names a harness sets stay behind. [[spec/design_output/pull#the-hand-rule]]
function personEnv(env, root) {
  const out = { ...(env ?? {}) };
  for (const name of HARNESS) delete out[name];
  if (root) out[WORK_ROOT] = root;
  return out;
}

// [[spec/design_output/pull#the-answers]]
function answerOf(ran) {
  const lines = `${ran?.out ?? ""}\n${ran?.err ?? ""}`
    .split(/\r?\n/)
    .map((one) => one.trim())
    .filter(Boolean);
  const at = lines.findIndex((one) => ANSWERS.includes(one));
  if (at >= 0) return { word: lines[at], detail: lines[at + 1] ?? "", lines };
  const word = Number(ran?.code ?? 0) === 0 ? "work" : "refused";
  return { word, detail: lines[0] ?? "", lines };
}

// The standing holds off the index, one row a hold whose ticket stands. [[spec/tickets/the-lens-reads-v1]]
async function standingOf(door) {
  const said = await door.index?.values(STANDING);
  return Array.isArray(said) ? said : [];
}

// The lenses and the click behind them, with the editor handed in. [[spec/design_output/extension#a-ticket-carries-its-buttons]]
function ticketLensOf(door) {
  return {
    names: [STANDING, CLOUDS],
    // The holds and the cloud read off the index, and no verb runs on a draw. [[spec/tickets/the-lens-reads-v1]]
    lenses: async (path, text) => {
      const [holds, clouds] = await Promise.all([
        standingOf(door),
        door.index?.values(CLOUDS),
      ]);
      const cloud = Array.isArray(clouds) && clouds.includes(ticketOf(path));
      return lensesOf({ path, text, holds, cloud });
    },
    async took(act, ticket, path) {
      let reason = "";
      if (act === "fail") {
        reason = String((await door.asksLine(`Why does ${ticket} fail back?`)) ?? "");
        if (!reason.trim()) return undefined;
      }
      if (HANDS_BACK.has(act)) await door.saves(path);
      const argv = argvOf(act, ticket, reason);
      if (!argv.length) return undefined;
      const said = answerOf(await actsOn(door, argv));
      door.says([`./RUNME.sh ${argv.join(" ")}`, "", ...said.lines]);
      door.tells(`${ticket}: ${said.word}`, said.detail, said.word === "refused");
      door.lensChanged?.();
      return said;
    },
    // [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
    async saved(path, text) {
      const argv = fillArgvOf(path, text);
      if (!argv.length) return undefined;
      const ran = await actsOn(door, argv);
      const lines = `${ran?.out ?? ""}\n${ran?.err ?? ""}`
        .split(/\r?\n/)
        .filter((one) => one.trim());
      door.says([`./RUNME.sh ${argv.join(" ")}`, "", ...lines]);
      if (Number(ran?.code ?? 0) !== 0)
        door.tells(`${ticketOf(path)}: the fill refused`, lines[0] ?? "", true);
      door.lensChanged?.();
      return ran;
    },
  };
}

module.exports = {
  PROGRAMS,
  COMMAND,
  FOLDERS,
  HARNESS,
  STANDING,
  TICKETS,
  actionOf,
  actsOn,
  answerOf,
  argvOf,
  fillArgvOf,
  lensesOf,
  personEnv,
  personHolds,
  routeArgvOf,
  standingOf,
  stepsIn,
  ticketLensOf,
  ticketOf,
};
