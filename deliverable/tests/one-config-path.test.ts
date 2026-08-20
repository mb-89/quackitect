// A CONFIGURATION PATH LIVES IN ONE PLACE — req-a-preflight-check-asks-the-reader-where-it-looked.
//
// WHAT THIS FILE IS FOR. The palette and the brand file are read live and fall
// back SILENTLY by design, which is right at render time. Preflight exists to
// say at boot what the render may not say — and preflight used to join its OWN
// copy of each path. The check and the reader then went stale together, so a
// moved file passed its own guard and surfaced two layers away as a missing
// variable.
//
// THE ROW'S MEASURE IS ONE OCCURRENCE PER PATH, ACROSS THE READER AND EVERY
// CHECK OF IT. So this file counts the whole engine, not only preflight — a
// ratchet that watched one file would have left three other constructions of
// the same path standing.
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ENGINE = fileURLToPath(new URL("../engine/", import.meta.url));

function sourcesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return sourcesUnder(p);
    return e.name.endsWith(".ts") ? [p] : [];
  });
}

/** Lines that NAME a configuration file, comments and blank prose excluded.
 *  A comment naming the file is documentation; a line building the path is a
 *  second place the truth lives. */
function namingLines(needle: string): string[] {
  const out: string[] = [];
  for (const file of sourcesUnder(ENGINE)) {
    for (const [i, line] of readFileSync(file, "utf8").split("\n").entries()) {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) continue;
      if (t.includes(needle)) out.push(`${file.slice(ENGINE.length)}:${i + 1}: ${t}`);
    }
  }
  return out;
}

for (const config of ["palette.css", "brand.json"]) {
  test(`${config} is named in exactly one place in the engine`, () => {
    const lines = namingLines(config);
    assert.equal(lines.length, 1, `one place builds the path to ${config}, got ${lines.length}:\n${lines.join("\n")}`);
  });
}

test("preflight asks the reader, so the check cannot go stale on its own", () => {
  const src = readFileSync(join(ENGINE, "bin", "preflight.ts"), "utf8")
    .split("\n")
    .filter((l) => !l.trim().startsWith("//") && !l.trim().startsWith("*"))
    .join("\n");
  assert.ok(/palettePath/.test(src), "preflight asks for the palette's path rather than joining one");
  assert.ok(/brandPath/.test(src), "and for the brand file's");
});

test("preflight does not reach the renderer, because a boot check must not need a drawing", () => {
  // THE FIX THAT BROKE THE BOOT. Reaching `palettePath` through render.ts drags
  // the whole drawing graph into preflight — and with it a package a test root
  // does not install, so preflight died at module load before running a check.
  const src = readFileSync(join(ENGINE, "bin", "preflight.ts"), "utf8");
  assert.ok(!/from "\.\.\/render\.ts"/.test(src), "preflight imports no renderer");
  assert.ok(!/from "\.\.\/baseui\.ts"|from "\.\.\/vault\.ts"/.test(src), "nor anything the renderer would pull in behind it");
});

test("the palette reader still falls back silently, because a colour must not take a surface down", () => {
  // THE GUARD ON THE FIX, anchored to the function it guards. A bare search for
  // `catch` passes off any other catch in the file and guards nothing.
  const src = readFileSync(join(ENGINE, "render.ts"), "utf8");
  const at = src.indexOf("export function palette(");
  assert.ok(at >= 0, "the palette reader is still called palette");
  const body = src.slice(at, src.indexOf("\nexport ", at + 1));
  assert.match(body, /catch\s*\{/, "the live read catches, so a missing palette renders from the baked fallback");
  assert.match(body, /PALETTE_FALLBACK/, "and the fallback it returns is the baked one");
});
