// THE BACKLOG IS ONE PLACE, FED BY TWO SOURCES.
//
// A pool token lives on trunk, as a corpus node. A piece of work a hand opened
// with nowhere to put it lives in the private folder, as a work file. Both sit
// at the backlog and the reader wants ONE list.
//
// THREE WAYS THIS HAS GONE WRONG, and each is a case below.
//
// THE POOL WAS INVISIBLE. The editor read the vault alone, so 154 pool tokens
// stood at the backlog and the heading showed one.
//
// THE POOL WAS COUNTED TWICE. The vault indexes the pool folder as well, so
// admitting both copies would double every row.
//
// THE HAND-OPENED WORK WAS DROPPED. Reading the pool alone loses whatever the
// person filed there from the bar.
//
// see dsp-the-bucket-editor.md#the-editor-is-the-database
import { strict as assert } from "node:assert";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { describe, test } from "node:test";
import { mintToken } from "../engine/pool.ts";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";
import { penWork } from "../engine/workpen.ts";
import { BACKLOG, type MintDemand, mintBothSources, readAllWork } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const NOW = "2026-08-27T10:00:00Z";

function byHand(statement: string): MintDemand {
  return { source: "hand", source_ref: `hand/${statement}`, step: "", statement };
}

/** A root holding one pool token and one hand-opened backlog item. */
function stocked(): string {
  const root = freshRoot();
  mkdirSync(join(root, "spec", "trace", "work-token"), { recursive: true });
  mintToken(root, {
    statement: "The launcher and the server disagree about seizing a held address",
    readyWhen: "ready when somebody rules on which of the two is right",
    source: "note-000000000000",
    noteText: "",
  });
  mintBothSources(root, BACKLOG, [byHand("Sweep the whole tree")], NOW);
  return root;
}

/** The count the card prints beside a group heading, or -1 if it draws none. */
function groupCount(html: string, group: string): number {
  for (const line of html.split("\n")) {
    if (!line.includes(`data-group="${group}"`)) continue;
    const c = line.match(/grp-count">(\d{1,6})</);
    if (c !== null) return Number(c[1]);
  }
  return -1;
}

describe("the backlog holds both sources, once each", () => {
  test("the store answers with the pool token and the hand-opened one together", () => {
    const root = stocked();

    const here = readAllWork(root).items.filter((i) => i.place === BACKLOG);

    assert.equal(here.length, 2, `both sources, and only once each — got ${here.map((i) => i.id).join(", ")}`);
    assert.ok(
      here.some((i) => i.id.startsWith("wt-")),
      "the pool token is there",
    );
    assert.ok(
      here.some((i) => i.id.startsWith("wk-")),
      "and so is the one a hand opened",
    );
  });

  test("the drawn source carries the pool and nothing the store already has a file for", () => {
    const root = stocked();

    const drawnAtBacklog = penWork(root).filter((i) => i.place === BACKLOG);

    assert.equal(drawnAtBacklog.length, 1, "the pool token alone is drawn");
    assert.ok(drawnAtBacklog[0].id.startsWith("wt-"), "and it is the pool one");
  });

  test("the editor's backlog heading counts every piece of work standing there", async () => {
    const root = stocked();
    await warmVault(root);

    const html = workCard(root, "");

    assert.equal(groupCount(html, BACKLOG), 2, "the heading says two, which is what stands there");
  });

  // THE POOL'S CORPUS ROW IS THE DUPLICATE THAT NEARLY SHIPPED. The vault
  // indexes the pool folder, so the same token arrives twice — once as a
  // corpus node and once through the drawn source.
  test("a pool token appears once in the editor, not once per source", async () => {
    const root = stocked();
    await warmVault(root);

    const html = workCard(root, "");
    const left = html.slice(0, html.indexOf('data-side="right"'));
    const hits = left.split("The launcher and the server disagree").length - 1;

    assert.equal(hits, 1, "one row for one token");
  });

  test("the backlog ships closed, because it buries the page otherwise", async () => {
    const root = stocked();
    await warmVault(root);

    const html = workCard(root, "");
    const heading = html.split("\n").find((l) => l.includes(`data-group="${BACKLOG}"`)) ?? "";

    assert.match(heading, /class="tbl-group shut"/, "the backlog group is folded on arrival");
  });
});
