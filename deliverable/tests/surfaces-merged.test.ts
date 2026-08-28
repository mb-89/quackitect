// see dsp-the-bucket-editor.md#sharing-a-document-is-a-plumbing-fact-and-must-not-become-a-ux-fact
//
// TWO CLAIMS, AND THEY PULL AGAINST EACH OTHER. The machine and the work
// editor must share ONE document, because no drop crosses two webviews. And
// they must NOT share a viewport, because to the person they are two editors.
//
// The lazy version satisfies the first and breaks the second: one transform on
// the whole document, because the document is one. That is what these cases
// exist to refuse.
import { strict as assert } from "node:assert";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadCards } from "../engine/cards.ts";
import { STYLE } from "../engine/renderstyle.ts";
import { warmVault } from "../engine/vault.ts";
import { workCard } from "../engine/work-card.ts";
import { type MintDemand, mint } from "../engine/workstore.ts";
import { freshRoot } from "./helpers.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const NOW = "2026-08-26T10:00:00Z";
const HERE = "iterations/i63/decompose";

function demand(name: string, extra: Partial<MintDemand> = {}): MintDemand {
  return { source: "step", source_ref: `meth.md#${name}`, step: name, statement: name, difficulty: "mechanical", ...extra };
}

function source(file: string): string {
  return readFileSync(join(REPO_ROOT, "deliverable", "engine", file), "utf8");
}

describe("the machine and the work editor share a document, not a viewport", { concurrency: true }, () => {
  test("both are cards in the one page", () => {
    const cards = loadCards(REPO_ROOT);
    const shows = cards.map((c) => c.widget);
    assert.ok(shows.includes("machine"), "the machine is a card");
    assert.ok(shows.includes("work"), "and so is the work editor");
  });

  test("the work card took the last number, so nothing renumbered under the reader's hand", () => {
    const cards = loadCards(REPO_ROOT);
    const work = cards.find((c) => c.widget === "work");
    assert.equal(work?.n, cards.length, "a card added anywhere else shifts every number after it");
  });

  // THE LAZY VERSION IS WHAT THIS REFUSES: one transform on the whole document.
  test("the zoom is applied to the machine's own svg, never to something both cards sit inside", () => {
    const client = source("renderclient-panel.ts");
    assert.match(client, /\.viewBox\.baseVal/, "the zoom moves the svg's own viewBox");
    for (const shared of ["document.body.style.transform", "document.body.style.zoom", '".cards").style.transform']) {
      assert.ok(!client.includes(shared), `nothing zooms ${shared}, which both cards would sit inside`);
    }
  });

  // THE EDITOR IS THE DATABASE NOW, so what it draws is the database's markup
  // rather than ours. What still belongs to THIS file is the merged-viewport
  // question: two surfaces in one document, each scrolling on its own.
  //
  // Everything about the panes themselves is in bucket-editor.test.ts.
  test("the work card scrolls in its own body and carries no transform", async () => {
    const root = freshRoot();
    mint(join(root, "spec", "iterations", "i-test"), HERE, [demand("a")], NOW);
    await warmVault(root);

    const html = workCard(root, "");

    assert.match(html, /class="widget-body work-panes"/, "the editor's own body holds both panes");
    assert.equal((html.match(/class="work-pane"/g) ?? []).length, 2, "and each pane scrolls on its own");
    assert.ok(!/transform:/.test(html), "a transform here would be the merged-viewport failure wearing a card's clothes");
  });

  // EACH PANE SCROLLS ON ITS OWN. One scroller around both would move the pane a
  // reader was not touching, which is the same failure one level down.
  test("each pane scrolls on its own, so dragging in one never moves the other", () => {
    assert.match(STYLE, /\.work-pane \{[^}]*overflow: auto/, "the pane owns its scrolling");
    assert.match(STYLE, /\.work-panes \{[^}]*display: flex/, "and the two sit side by side");
  });

  // THE DOCK IS LEFT OF THE DRAWING (owner), and the row it sits in is what puts
  // it there. A column would put it underneath.
  // THE EDITOR IS LEFT OF THE DRAWING, with the seam between them (owner). It
  // is UPRIGHT: it runs top to bottom and drags left and right.
  test("the editor sits left of the drawing, and their seam is upright", () => {
    assert.match(STYLE, /#work-dock \{[^}]*display: none/, "folded until asked for");
    assert.match(STYLE, /#work-dock:not\(\[hidden\]\) \{[^}]*display: flex/, "and it opens");
    assert.match(STYLE, /#work-dock \{[^}]*width: 46vw/, "it takes a width, because the split is left to right");
    assert.match(STYLE, /\.work-seam \{[^}]*cursor: col-resize/, "every seam here drags across");
    assert.match(STYLE, /\.machine-lane \{[^}]*flex: 1 1 0/, "the drawing takes what is left");
  });

  // A COLD VAULT IS NOT AN EMPTY ONE. Drawing the panes before the index is read
  // would say no work matched, over work nobody had looked for yet.
  test("a vault that has not been read says so rather than claiming nothing matched", () => {
    const html = workCard(mkdtempSync(join(tmpdir(), "se-cold-")), "");

    assert.match(html, /vault is warming/);
    assert.doesNotMatch(html, /no rows match/, "an unread index is not an answer about the work");
  });
});
