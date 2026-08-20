// what the mirror shows and how the agent points at it
//
// SMALL FILES ON PURPOSE (owner ruling, 2026-07-30). A test file is the
// only unit that reaches a second core, so themes get their own file and
// the suite uses the machine it runs on. See guidance/software.md.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { call, freshRoot } from "./helpers.ts";

// Concurrent: every case builds its own root and touches no global.
describe("panel", { concurrency: true }, () => {
  test("se_panel is legal anywhere — and honestly not-configured without a mirror", async () => {
    const server = buildServer(freshRoot());
    const r = await call(server, "se_panel", {});
    assert.equal(r.isError, true);
    assert.equal(r.body.clause, "SE-C-106", JSON.stringify(r.body));
  });

  test("se_panel ping: the agent points and every open window is told", async () => {
    const root = freshRoot();
    const session = new Session(root);
    session.mirrorUrl = "http://localhost:0/"; // a listening mirror, as far as the tool checks
    const server = buildServer(root, session);
    const r = await call(server, "se_panel", { ping: "log", note: "look at the feed" });
    assert.equal(r.isError, false, JSON.stringify(r.body));
    assert.equal(r.body.pinged, "log");
    assert.deepEqual(session.ping, { target: "log", note: "look at the feed", seq: 1 });
    // A second ping bumps the seq — the page pulses on every new one.
    await call(server, "se_panel", { ping: "gate-kickoff" });
    assert.equal(session.ping?.seq, 2);
    assert.equal(session.ping?.target, "gate-kickoff");
    // An empty target refuses — pointing at nothing is a mistake, not a pulse.
    const empty = await call(server, "se_panel", { ping: "  " });
    assert.equal(empty.isError, true);
  });

  test("the mirror renders ONLY the current machine, with breadcrumbs", async () => {
    const { Session } = await import("../engine/session.ts");
    const { renderMirror } = await import("../engine/render.ts");
    const root = freshRoot();
    const s = new Session(root);
    // At main/start: the main canvas only.
    let html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
    assert.ok(html.includes(`>idle</text>`));
    assert.ok(!html.includes(`>read_contract</text>`), "sub-machine states are NOT drawn while in main");
    // Step into boot: the boot canvas only, breadcrumb main › boot.
    await s.advance();
    html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
    assert.ok(html.includes(`>read_contract</text>`));
    assert.ok(!html.includes(`>idle</text>`), "main states are NOT drawn while in the sub");
    assert.ok(html.includes('class="here">boot'), "breadcrumb marks the machine the walk is in");
    assert.ok(html.includes('data-detail="state:read_contract"'), "states are clickable for details");
    assert.ok(html.includes('class="expand"'), "widgets carry expand buttons");
  });

  test("the view is independent of the walk: browse boot while standing at main/start", async () => {
    const { Session } = await import("../engine/session.ts");
    const { renderMirror } = await import("../engine/render.ts");
    const root = freshRoot();
    const s = new Session(root); // walk at main/start
    const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, undefined, "boot");
    assert.ok(html.includes(`>read_contract</text>`), "viewer entered boot");
    assert.ok(!html.includes("state active"), "no live highlight — the walk is not here");
    assert.ok(html.includes(`href="/?view=main"`), "breadcrumb navigates back out");
    // and on main, the sub state is drawn with a double border + crumb menu lists it
    const main = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
    assert.ok(main.includes(`data-sub="boot"`), "sub-machine state is double-click enterable");
    assert.ok(main.includes("state inner"), "double border drawn");
    assert.ok(main.includes("crumb-menu"), "breadcrumb arrow lists selectable sub-machines");
  });

  test("every script block the mirror serves is valid JavaScript — a broken block kills all handlers", async () => {
    const { Session } = await import("../engine/session.ts");
    const { renderMirror } = await import("../engine/render.ts");
    const root = freshRoot();
    const s = new Session(root);
    const pages = [
      renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }),
      renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, undefined, "boot"),
      renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, "machine"),
      renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" }, "details"),
    ];
    for (const [p, page] of pages.entries()) {
      const blocks = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
      assert.ok(blocks.length >= 1, `page ${p} serves scripts`);
      for (const [b, code] of blocks.entries()) {
        assert.doesNotThrow(() => new Function(code), `page ${p} script block ${b} must parse`);
      }
    }
  });
});
