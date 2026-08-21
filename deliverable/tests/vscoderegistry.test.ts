// THE REGISTRY WRITE MUST NOT COST THE PERSON THEIR OTHER EXTENSIONS.
//
// The break this guards was measured on a real machine: VS Code listed NO
// extensions at all and printed `Invalid extensions content` at its own
// registry file. Seven extensions were on disk and correctly built. The
// installer had written one element with no identifier into the file, and VS
// Code rejects the whole file when one element is shaped like that.
//
// Every test below is one of the three ways that happened, or the property
// that stops it happening again. See software.md#a-file-another-program-owns.
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { entryFor, problemsIn, upsert, writeRegistry } from "../engine/vscoderegistry.ts";

const OURS = entryFor(
  "C:\\Users\\someone\\.vscode\\extensions\\brand.brand-0.1.0",
  {
    name: "brand",
    publisher: "brand",
    version: "0.1.0",
  },
  0,
);

/** Two extensions as VS Code itself records them. */
const HEALTHY = JSON.stringify([
  {
    identifier: { id: "ms-python.python", uuid: "f1f59ae4" },
    version: "2026.4.0",
    location: { $mid: 1, path: "/C:/x/ms-python.python-2026.4.0", scheme: "file" },
    relativeLocation: "ms-python.python-2026.4.0",
    metadata: { installedTimestamp: 17, source: "gallery" },
  },
  {
    identifier: { id: "pomdtr.excalidraw-editor", uuid: "3dc917d8" },
    version: "3.9.3",
    location: { $mid: 1, path: "/C:/x/pomdtr.excalidraw-editor-3.9.3", scheme: "file" },
    relativeLocation: "pomdtr.excalidraw-editor-3.9.3",
  },
]);

/** The shape the broken machine actually held: the real entries nested under
 *  a `value` key, in an element carrying no identifier of its own. */
const WRAPPED = JSON.stringify([{ value: JSON.parse(HEALTHY) }, { identifier: { id: "brand.brand" }, version: "0.1.0" }]);

function ids(text: string): string[] {
  return JSON.parse(text).map((e: { identifier: { id: string } }) => e.identifier.id);
}

describe("choosing the new entry list", { concurrency: true }, () => {
  test("a healthy file keeps every id and gains ours", () => {
    const r = upsert(HEALTHY, OURS);
    assert.deepEqual(ids(JSON.stringify(r.entries)), ["ms-python.python", "pomdtr.excalidraw-editor", "brand.brand"]);
    assert.equal(r.dropped, 0);
    assert.equal(r.replaced, false);
  });

  test("what the entries carry survives the round trip", () => {
    const r = upsert(HEALTHY, OURS);
    const python = r.entries[0] as { identifier: { uuid?: string }; metadata?: { source?: string } };
    assert.equal(python.identifier.uuid, "f1f59ae4");
    assert.equal(python.metadata?.source, "gallery");
  });

  test("the wrapper an earlier writer left is opened, never carried", () => {
    const r = upsert(WRAPPED, OURS);
    assert.equal(r.unwrapped, 1);
    assert.equal(r.dropped, 0);
    assert.deepEqual(ids(JSON.stringify(r.entries)), ["ms-python.python", "pomdtr.excalidraw-editor", "brand.brand"]);
  });

  test("carrying it instead would make the damage permanent", () => {
    const once = JSON.stringify(upsert(WRAPPED, OURS).entries);
    const twice = JSON.stringify(upsert(once, OURS).entries);
    assert.deepEqual(ids(twice), ids(once));
    assert.equal(problemsIn(twice, []).length, 0);
  });

  test("an element nothing can identify is dropped and counted", () => {
    const r = upsert(JSON.stringify([{ nonsense: true }]), OURS);
    assert.equal(r.dropped, 1);
    assert.deepEqual(ids(JSON.stringify(r.entries)), ["brand.brand"]);
  });

  test("a repeated id collapses to one entry", () => {
    const twice = JSON.parse(HEALTHY);
    const r = upsert(JSON.stringify([...twice, twice[0]]), OURS);
    assert.deepEqual(r.carried, ["ms-python.python", "pomdtr.excalidraw-editor"]);
  });

  test("our own entry replaces the one already listed", () => {
    const r = upsert(JSON.stringify([{ identifier: { id: "brand.brand" }, version: "0.0.1" }]), OURS);
    assert.equal(r.replaced, true);
    assert.equal(r.entries.length, 1);
    assert.equal((r.entries[0] as unknown as { version: string }).version, "0.1.0");
  });

  test("a file that is not JSON is rebuilt rather than refused", () => {
    const r = upsert("{ this is not json", OURS);
    assert.equal(r.unreadable, true);
    assert.deepEqual(ids(JSON.stringify(r.entries)), ["brand.brand"]);
  });

  test("no file at all is the same as an empty one", () => {
    assert.deepEqual(ids(JSON.stringify(upsert(null, OURS).entries)), ["brand.brand"]);
  });
});

describe("judging a written file the way VS Code does", { concurrency: true }, () => {
  test("an entry with no identifier is named", () => {
    const problems = problemsIn(JSON.stringify([{ value: [] }]), []);
    assert.equal(problems.length, 1);
    assert.match(problems[0], /identifier\.id/);
  });

  test("a top-level object is refused, because VS Code rejects the file", () => {
    assert.match(problemsIn(JSON.stringify({ identifier: { id: "a.b" } }), [])[0], /not a JSON array/);
  });

  test("an id that went missing is named", () => {
    assert.match(problemsIn(HEALTHY, ["gone.away"])[0], /gone\.away is missing/);
  });
});

describe("writing the registry", { concurrency: false }, () => {
  function registryHolding(text: string | null): string {
    const dir = mkdtempSync(join(tmpdir(), "se-vscode-"));
    const path = join(dir, "extensions.json");
    if (text !== null) writeFileSync(path, text, "utf8");
    return path;
  }

  test("a one-entry registry is still an array on disk", () => {
    const path = registryHolding(null);
    writeRegistry(path, OURS, "stamp");
    assert.equal(readFileSync(path, "utf8").trimStart()[0], "[");
  });

  test("the damaged file is kept under its own name", () => {
    const path = registryHolding(WRAPPED);
    const report = writeRegistry(path, OURS, "stamp");
    assert.equal(report.rescued, `${path}.broken-stamp`);
    assert.equal(readFileSync(report.rescued, "utf8"), WRAPPED);
    assert.deepEqual(ids(readFileSync(path, "utf8")), ["ms-python.python", "pomdtr.excalidraw-editor", "brand.brand"]);
  });

  test("a healthy file is backed up and left loadable", () => {
    const path = registryHolding(HEALTHY);
    const report = writeRegistry(path, OURS, "stamp");
    assert.equal(report.rescued, null);
    assert.equal(readFileSync(`${path}.bak`, "utf8"), HEALTHY);
    assert.equal(problemsIn(readFileSync(path, "utf8"), report.carried).length, 0);
  });

  test("the entry names the folder VS Code will load", () => {
    const entry = OURS as unknown as { relativeLocation: string; location: { path: string } };
    assert.equal(entry.relativeLocation, "brand.brand-0.1.0");
    assert.equal(entry.location.path, "/C:/Users/someone/.vscode/extensions/brand.brand-0.1.0");
  });
});
