// see dsp-file-lane.md#the-outward-search-actually-happened
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/** see dsp-file-lane.md#the-finders-that-face-outside */
const OUTWARD = new Set(["prior-art", "analogy"]);

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

/** One frontmatter scalar, or "". Enough for flat keys; nothing here nests. */
function field(text: string, key: string): string {
  const m = new RegExp(`^${key}:[ \\t]*(.*)$`, "m").exec(text);
  return m === null ? "" : m[1].trim().replace(/^["']|["']$/g, "");
}

const root = argValue("--root") ?? process.cwd();
const optionDir = join(root, "project", "spec", "trace", "option");
const problems: string[] = [];

// EVERY OUTWARD OPTION CARRIES A SOURCE, AND THE SOURCE POINTS OUTSIDE.
// A repo path is not a source here. It is us citing ourselves.
const outward: string[] = [];
if (existsSync(optionDir)) {
  for (const f of readdirSync(optionDir).filter((n) => n.endsWith(".md"))) {
    const text = readFileSync(join(optionDir, f), "utf8");
    const foundBy = field(text, "found_by");
    if (!OUTWARD.has(foundBy)) continue;
    outward.push(f);
    const source = field(text, "source");
    if (source === "") {
      problems.push(`${f}: found_by ${foundBy} with no source — an idea without one is a rumour`);
      continue;
    }
    if (/^(project|product)\//.test(source) || source.startsWith(".se/")) {
      problems.push(`${f}: source "${source}" is a path in this repository — an outward finder cites the world, not us`);
    }
  }
}

// AT LEAST ONE OUTWARD QUERY IS RECORDED. Nothing here counts queries per
// option: one honest search turns up several options, and a rule demanding
// one query each would only teach people to make queries.
if (outward.length > 0) {
  // THE LOG ROTATES, so the proof may sit in a rotated segment beside the
  // current one. Sweep every calls*.jsonl rather than the newest alone.
  // `.se/` IS SESSION STATE AND BELONGS TO THE MACHINE, never to the corpus.
  // The engine hands it over, because --root names the corpus being judged.
  const seDir = process.env.SE_HOME ?? join(root, ".se");
  const segments = existsSync(seDir) ? readdirSync(seDir).filter((n) => /^calls.*\.jsonl$/.test(n)) : [];
  if (segments.length === 0) {
    problems.push(`${outward.length} outward options stand, and no call log exists under .se/ — the search cannot be proven`);
  } else {
    let queries = 0;
    for (const seg of segments) {
      const text = readFileSync(join(seDir, seg), "utf8");
      queries += (text.match(/"tool":"(se_web_(search|fetch)|WebSearch|WebFetch)"/g) ?? []).length;
    }
    if (queries === 0) {
      problems.push(
        `${outward.length} options claim outward sources and no log segment records se_web_search, se_web_fetch or the native WebSearch — either the search did not happen, or it happened outside the lane`,
      );
    }
  }
}

if (problems.length === 0) {
  process.stdout.write(
    outward.length === 0
      ? "outward search: nothing to check yet — no option carries an outward finder\n"
      : `outward search green: ${outward.length} outward options, each with a source outside this repository\n`,
  );
} else {
  process.stdout.write(`outward search RED — ${problems.length} problem${problems.length === 1 ? "" : "s"}\n\n`);
  for (const p of problems) process.stdout.write(`- ${p}\n`);
  process.exitCode = 1;
}
