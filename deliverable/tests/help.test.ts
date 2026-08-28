// EVERY COMMAND-LINE SWITCH APPEARS IN HELP.
//
// --one-screen had lived in RUNME for weeks without ever being mentioned by
// --help, because RUNME's help only forwarded to the server's help and the
// server has never heard of that flag. A switch nobody can discover is a
// switch nobody has.
//
// This is the guard, not a sentence of guidance: for each entry point, read
// the switches it PARSES out of its own source, then run it with --help and
// demand every one of them in the output. Adding a flag without documenting
// it turns the suite red.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { entryPoints } from "../engine/doors.ts";

const here = dirname(fileURLToPath(import.meta.url));
const binDir = join(here, "..", "engine", "bin");
const repoRoot = join(here, "..", "..");

// EVERY FILE A PERSON CAN TYPE A SWITCH AT, COUNTED FROM THE TREE.
//
// This was a hand-written list of six names while the tree held twenty-nine
// entry points. A guard reading a list checks whatever somebody remembered to
// add to it, which is not the same question.
//
// THE FILTER IS NOT A SECOND LIST. A file that parses no switch has none to
// document, so it is excluded by what the extractor actually finds rather than
// by a name somebody typed. see dsp-the-door-rule.md#responsibility
const ENTRY_POINTS = entryPoints(repoRoot)
  .map((rel) => rel.slice(rel.lastIndexOf("/") + 1))
  .filter((name) => parsedFlags(readFileSync(join(binDir, name), "utf8")).size > 0);

// THE ENUMERATION MUST NOT COLLAPSE. A broken walk returns nothing and every
// case below passes for the wrong reason, which is the silent pass this whole
// guard exists to stop.
test("the entry points are counted from the tree, not from a list", () => {
  assert.ok(
    ENTRY_POINTS.length > 6,
    `only ${String(ENTRY_POINTS.length)} entry points parse a switch. The hand-written list this replaced held six, so anything at or below six means the walk is not reaching the tree.`,
  );
});

/** The switches a source PARSES, read from the three shapes the entry points
 *  use to look at argv.
 *
 *  Matching every "-x" literal instead would be wrong: `spawnSync("git",
 *  ["--version"])` and `[process.execPath, "--test"]` hand flags to ANOTHER
 *  program. Those belong in that program's help, never in this file's. */
function parsedFlags(src: string): Set<string> {
  const found = new Set<string>();
  const shapes = [
    /(?:argValue|flagValue)\(\s*"(-[^"\s]+)"\s*\)/g, // argValue("--root")
    /\.includes\(\s*"(-[^"\s]+)"\s*\)/g, //             argv.includes("--child")
    /===\s*"(-[^"\s]+)"/g, //                           a === "--help"
  ];
  for (const re of shapes) for (const m of src.matchAll(re)) found.add(m[1]);
  return found;
}

// THE SIX THAT ALREADY BLOCKED KEEP BLOCKING. This is a ratchet floor rather
// than a scope: it says which files were already held to the rule, so widening
// the enumeration cannot quietly lower the bar on them.
//
// EVERYTHING THE WALK NEWLY REACHES WARNS FIRST. A new guard warns until its
// warn rate is near zero, and widening this one from six files to the whole
// tree found eleven real breaks in code no record has touched. Blocking on
// them would fail every run for work nobody has had a chance to do.
const BLOCKING = new Set(["se-mcp.ts", "se-pty.ts", "se-manual.ts", "preflight.ts", "smoketest.ts", "selftest.ts"]);
const warnings: string[] = [];

function hold(file: string, ok: boolean, says: string): void {
  if (ok) return;
  if (BLOCKING.has(file)) assert.fail(says);
  warnings.push(says);
}

for (const file of ENTRY_POINTS) {
  test(`every switch ${file} parses appears in its --help`, () => {
    const flags = [...parsedFlags(readFileSync(join(binDir, file), "utf8"))].sort();
    // A silent zero would make this test pass forever without checking
    // anything, so an empty extraction fails the extractor, not the file.
    assert.ok(flags.length > 0, `${file}: no switches extracted — parsedFlags is broken, not ${file}`);

    // SE_ARGS is cleared: the RUNME that launched a live session puts the
    // whole forwarded command line there, and se-mcp reads it as argv.
    const r = spawnSync(process.execPath, [join(binDir, file), "--help"], {
      encoding: "utf8",
      windowsHide: true,
      env: { ...process.env, SE_ARGS: "" },
    });
    hold(file, r.status === 0, `${file} --help must exit 0; stderr: ${r.stderr}`);
    for (const flag of flags) {
      hold(file, r.stdout.includes(flag), `${file}: --help never mentions ${flag}. Every switch appears in help.`);
    }
  });
}

/** The switches RUNME.ps1 parses. PowerShell compares with -eq, -ne and -in,
 *  so they sit on those lines: `$_ -in @("--help", "-h")`, `$_ -eq "--manual"`. */
function runmeFlags(src: string): Set<string> {
  const flags = new Set<string>();
  for (const line of src.matchAll(/-(?:eq|ne|in)\b[^\r\n]*/g)) {
    for (const lit of line[0].matchAll(/"(-[^"\s]+)"/g)) flags.add(lit[1]);
  }
  return flags;
}

// ONE HELP, NOT TWO. RUNME printed its own list and
// then the server's, and the reader had to stitch them together. The launch
// flags are now declared next to the engine's in se-mcp.ts, which is the one
// place anybody has to look — so that is where this guard checks for them.
//
// RUNME is read STATICALLY. Running it needs PowerShell, and one test is not
// worth binding the whole suite to one platform.
test("every switch RUNME.ps1 parses appears in the ONE help", () => {
  const flags = runmeFlags(readFileSync(join(repoRoot, "RUNME.ps1"), "utf8"));
  assert.ok(flags.size > 0, "no switches extracted from RUNME.ps1 — the extractor is broken, not RUNME");

  const r = spawnSync(process.execPath, [join(binDir, "se-mcp.ts"), "--help"], {
    encoding: "utf8",
    windowsHide: true,
    env: { ...process.env, SE_ARGS: "" },
  });
  assert.equal(r.status, 0, `se-mcp.ts --help must exit 0; stderr: ${r.stderr}`);
  for (const flag of [...flags].sort()) {
    assert.ok(r.stdout.includes(flag), `the one help never mentions RUNME's ${flag}. Every switch appears in help.`);
  }
});

// The second list must not grow back. A here-string of its own is exactly how
// the split started, and rendering the server's help is the whole mechanism.
test("RUNME renders the one help and keeps no list of its own", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.doesNotMatch(src, /\$HELP/, "RUNME.ps1 must keep no help text of its own — the one help lives in se-mcp.ts");
  assert.match(src, /se-mcp\.ts"\) --help/, "RUNME.ps1 must render the server's help");
});

// Listing a flag is not enough if the listing never reaches the reader.
// Write-Host goes to the host stream, which a pipe or a redirect drops. That
// is how a documented flag still read as undocumented.
test("the one help reaches the OUTPUT stream, so a pipe or a redirect keeps it", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.doesNotMatch(src, /Write-Host[^\r\n]*[Hh]elp/, "RUNME.ps1 must not Write-Host anything about help");
  const mcp = readFileSync(join(binDir, "se-mcp.ts"), "utf8");
  assert.match(mcp, /process\.stdout\.write\(`se — ONE help/, "the one help is written to stdout");
});

// The terminal pane is the DEFAULT launch, and that launch is the one that
// has to survive its window closing. --own-terminal is the way back.
test("the default launch runs the terminal host detached", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.match(src, /if \(\$ownTerminal\) \{/, "RUNME.ps1 must branch on $ownTerminal — the flag that keeps the agent in this window");
  assert.match(src, /se-pty\.ts[^\r\n]*--detach/, "the default launch passes --detach, or closing the window kills the session");
});

// MANUAL MODE MEANS NO LLM: se-manual is the mirror standing alone, and a
// missing agent CLI falls into it instead of ending the run.
test("manual mode runs the mirror alone, and a missing LLM falls into it", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.match(src, /se-manual\.ts/, "RUNME.ps1 must launch se-manual.ts for manual mode");
  assert.match(src, /-eq \$agentHost\)[^\r\n]*\$manual/, "no agent CLI at all must fall back to manual mode");
  assert.match(src, /\$manual = \$true/, "the no-LLM fallback must set manual mode, not exit");
});

// TWO HOSTS: the project ships to a colleague running
// GitHub Copilot CLI on Windows. Claude wins when both are installed.
test("the launcher detects its agent host, and Claude wins when both are there", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  const pick = /\$agentHost = "claude" \} elseif[^\r\n]*copilot[^\r\n]*\$agentHost = "copilot"/;
  assert.match(src, pick, "claude is tested FIRST, so it is the default when both answer");
  assert.match(src, /\$agentHost -eq "copilot"/, "and the launch branches on the host it found");
  // Copilot takes the kickoff on its own command line: -i starts an
  // interactive session and runs that text as its first turn.
  assert.match(src, /copilot[^\r\n]*-i \$kickoff/, "copilot gets the kickoff on its command line, one command like claude");
});

// THE CAGE IS WHAT ENFORCES CONTRACT RULE 1. Claude's is a settings file;
// Copilot denies tools on the command line, so that half is DATA the
// colleague can correct without touching code.
test("each host gets a cage, and Copilot's flags live in data", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.match(src, /claude-settings\.json/, "Claude's deny list is installed");
  assert.match(src, /copilot-mcp-config\.json/, "Copilot's MCP config is installed");
  assert.match(src, /copilot-cage\.json[^\r\n]*|ConvertFrom-Json/, "and its deny flags are read from data, not hard-coded");
  const cage = JSON.parse(readFileSync(join(repoRoot, "deliverable", "cage", "copilot-cage.json"), "utf8")) as {
    _readme: string[];
    deny_args: string[];
  };
  assert.ok(cage.deny_args.length > 0, "the cage denies something");
  assert.ok(cage._readme.join(" ").includes("VERIFIED AGAINST A LIVE CLI"), "and it records that the flags were proven against a live CLI");
});

// THE WARNINGS ARE RATCHETED, so widening the guard bought a real bar rather
// than a list nobody reads. The count may fall and may never rise.
//
// A WARN NOBODY COUNTS IS A WARN NOBODY FIXES. That is the silting this
// project has already registered as a risk against every list of exceptions,
// and the answer here is the same one the read and write doors use.
//
// IT RUNS LAST because the per-file cases above are what fill the list.
//
// THE CEILING COUNTS FINDINGS, NEVER FAILING CASES. One file can break the
// rule more than once, so 11 files produced 17 findings. Written as 12 from
// the file count, this case failed on its own first run.
test("the entry points nothing holds to the rule are counted, and the count may not rise", () => {
  const WARN_CEILING = 17;
  assert.ok(
    warnings.length <= WARN_CEILING,
    `${String(warnings.length)} findings break the help rule, above the ceiling of ${String(WARN_CEILING)}. Document the switch, or make --help exit 0.\n${warnings.join("\n")}`,
  );
});
