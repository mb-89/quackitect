// The verb behind `./RUNME.sh log`: the rows the log holds, narrowed by its
// flags, printed the way the window prints them.
// [[spec/design_output/log#one-verb-reads-the-log]]

import {
  asRow,
  atLevel,
  carrying,
  filesFor,
  lastOf,
  NO_LOG,
  ofKind,
  rowsIn,
  within,
} from "./log-read.js";
import { answerOf, logRowsOf, readsNew, topicOf } from "./quack-topic.js";
import { asLines, rowOf, SESSION } from "../../.claude/skills/level0/lib/log.js";

const USAGE = [
  "Usage: ./RUNME.sh log [flags]\n",
  "  --since <span>  the rows stamped inside the span, as 10m, 2h or 3d",
  "  --level <name>  the rows at that level and above",
  "  --kind <name>   the rows of that kind",
  "  --words <text>  the rows carrying every word, in any case",
  "  --last <count>  the last rows, after every filter above",
  "  --count         one row a kind, over the rows the filters keep",
  "  --say <row>     append one row, a JSON object of level, kind, said and extra",
];

// [[spec/design_output/log#one-verb-reads-the-log]]
export async function logVerb(it, argv) {
  const said = argv ?? [];
  if (said.includes("--help")) {
    for (const row of USAGE) console.log(row);
    return 0;
  }
  if (said.includes("--say")) return says(it, flagOf(said, "--say"));

  const now = it.clock.now().getTime();
  const paths = filesFor(it, flagOf(said, "--since"), now);
  if (!paths.length) {
    console.log(NO_LOG);
    return 0;
  }

  // The rows come off quack log where the log slice reads new. [[spec/tickets/topic-fallback-leaves-the-readers]]
  const held = readsNew(it, "log")
    ? answerOf(logRowsOf(topicOf(it, ["log"])), "log")
    : rowsIn(it, paths);
  const rows = narrowed(held, said, now);
  const shown = said.includes("--count") ? countsOf(rows) : rows.map(asRow);
  for (const one of shown) console.log(one);
  return 0;
}

// [[spec/design_output/log#one-verb-reads-the-log]]
export function narrowed(rows, argv, now) {
  const said = argv ?? [];
  return lastOf(
    carrying(
      ofKind(
        atLevel(within(rows, flagOf(said, "--since"), now), flagOf(said, "--level")),
        flagOf(said, "--kind"),
      ),
      flagOf(said, "--words"),
    ),
    flagOf(said, "--last"),
  );
}

// [[spec/design_output/log#one-verb-reads-the-log]]
export function countsOf(rows) {
  const per = new Map();
  for (const one of rows ?? []) per.set(one.kind, (per.get(one.kind) ?? 0) + 1);
  return [...per]
    .sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))
    .map(([kind, count]) => `${count}  ${kind}`);
}

// One row appended to the session log, so a row another writer lands in the meantime stays. [[spec/tickets/the-sidebar-writes-through-actions]]
function says(it, text) {
  let row;
  try {
    row = JSON.parse(text);
  } catch {
    console.error(`log --say takes one JSON row, and reads ${text}`);
    return 2;
  }
  const one = rowOf(
    it.clock.now().toISOString(),
    row?.level,
    row?.kind,
    row?.said ?? "",
    row?.extra,
  );
  it.disk.append(it.join(it.root, ...SESSION.split("/")), asLines([one]));
  return 0;
}

function flagOf(argv, name) {
  const at = argv.indexOf(name);
  return at >= 0 ? String(argv[at + 1] ?? "") : "";
}
