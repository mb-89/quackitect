// The voice verbs. `measure` scores a folder of prose through Vale, and
// `refused` ranks what the doors turn away. The pure half stands in
// lib/voice.js, and this half reaches the disk, the clock and the process.
// [[spec/funnel/a-paragraph-has-a-schema]]

import { dirname, join } from "node:path";
import { FOLDER } from "../../.claude/skills/level0/lib/log.js";
import { CONFIG, fromJson } from "../../.claude/skills/level0/lib/vale.js";
import {
  answerFiles,
  answersIn,
  DAYS,
  MEASURED,
  measuredRows,
  measureTable,
  rankedRefusals,
  refusalsIn,
  refusedTable,
  rowsIn,
  ruleCounts,
  sinceOf,
  tabled,
  totalOf,
  wordsIn,
} from "../../.claude/skills/level0/lib/voice.js";

const PROSE = /\.(md|markdown|txt)$/i;
const ROWS = /\.jsonl$/i;
const TRANSCRIPTS = "--transcripts";

// [[spec/funnel/a-paragraph-has-a-schema]]
export async function voice(root, argv, it, bin) {
  const what = String(argv[0] ?? "");
  if (what === "measure") return measure(root, argv.slice(1), it, bin);
  if (what === "refused") return refused(root, argv.slice(1), it);

  console.log("Usage: ./RUNME.sh voice <verb>\n");
  console.log("  measure <folder>           score every markdown file under a folder");
  console.log(`  measure ${TRANSCRIPTS} <f>  pull the answers out of the transcripts first`);
  console.log("  refused [days]             rank what the doors turn away, seven by default");
  return what ? 2 : 0;
}

// [[spec/funnel/a-paragraph-has-a-schema]]
async function measure(root, argv, it, bin) {
  if (!bin || !it.disk.exists(bin)) {
    console.error("Vale is missing. Run ./RUNME.sh once and it installs.");
    return 2;
  }

  const pulling = argv.includes(TRANSCRIPTS);
  const named = argv.filter((one) => one !== TRANSCRIPTS);
  let folder = named[0] ?? ".";

  if (pulling) {
    const made = pullAnswers(root, folder, it);
    if (!made) {
      console.error(`No answer of 25 words or more stands under ${folder}.`);
      return 1;
    }
    console.log(`${made} answer(s) under ${MEASURED}.\n`);
    folder = MEASURED;
  }

  const at = under(root, folder);
  const paths = filesUnder(it.disk, at, PROSE);
  if (!paths.length) {
    console.error(`No markdown file stands under ${folder}.`);
    return 1;
  }

  const ran = await it.proc.run(
    [bin, `--config=${CONFIG}`, "--output=JSON", "--no-exit", folder],
    { cwd: root },
  );
  const found = new Map();
  for (const one of fromJson(ran.stdout)) {
    const key = shown(root, one.file);
    found.set(key, [...(found.get(key) ?? []), one]);
  }

  const mine = paths.map((path) => {
    const file = shown(root, path);
    return { file, words: wordsIn(it.disk.read(path)), found: found.get(file) ?? [] };
  });
  const rows = measuredRows(mine);

  console.log(measureTable([...rows, totalOf(rows)]));

  const counts = ruleCounts(mine.flatMap((one) => one.found));
  if (counts.length) {
    console.log("");
    console.log(tabled(["rule", "fires"], counts, [1]));
  }
  return 0;
}

// [[spec/funnel/a-paragraph-has-a-schema]]
async function refused(root, argv, it) {
  const said = Number(argv[0]);
  const days = Number.isFinite(said) && said > 0 ? said : DAYS;
  const texts = filesUnder(it.disk, under(root, FOLDER), ROWS).map((path) =>
    it.disk.read(path),
  );

  const since = sinceOf(it.clock.now().toISOString(), days);
  const ranked = rankedRefusals(refusalsIn(rowsIn(texts), since));
  if (!ranked.length) {
    console.log(`No door refuses anything in ${days} day(s).`);
    return 0;
  }

  console.log(refusedTable(ranked));
  return 0;
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function pullAnswers(root, folder, it) {
  let made = 0;
  for (const path of filesUnder(it.disk, under(root, folder), ROWS)) {
    const session = path.split(/[\\/]/).pop().replace(ROWS, "");
    for (const one of answerFiles(session, answersIn(it.disk.read(path)))) {
      const to = under(root, one.path);
      it.disk.makeDir(dirname(to));
      it.disk.write(to, one.text);
      made += 1;
    }
  }
  return made;
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function filesUnder(disk, at, wanted) {
  const out = [];
  const into = (path) => {
    let rows = null;
    try {
      rows = disk.list(path);
    } catch {
      if (wanted.test(path) && disk.exists(path)) out.push(path);
      return;
    }
    for (const one of rows ?? []) {
      const held = join(path, one.name);
      if (one.kind === "dir") into(held);
      else if (wanted.test(one.name)) out.push(held);
    }
  };
  into(at);
  return out.sort();
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function under(root, path) {
  const said = String(path);
  if (said.startsWith("/") || /^[A-Za-z]:[\\/]/.test(said)) return said;
  return join(root, ...said.split("/"));
}

// [[spec/funnel/a-paragraph-has-a-schema]]
function shown(root, path) {
  const flat = String(path).split("\\").join("/");
  const base = String(root).split("\\").join("/");
  return flat.startsWith(`${base}/`) ? flat.slice(base.length + 1) : flat;
}
