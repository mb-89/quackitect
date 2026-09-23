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

const USAGE = [
  "Usage: ./RUNME.sh log [flags]\n",
  "  --since <span>  the rows stamped inside the span, as 10m, 2h or 3d",
  "  --level <name>  the rows at that level and above",
  "  --kind <name>   the rows of that kind",
  "  --words <text>  the rows carrying every word, in any case",
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
    console.log(NO_LOG);
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
  return [];
}

function flagOf(argv, name) {
  const at = argv.indexOf(name);
  return at >= 0 ? String(argv[at + 1] ?? "") : "";
}
