// THE SERVED PAGE IS THE EVIDENCE, and every other check in this area reads
// the source instead. The editor was reported missing three times while every
// unit test passed, because the faults were between the parts.
//
// TWO FAULTS THIS FILE WOULD HAVE CAUGHT.
//
// The card refused to read work whenever no record was bound, while the mint
// wrote to that very home. The served widget said "no record is open" with
// eleven pieces of work on disk.
//
// The opener looked up a card wrapper the sidebar does not draw, so pressing a
// bucket found null and returned in silence.
//
// see ux.md#a-drawing-change-is-not-done-until-its-output-is-measured
import { strict as assert } from "node:assert";
import type { AddressInfo } from "node:net";
import { describe, test } from "node:test";
import { CallLog } from "../engine/calllog.ts";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { startMirror } from "../engine/mirror.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";
import { warmVault } from "../engine/vault.ts";
import { BACKLOG, type MintDemand, mint, readAllWork, readOne, settle, take } from "../engine/workstore.ts";
import { checkDocs, freshRoot, gitInit } from "./helpers.ts";

const NOW = "2026-01-01T00:00:00Z";

function demand(statement: string): MintDemand {
  return { source: "evidence", source_ref: "docs/a.md", step: "", statement, difficulty: "mechanical" };
}

interface Served {
  session: Session;
  server: ReturnType<typeof startMirror>;
  port: number;
  home: string;
  id: string;
}

/** A mirror serving a session with one iteration bound and one piece of work in
 *  it — the state a reader is actually in when they open the editor. */
async function served(): Promise<Served> {
  const root = freshRoot();
  gitInit(root, true);
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const it = String(session.iterationSeed("serve the editor", "the reader sees the work").seeded);
  pinIteration(root, itFind(root, it), "major");
  session.iterationOpen(it);
  const home = session.workHome();
  const report = mint(home, `iterations/${it}/write-requirements`, [demand("wire the pill")], NOW);
  // THE VAULT HAS TO BE WARM. The editor reads the same index the database
  // does, and a cold one draws no rows — which would test the warming message
  // rather than the editor.
  await warmVault(root);
  const server = startMirror({ session, root, port: 0, log: new CallLog(seDir(root)), mode: "agent" });
  await new Promise((r) => server.on("listening", r));
  return { session, server, port: (server.address() as AddressInfo).port, home, id: report.minted[0].id };
}

function get(port: number, path: string): Promise<string> {
  return fetch(`http://127.0.0.1:${port}${path}`).then((r) => r.text());
}

describe("the editor a reader actually receives", () => {
  test("the served editor lists the work, in two database panes", async () => {
    const s = await served();
    try {
      const html = await get(s.port, "/widget/work");

      assert.match(html, /wire the pill/, "the piece of work is on the page");
      assert.match(html, /work-panes/, "and it is drawn in two panes");
      assert.equal((html.match(/class="bs-block"/g) ?? []).length, 2, "each one a database block");
    } finally {
      s.server.close();
    }
  });

  test("a served row carries the note it came from, so it can be dragged", async () => {
    const s = await served();
    try {
      const html = await get(s.port, "/widget/work");

      assert.match(html, /<tr data-path="[^"]*" draggable="true">/, "the row names its own file");
    } finally {
      s.server.close();
    }
  });

  // THE OPENER NAMES AN ELEMENT, and only the served page says whether that
  // element is there. Reported three times as the editor being missing.
  // see dsp-the-bucket-editor.md#a-pill-opens-the-editor
  test("the element the opener looks up is on the served page", async () => {
    const s = await served();
    try {
      const html = await get(s.port, "/widget/work");
      const found = /function openEditor\([^)]*\)[\s\S]*?getElementById\("([^"]+)"\)/.exec(html);

      assert.ok(found !== null, "the opener ships and looks an element up");
      assert.match(html, new RegExp(`id="${String(found?.[1])}"`), "and the page draws it");
    } finally {
      s.server.close();
    }
  });

  // THE MACHINE PAGE CARRIES THE EDITOR, in one document. A row is dragged FROM
  // the editor ONTO a state, and no drop crosses two documents — so an editor on
  // its own page could not receive that gesture at all.
  //
  // MEASURED BEFORE THIS: /widget/machine drew every bucket and held no dock,
  // so pressing a bucket looked one up, found null and did nothing.
  //
  // AND IT CARRIES THE DATABASE'S OWN ASSETS. The editor IS two database cards,
  // so a page without that stylesheet draws them at the wrong height, and one
  // without that script leaves sort and properties opening nothing. Measured:
  // the machine page had neither.
  test("the machine page carries the editor, which is what the drag needs", async () => {
    const s = await served();
    try {
      const html = await get(s.port, "/widget/machine");

      assert.match(html, /<svg/, "the machine is drawn here");
      assert.match(html, /id="work-dock"/, "and the editor is in the same document");
      assert.match(html, /work-panes/, "with both its panes");
      assert.match(html, /\.bs-block/, "the database's stylesheet rides along");
      assert.match(html, /bs-code-toggle/, "and its own chrome is what draws");
    } finally {
      s.server.close();
    }
  });
});

// THE PAYLOAD LEG. The acts had a check on the client string and a check on the
// session method, and nothing at all on the route between them.
// see ux.md#fix-the-whole-wire
describe("the work route the editor posts to", () => {
  function act(port: number, body: unknown): Promise<{ ok?: boolean; error?: string }> {
    return fetch(`http://127.0.0.1:${port}/work/act`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json() as Promise<{ ok?: boolean; error?: string }>);
  }

  test("take marks the item and records what the hand said", async () => {
    const s = await served();
    try {
      const answer = await act(s.port, { work: s.id, act: "take", comment: "starting on it" });

      assert.equal(answer.ok, true);
      assert.equal(readOne(s.home, s.id)?.status, "in_work");
      assert.equal(readOne(s.home, s.id)?.took_comment, "starting on it");
    } finally {
      s.server.close();
    }
  });

  test("settle closes it and the reason lands on the item", async () => {
    const s = await served();
    try {
      await act(s.port, { work: s.id, act: "take", comment: "starting on it" });
      const answer = await act(s.port, { work: s.id, act: "settle", status: "done", comment: "the pill draws" });

      assert.equal(answer.ok, true);
      assert.equal(readOne(s.home, s.id)?.status, "done");
      assert.equal(readOne(s.home, s.id)?.reason, "the pill draws", "on the item, not only in a log");
    } finally {
      s.server.close();
    }
  });

  test("restate renames it without closing or moving it", async () => {
    const s = await served();
    try {
      const answer = await act(s.port, { work: s.id, act: "restate", statement: "wire the pill, and its click" });

      assert.equal(answer.ok, true);
      assert.equal(readOne(s.home, s.id)?.statement, "wire the pill, and its click");
      assert.equal(readOne(s.home, s.id)?.status, "open", "renaming is not finishing");
    } finally {
      s.server.close();
    }
  });

  // THE ENTRY CONTROL'S OWN WIRE. The panel declares the control, the client
  // reads the line and posts it, and this is the leg between them. Reported
  // from the surface as an error message with the work never appearing.
  test("the entry control's payload mints into the backlog", async () => {
    const s = await served();
    try {
      const answer = await fetch(`http://127.0.0.1:${String(s.port)}/work/mint`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ place: "backlog", slot: "pending", statement: "added from the controls" }),
      }).then((r) => r.json() as Promise<{ ok?: boolean; error?: string; minted?: number }>);

      assert.equal(answer.ok, true, `the mint went through — got ${answer.error ?? "no error"}`);
      assert.equal(answer.minted, 1, "one piece of work");

      const { items } = readAllWork(s.session.machineRoot());
      const hit = items.find((i) => i.statement === "added from the controls");
      assert.ok(hit !== undefined, "and it is readable from the sources the editor reads");
      assert.equal(hit.place, BACKLOG, "in the backlog, because nobody has placed it yet");
    } finally {
      s.server.close();
    }
  });

  // A REFUSED ACT SAYS WHY. A row snapping back with no reason is the failure
  // the client's own error path was written to avoid, and it needs the route to
  // send something for it to show.
  test("an act with no comment is refused, and the refusal carries its reason", async () => {
    const s = await served();
    try {
      const answer = await act(s.port, { work: s.id, act: "take", comment: "   " });

      assert.equal(answer.ok, false);
      assert.match(String(answer.error), /comment/, "and it says what was missing");
    } finally {
      s.server.close();
    }
  });
});

// THE MIDDLE LEG OF THE LIVE WIRE. The store's signal moves and the client
// redraws on a change — both ends were checked. Whether the SERVED payload
// carries the signal at all was checked nowhere, which is the shape ux.md
// names: two green halves are not a green wire.
// see dsp-mirror-render.md#the-pills-are-pushed
describe("the payload that carries the live signal", () => {
  function alive(port: number): Promise<{ work?: number }> {
    return fetch(`http://127.0.0.1:${port}/api/alive`).then((r) => r.json() as Promise<{ work?: number }>);
  }

  test("the served payload carries the work signal", async () => {
    const s = await served();
    try {
      const a = await alive(s.port);

      assert.equal(typeof a.work, "number", "the page has something to compare");
    } finally {
      s.server.close();
    }
  });

  test("finishing a piece of work moves the signal the page watches", async () => {
    const s = await served();
    try {
      const before = (await alive(s.port)).work;
      take(s.home, s.id, "the walker", "picking it up");
      settle(s.home, s.id, "done", { reason: "it is wired", now: NOW });

      assert.notEqual((await alive(s.port)).work, before, "so the bubbles redraw without a re-entry");
    } finally {
      s.server.close();
    }
  });
});
