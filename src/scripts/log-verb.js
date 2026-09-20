// The verb behind `./RUNME.sh log`: the rows the log holds, narrowed by the
// four flags, printed the way the window prints them.
// [[spec/design_output/log#one-verb-reads-the-log]]

import {
  asRow,
  atLevel,
  filesFor,
  lastOf,
  ofKind,
  rowsIn,
  within,
} from "./log-read.js";

const USAGE = [
  "Usage: ./RUNME.sh log [flags]\n",
  "  --since <span>  the rows stamped inside the span, as 10m, 2h or 3d",
  "  --level <name>  the rows at that level and above",
  "  --kind <name>   the rows of that kind",
  "  --last <count>  the last rows, after every filter above",
];

export function logVerb(it, argv) {
  const said = argv ?? [];
  if (said.includes("--help")) {
    for (const row of USAGE) console.log(row);
    return 0;
  }

  const now = it.clock.now().getTime();
  const paths = filesFor(it, flagOf(said, "--since"), now);
  if (!paths.length) {
    console.log("No log stands yet. A writer starts one the next time it says a line.");
    return 0;
  }

  const rows = narrowed(rowsIn(it, paths), said, now);
  for (const one of rows) console.log(asRow(one));
  return 0;
}

// [[spec/design_output/log#one-verb-reads-the-log]]
export function narrowed(rows, argv, now) {
  const said = argv ?? [];
  return lastOf(
    ofKind(
      atLevel(within(rows, flagOf(said, "--since"), now), flagOf(said, "--level")),
      flagOf(said, "--kind"),
    ),
    flagOf(said, "--last"),
  );
}

function flagOf(argv, name) {
  const at = argv.indexOf(name);
  return at >= 0 ? String(argv[at + 1] ?? "") : "";
}
