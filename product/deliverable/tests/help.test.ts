// EVERY COMMAND-LINE SWITCH APPEARS IN HELP (owner ruling 2026-07-28).
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
import { test } from "node:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const binDir = join(here, "..", "engine", "bin");
const repoRoot = join(here, "..", "..", "..");

// Every file a person can type a switch at.
const ENTRY_POINTS = ["se-mcp.ts", "se-pty.ts", "se-manual.ts", "preflight.ts", "selftest.ts"];

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
    assert.equal(r.status, 0, `${file} --help must exit 0; stderr: ${r.stderr}`);
    for (const flag of flags) {
      assert.ok(r.stdout.includes(flag), `${file}: --help never mentions ${flag}. Every switch appears in help.`);
    }
  });
}

// RUNME is checked STATICALLY. Running it needs PowerShell, and one test is
// not worth binding the whole suite to one platform.
test("every switch RUNME.ps1 parses appears in its help text", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");

  // PowerShell compares with -eq, -ne and -in, so the switches sit on those
  // lines: `$_ -in @("--help", "-h")`, `$_ -eq "--manual"`.
  const flags = new Set<string>();
  for (const line of src.matchAll(/-(?:eq|ne|in)\b[^\r\n]*/g)) {
    for (const lit of line[0].matchAll(/"(-[^"\s]+)"/g)) flags.add(lit[1]);
  }
  assert.ok(flags.size > 0, "no switches extracted from RUNME.ps1 — the extractor is broken, not RUNME");

  const help = /\$HELP\s*=\s*@"\r?\n([\s\S]*?)\r?\n"@/.exec(src);
  assert.ok(help !== null, 'RUNME.ps1 must hold its help in ONE $HELP here-string, so this guard can find it');
  for (const flag of [...flags].sort()) {
    assert.ok(help[1].includes(flag), `RUNME.ps1: $HELP never mentions ${flag}. Every switch appears in help.`);
  }
});

// Listing a flag is not enough if the listing never reaches the reader.
// RUNME's own block was written with Write-Host, which goes to the host
// stream — a pipe or a redirect drops it, and the server's help is all that
// survives. That is how a documented flag still read as undocumented.
test("RUNME prints its help on the OUTPUT stream, so a pipe or a redirect keeps it", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.match(src, /Write-Output \$HELP/, "RUNME.ps1 must Write-Output $HELP — Write-Host writes to the host stream, which a redirect drops");
  assert.doesNotMatch(src, /Write-Host \$HELP/, "RUNME.ps1 must not Write-Host its help");
});

// The terminal pane is the DEFAULT launch, and that launch is the one that
// has to survive its window closing. --own-terminal is the way back.
test("the default launch runs the terminal host detached", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.match(src, /if \(\$ownTerminal\) \{/, "RUNME.ps1 must branch on $ownTerminal — the flag that keeps the agent in this window");
  assert.match(src, /se-pty\.ts[^\r\n]*--detach/, "the default launch passes --detach, or closing the window kills the session");
});

// MANUAL MODE MEANS NO LLM: se-manual is the mirror standing alone, and a
// missing claude CLI falls into it instead of ending the run.
test("manual mode runs the mirror alone, and a missing LLM falls into it", () => {
  const src = readFileSync(join(repoRoot, "RUNME.ps1"), "utf8");
  assert.match(src, /se-manual\.ts/, "RUNME.ps1 must launch se-manual.ts for manual mode");
  assert.match(src, /-eq \$claude\)[^\r\n]*\$manual/, "a missing claude CLI must fall back to manual mode");
  assert.match(src, /\$manual = \$true/, "the no-LLM fallback must set manual mode, not exit");
});
