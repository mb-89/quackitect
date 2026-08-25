// The harness registry (tsp-supported-harness-serves-one-lane-contract).
//
// SMALL FILES ON PURPOSE. See guidance/craft/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { HARNESSES, harnessFor, smallestInlineOutputBytes } from "../engine/harness.ts";

describe("the harness registry", () => {
  test("every supported harness is named in one place, and that list is what callers iterate", () => {
    assert.ok(HARNESSES.length >= 3, "Claude Code, Copilot CLI and VS Code are all supported today");
    const ids = HARNESSES.map((h) => h.id);
    assert.deepEqual([...new Set(ids)], ids, "two entries sharing an id would make the lookup ambiguous");
    for (const h of HARNESSES) {
      assert.ok(h.clientNames.length > 0, `${h.id} answers to no client name, so it can never be identified`);
      assert.ok(h.measured.trim() !== "", `${h.id} carries no provenance, so its numbers cannot be checked`);
    }
  });

  test("a host names itself and is found, whatever case it uses", () => {
    assert.equal(harnessFor("Claude Code")?.id, "claude-code");
    assert.equal(harnessFor("copilot-cli")?.id, "copilot-cli");
    assert.equal(harnessFor("Visual Studio Code")?.id, "vscode-copilot");
  });

  test("an unmeasured host reads as unknown rather than as the nearest guess", () => {
    assert.equal(harnessFor("some-other-agent"), undefined);
    assert.equal(harnessFor(undefined), undefined);
    assert.equal(harnessFor("   "), undefined);
  });

  test("the smallest measured inline limit is the Copilot CLI offload threshold", () => {
    // 20 KiB, per harness-portability break 1. If a tighter host is ever
    // measured this must move with it, which is the point of computing it.
    assert.equal(smallestInlineOutputBytes(), 20_480);
  });

  test("an unmeasured limit is absent, never zero and never a pretend ceiling", () => {
    // THE HOST NOBODY HAS CLIMBED A LADDER ON. Claude Code used to be this
    // case; a ladder settled it, so the absence has to be shown somewhere it
    // is still true rather than quietly deleted.
    const vscode = HARNESSES.find((h) => h.id === "vscode-copilot");
    assert.ok(vscode !== undefined);
    assert.equal(vscode.limits.inlineOutputBytes, undefined, "absent means nobody measured it");
    const cli = HARNESSES.find((h) => h.id === "copilot-cli");
    assert.equal(cli?.limits.stopBlockCeiling, 8, "the CLI overrides the stop hook after eight blocks");
  });

  test("a host somebody climbed a ladder on carries the figure it settled at", () => {
    const claude = HARNESSES.find((h) => h.id === "claude-code");
    assert.ok(claude !== undefined);
    assert.equal(claude.limits.inlineOutputBytes, 50_000, "the largest payload that arrived whole");
  });
});
