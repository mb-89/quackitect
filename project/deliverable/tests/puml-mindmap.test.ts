import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { buildMindmapTree, toPumlMindmap } from "../engine/puml_mindmap.ts";
import { traceAsPumlMindmap } from "../engine/trace.ts";

describe("puml mindmap helpers", { concurrency: true }, () => {
  test("builds a deterministic PUML tree", () => {
    const tree = buildMindmapTree(
      [
        { id: "vision", label: "vision", parents: [] },
        { id: "vp-a", label: "vp-a", parents: ["vision"] },
        { id: "uc-a", label: "uc-a", parents: ["vp-a"] },
      ],
      "vision",
    );
    const puml = toPumlMindmap(tree, "trace");
    assert.ok(puml.includes("@startmindmap"));
    assert.ok(puml.includes("title trace"));
    assert.ok(puml.includes("* vision"));
    assert.ok(puml.includes("** vp-a"));
    assert.ok(puml.includes("*** uc-a"));
    assert.ok(puml.includes("@endmindmap"));
  });

  test("duplicates shared nodes under each parent branch", () => {
    const tree = buildMindmapTree(
      [
        { id: "vision", label: "vision", parents: [] },
        { id: "vp-a", label: "vp-a", parents: ["vision"] },
        { id: "vp-b", label: "vp-b", parents: ["vision"] },
        { id: "uc-shared", label: "uc-shared", parents: ["vp-a", "vp-b"] },
      ],
      "vision",
    );
    const puml = toPumlMindmap(tree, "trace");
    const hits = puml.split("\n").filter((line) => line.trim() === "*** uc-shared").length;
    assert.equal(hits, 2);
  });
});

describe("trace mindmap projection", { concurrency: true }, () => {
  test("projects trace markdown corpus into in-memory PUML", () => {
    const root = mkdtempSync(join(tmpdir(), "se-trace-puml-"));
    try {
      const dir = join(root, "project", "spec", "trace");
      mkdirSync(join(dir, "value-prop"), { recursive: true });
      mkdirSync(join(dir, "story"), { recursive: true });
      mkdirSync(join(dir, "use-case"), { recursive: true });

      writeFileSync(
        join(dir, "value-prop", "vp-a.md"),
        ["---", "id: vp-a", "type: value-prop", "statement: Better flow", "---", ""].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(dir, "story", "sty-a.md"),
        ["---", "id: sty-a", "type: story", "refines: vp-a", "statement: User can proceed", "---", ""].join("\n"),
        "utf8",
      );
      writeFileSync(
        join(dir, "use-case", "uc-a.md"),
        ["---", "id: uc-a", "type: use-case", "refines: sty-a", "statement: Happy path", "---", ""].join("\n"),
        "utf8",
      );

      const puml = traceAsPumlMindmap(root, "trace-from-data");
      assert.ok(puml.includes("title trace-from-data"));
      assert.ok(puml.includes("* vision"));
      assert.ok(puml.includes("** vp-a (value-prop)"));
      assert.ok(puml.includes("*** sty-a (story)"));
      assert.ok(puml.includes("**** uc-a (use-case)"));
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
