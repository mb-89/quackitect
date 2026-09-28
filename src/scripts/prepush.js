// The push door a terminal meets. Git runs the hook before a push and pipes one
// line per ref, and a ref naming trunk reads the stamp the check wrote. A ref
// carrying a tagged note comes back refused, because a to-do parks work on this
// box. The Bash door holds both rules for a session, and each stands alone.
// [[spec/design_output/work#the-battery-answers-first]]

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inCloud } from "../../.claude/skills/level0/lib/cloud.js";
import {
  ENGINE,
  STAMP,
  saysGreen,
  stampOf,
} from "../../.claude/skills/level0/lib/runs.js";
import {
  reaches,
  refusedTodo,
  taggedIn,
} from "../../.claude/skills/level0/lib/todo.js";
import {
  refusedVersion,
  TRUNK,
  VERSION,
} from "../../.claude/skills/level0/lib/trunk.js";
import { CONFIG, fromJson, PROSE } from "../../.claude/skills/level0/lib/vale.js";
import { readThrough } from "../bridge/findings.js";
import { clock } from "../doors/clock.js";
import { disk } from "../doors/disk.js";
import { git } from "../doors/git.js";
import { proc } from "../doors/proc.js";
import { heldIn, TICKETS, WORK_BRANCH } from "../engine/group.js";
import { configHere } from "./cli-doors.js";
import { boxIdHere } from "./pull-hand-of.js";
import { rootsHere } from "./vehicle.js";
import { staleClaim } from "./work-free.js";

export const STDIN = 0;
export const ZEROS = /^0+$/;
const HEADS = /^refs\/heads\//;
const BOX = /\bbox (\S+)/;

export function refsIn(text) {
  return String(text ?? "")
    .split("\n")
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [local, sha, remote, was] = row.split(/\s+/);
      return { local, sha, remote, was: was ?? "" };
    });
}

// [[spec/tickets/prepush-reds-land-together]]
export function holds(
  refs,
  stampText,
  carried = () => [],
  cloud = false,
  heldBy = () => "",
  box = "",
  engine = true,
  stale = () => false,
  atTip = () => null,
) {
  // [[spec/design_output/work#a-version-branch-stands]]
  const versions = refs
    .filter((one) =>
      VERSION.test(String(one.remote ?? "").replace(/^refs\/heads\//, "")),
    )
    .filter((one) => ZEROS.test(String(one.sha ?? "")))
    .map((one) => ({
      name: one.remote.replace(/^refs\/heads\//, ""),
      how: "delete",
    }));
  if (versions.length) return { code: 1, said: refusedVersion(versions) };

  const trunk = refs.filter((one) => one.remote === `refs/heads/${TRUNK}`);
  // [[spec/tickets/cloud-boxes-leave-trunk-alone]]
  if (cloud && trunk.length) return { code: 1, said: cloudLeavesTrunk() };
  // [[spec/tickets/push-gate-needs-the-engine]]
  for (const one of engine ? trunk : []) {
    const battery = saysGreen(stampOf(stampText), one.sha);
    if (battery.green) continue;
    return {
      code: 1,
      said: [
        `${TRUNK} takes a green battery, and ${battery.says}.`,
        "",
        "Run `./RUNME.sh check` last, after your final commit. The stamp names",
        "the commit it ran against, so a commit after it reads stale.",
      ].join("\n"),
    };
  }

  // A hold past work.staleAfter names a box that left, so its branch takes the push that moves the hold, and no other. [[spec/tickets/stale-hold-moves-by-take]]
  for (const one of refs) {
    const branch = String(one.remote ?? "").replace(HEADS, "");
    if (!branch.startsWith(WORK_BRANCH)) continue;
    const hand = String(heldBy(one) ?? "");
    const holder = BOX.exec(hand)?.[1] ?? "";
    if (!hand || holder === box) continue;
    if (!stale(one)) return { code: 1, said: heldElsewhere(branch, hand) };
    if (!movesHold(atTip(one), box)) return { code: 1, said: staleTakes(branch, hand) };
  }

  // [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
  for (const one of refs) {
    const found = taggedIn(carried(one));
    if (found.length) return { code: 1, said: refusedTodo(found) };
  }

  // A warning reads red in the battery, so the stamp holds the push here and in the session's door alike. [[spec/design_output/work#the-battery-answers-first]]
  return { code: 0, said: "" };
}

// [[spec/tickets/cloud-boxes-leave-trunk-alone]]
export function cloudLeavesTrunk() {
  return [
    `A cloud box pushes its own work branch alone, and ${TRUNK} stands for the desk.`,
    "",
    `Push your work branch. ${TRUNK} takes its work through`,
    "`./RUNME.sh branch merge <name>` on a desk, where the owner reads it first.",
  ].join("\n");
}

// The hand holding a work branch, off its group ticket at the remote tip. [[spec/tickets/one-writer-holds-a-branch]]
export function heldBy(repo) {
  return (ref) => {
    const branch = String(ref?.remote ?? "").replace(HEADS, "");
    if (!branch.startsWith(WORK_BRANCH)) return "";
    const group = branch.slice(WORK_BRANCH.length);
    const said = repo.run(["show", `origin/${branch}:${TICKETS}/${group}.md`], true);
    return said.ok ? (heldIn(said.out)?.hand ?? "") : "";
  };
}

// Whether the tip on origin stands older than the span, read the way the list reads a claim. [[spec/tickets/stale-hold-frees-the-branch]]
export function staleBy(repo, span, now) {
  return (ref) => {
    const branch = String(ref?.remote ?? "").replace(HEADS, "");
    if (!branch.startsWith(WORK_BRANCH)) return false;
    const said = repo.run(["log", "-1", "--format=%ct", `origin/${branch}`], true);
    if (!said.ok) return false;
    return staleClaim({ when: Number(String(said.out).trim()) }, now, {
      stale: span,
    }).stale;
  };
}

// [[spec/tickets/one-writer-holds-a-branch]]
export function heldElsewhere(branch, hand) {
  return [
    `${branch} stands in the hand of ${hand}, and a branch has one writer.`,
    "",
    `Land the change on ${TRUNK}, and the holder takes it in with \`./RUNME.sh branch sync\`.`,
    "Once the tip stands quiet past work.staleAfter, `./RUNME.sh branch take` moves the hold.",
  ].join("\n");
}

// A tip moves the hold where it names this box, or nobody. A tip the door reads nothing of moves nothing. [[spec/tickets/stale-hold-moves-by-take]]
export function movesHold(tipHand, box) {
  if (tipHand === null || tipHand === undefined) return false;
  if (!tipHand) return true;
  return Boolean(box) && BOX.exec(tipHand)?.[1] === box;
}

// The hand the pushed tip holds its group in, off the group ticket at that sha. Null where the tip carries no ticket. [[spec/tickets/stale-hold-moves-by-take]]
export function heldAtTip(repo) {
  return (ref) => {
    const branch = String(ref?.remote ?? "").replace(HEADS, "");
    if (!branch.startsWith(WORK_BRANCH)) return null;
    const group = branch.slice(WORK_BRANCH.length);
    const said = repo.run(["show", `${ref.sha}:${TICKETS}/${group}.md`], true);
    return said.ok ? (heldIn(said.out)?.hand ?? "") : null;
  };
}

// [[spec/tickets/stale-hold-moves-by-take]]
export function staleTakes(branch, hand) {
  const group = branch.slice(WORK_BRANCH.length);
  return [
    `${branch} stands in a stale hold of ${hand}, and a plain push leaves the hold where it stands.`,
    "",
    `Take it over with \`./RUNME.sh branch take ${group}\`, which moves the hold and takes ${TRUNK} in.`,
    "Then push your work on top.",
  ].join("\n");
}

// The span off the config, or the built-in one where the config answers nothing. [[spec/tickets/stale-hold-frees-the-branch]]
async function spanHere(files, root) {
  try {
    return await configHere(files, rootsHere(files, process.env, root)).ask(
      "work.staleAfter",
    );
  } catch {
    return "";
  }
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function namesIn(said) {
  return [
    ...new Set(
      String(said ?? "")
        .split("\n")
        .map((row) => row.trim())
        .filter(reaches),
    ),
  ];
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function rangeOf(ref) {
  return ZEROS.test(String(ref?.was ?? ""))
    ? [String(ref?.sha ?? ""), "--not", "--remotes"]
    : [`${ref.was}..${ref.sha}`];
}

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
export function carriedBy(repo) {
  return (ref) => {
    const said = repo.run(["log", "--format=", "--name-only", ...rangeOf(ref)], true);
    if (!said.ok) return [];
    const out = [];
    for (const name of namesIn(said.out)) {
      const held = repo.run(["show", `${ref.sha}:${name}`], true);
      if (held.ok) out.push({ name, text: held.out });
    }
    return out;
  };
}

// The lint over the names a push carries, read as rows through the tense reader, so this door and the check hold one list. [[spec/design_output/level0#the-tense-reader]]
export function lintedBy(outside, root, vale, files = disk()) {
  return (names) => {
    const read = names.filter((one) => PROSE.test(one));
    if (!read.length || !vale) return [];
    const ran = outside.run(
      [vale, `--config=${CONFIG}`, "--output=JSON", "--no-exit", ...read],
      {
        cwd: root,
      },
    );
    return readThrough({ disk: files, join, root }, fromJson(ran.stdout));
  };
}

async function main() {
  const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
  const files = disk();
  const outside = proc();
  const at = join(root, STAMP);
  const stamp = files.exists(at) ? files.read(at) : "";
  const said = holds(
    refsIn(files.read(STDIN)),
    stamp,
    carriedBy(git(outside, root)),
    inCloud(process.env),
    heldBy(git(outside, root)),
    boxIdHere({ root, method: root, join, disk: files }),
    process.env[ENGINE] === "1",
    staleBy(git(outside, root), await spanHere(files, root), clock().now().getTime()),
    heldAtTip(git(outside, root)),
  );
  if (said.code !== 0) console.error(said.said);
  return said.code;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(await main());
}
