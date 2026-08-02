// THE READ PROOF: the agent's proofs are EARNED BY READING. se_file_read
// credits as it serves; the pull serves one document and credits it once
// its tail comes back. Checkboxes stay the person's — one check per doc
// VERSION. An edited doc unchecks itself and drops the agent's credit alike.
import { strict as assert } from "node:assert";
import { appendFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { readFileSync } from "node:fs";
import { bootedServer, call, checkDocs, freshRoot, READ_DOCS, readOne } from "./helpers.ts";

// THREE HOMES, NOT ONE (owner ruling 2026-07-29). voice.md is about HOW YOU
// TALK. It had accumulated rules about writing SOFTWARE and building
// INTERFACES, and a reader looking for one had to sift the other two.
//
// The split is only half the ruling. A guidance nobody pulls is a guidance
// nobody reads, so each home sits directly in project/guidance/ where the
// pull serves it always.
test("the guidance splits three ways, and every home is pulled", () => {
  const root = freshRoot();
  const s = new Session(root);
  const idle = s.machine.states.find((x) => x.id === "idle")!;
  const pulled = s.pulled(s.machine, idle).map((p) => p.path);
  for (const home of ["project/guidance/voice.md", "project/guidance/software.md", "project/guidance/ux.md"]) {
    assert.ok(pulled.includes(home), home + " is not pulled — a guidance nobody pulls is a guidance nobody reads");
    assert.ok(READ_DOCS.includes(home as (typeof READ_DOCS)[number]), home + " is pulled but the suite never proves reading it");
  }
  const read = (p: string): string => readFileSync(join(root, ...p.split("/")), "utf8");
  const voice = read("project/guidance/voice.md");
  const software = read("project/guidance/software.md");
  const ux = read("project/guidance/ux.md");
  // Each rule sits in exactly one home. Two copies is how they drift apart.
  assert.match(software, /Do not repeat \(DRY\)/, "DRY is a software rule");
  assert.match(software, /Comments and provenance/, "so is how you comment");
  assert.match(software, /Dated guidance/, "so is judging dated advice");
  assert.match(ux, /Nothing ever hangs/, "the interface rule the owner added leads the UX home");
  assert.match(ux, /NEVER BLOCK THE PROCESS THAT DRAWS THE INTERFACE/, "including the half that actually bites");
  assert.match(ux, /ONE SURFACE NEVER RESETS ANOTHER/, "and the place rules");
  for (const moved of [/Do not repeat \(DRY\)/, /Comments & provenance/, /### Visual design/, /### Figures/]) {
    assert.ok(!moved.test(voice), "voice.md kept " + String(moved) + " — it belongs to a sibling now");
  }
  // What voice.md is FOR stays in it.
  assert.match(voice, /### Sentences/);
  assert.match(voice, /### Answered questions/);
  assert.match(voice, /The sycophancy guard/);
});

test("a check pins the VERSION: editing the doc unchecks it and the gate asks again", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.advance(); await s.advance();
  checkDocs(s);
  await s.advance(); await s.advance(); await s.advance();
  assert.deepEqual(s.active(), ["idle"]);
  const idle = s.machine.states.find((x) => x.id === "expeditions")!;
  assert.equal(s.entryReadyHuman(s.machine, idle), true, "all pulled docs checked — entry ready");
  // The owner edits voice.md mid-session: the pinned hash no longer matches.
  appendFileSync(join(root, "project", "guidance", "voice.md"), "\nEdited mid-session.\n");
  assert.equal(s.entryReadyHuman(s.machine, idle), false, "the edited doc unchecked itself");
  await assert.rejects(() => s.advance("expeditions"), (e) => (e as { clause?: string }).clause === "SE-C-112");
  // One fresh check of the NEW version and the walk flows again.
  s.humanCheck("project/guidance/voice.md");
  await s.advance("expeditions");
  assert.deepEqual(s.active(), ["expeditions/start"]);
});

test("THE HANDOVER: a left-behind .se/HANDOVER.md joins the reading, and is consumed by the walk", async () => {
  const root = freshRoot();
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "HANDOVER.md"), "# Handover\n\nOpen threads for the next session.\n", "utf8");
  const server = buildServer(root);
  const owed = await call(server, "se_pull");
  assert.equal(owed.body.pull, "read", "the way in demands reading");
  // Drain the reading, collecting what the loop actually serves.
  const served: string[] = [];
  let last: Record<string, unknown> | undefined;
  for (let j = 0; j < 40; j++) {
    const doc = await readOne(server);
    if (doc === null) break;
    served.push(doc.path);
    last = doc.after;
  }
  assert.ok(served.includes(".se/HANDOVER.md"), `the handover rode the reading: ${served.join(", ")}`);
  // Proving the LAST document is the call that walked. Pulling again would
  // find the target cleared and offer doors instead.
  assert.equal(last?.pull, "do", JSON.stringify(last));
  // CONSUMED, NOT KEPT (owner ruling 2026-07-31): being read is what
  // destroys it. A handover that survives gets believed a second time.
  assert.equal(existsSync(join(root, ".se", "HANDOVER.md")), false, "the handover did not survive the reading room");
});

test("THE HANDOVER: the way out writes the next one — end waits without one from this session", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  // Nothing was written for whoever comes next, so the door does not open —
  // and the pull SAYS so, refusal riding the answer with the remedy. end is
  // one of idle's offered doors, so the choice form answers it.
  const refused = await call(server, "se_pull", { form: { choice: "end" } });
  assert.equal(refused.isError, false, "a blocked walk is an instruction, not an error");
  const ref = refused.body.refusal as { expected?: string; got?: string } | undefined;
  assert.ok(ref !== undefined, JSON.stringify(refused.body));
  assert.match(String(ref.expected), /handover written THIS session/);
  assert.match(String(ref.got), /no \.se\/HANDOVER\.md/);
  // Write one and the way out opens.
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "HANDOVER.md"), "# Handover\n\nWhat the next session cannot read from the repo.\n", "utf8");
  const ok = await call(server, "se_pull");
  assert.equal(ok.isError, false, JSON.stringify(ok.body));
  assert.deepEqual(ok.body.where, ["end"]);
});

test("an edited doc drops the agent's credit: the pull asks for the reading again", async () => {
  const root = freshRoot();
  const server = await bootedServer(root);
  // The boot reading stands credited; the owner edits a pulled doc.
  appendFileSync(join(root, "project", "guidance", "contract.md"), "\nEdited mid-session.\n");
  const again = await call(server, "se_pull", { form: { choice: "expeditions" } });
  assert.equal(again.body.pull, "read", "a stale credit is no credit — the doc is owed again");
  for (let j = 0; j < 40; j++) {
    if ((await readOne(server)) === null) break;
  }
  const ok = await call(server, "se_pull");
  assert.notEqual(ok.body.pull, "read", `re-read, so the gate opened: ${JSON.stringify(ok.body)}`);
  assert.deepEqual(ok.body.where, ["expeditions/start"]);
});

test("se_file_read credits too: reading the docs by hand carries the walk unaided", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  session.setTarget("idle"); // the person's aim
  assert.equal((await call(server, "se_pull")).body.pull, "read");
  // Earn the credits through plain lane reads of the engine's OWN list —
  // a windowed read still carries the whole file's CAS hash, so one line
  // is enough. (READ_DOCS is only the boot core; the way also pulls the
  // method cards, and the engine knows that better than any constant.)
  for (const path of (session.packet() as { route_reads: string[] }).route_reads) {
    const rr = await call(server, "se_file_read", { path, offset: 1, limit: 1 });
    assert.equal(rr.isError, false, JSON.stringify(rr.body));
  }
  const walked = await call(server, "se_pull");
  assert.equal(walked.body.pull, "do", JSON.stringify(walked.body));
  assert.ok((walked.body.where as string[]).includes("idle"), "buffered credits carried the boot walk to idle");
});

// BOOT IS THE READING ROOM, AND IT CLEARS THE BUFFER ON THE WAY BACK IN.
//
// It used to clear on EVERY entry, which caught the one read that matters:
// the reading is handed over at start, so wiping it there made a single-call
// boot impossible. A first entry now keeps what start earned. Going BACK and
// walking boot again still earns its tokens afresh.
test("the reading buffer is per session: a second session earns it afresh", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);

  // First entry: one read of the reading file carries the whole boot walk
  // to the session's default target, the desk.
  await call(server, "se_file_read", { path: ".se/reading.md" });
  const first = await call(server, "se_pull");
  assert.equal(first.body.pull, "do", JSON.stringify(first.body));
  assert.deepEqual(session.active(), ["front_desk"]);

  // A NEW SESSION over the SAME root. The files on disk are unchanged and
  // were read once already, and it still owes every one of them.
  //
  // THIS USED TO RE-ENTER BOOT, driven by the person jumping the walk back to
  // start from the mirror. That move retired with the tick, so re-entry is no
  // longer reachable at all — and a test whose driver is gone proves nothing.
  // What survives is the property that mattered: a proof belongs to the
  // session that earned it. If a backwards move ever returns, re-entry is the
  // case to guard again.
  const second = new Session(root);
  const secondServer = buildServer(root, second);
  second.setTarget("idle");
  const owed = await call(secondServer, "se_pull");
  assert.equal(owed.body.pull, "read", "a fresh session proves the reading itself, inheriting nothing");
});

test("the mirror renders per-doc checkboxes and never locks reading itself", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.advance(); await s.advance(); // at boot/read_contract
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("docheck"), "checkboxes are served");
  assert.ok(!html.includes('class="primary confirm"'), "the old one-click confirm is gone");
  // The mirror's SE_DATA carries checked per pulled doc — the human ledger.
  assert.match(html, /"checked":\s*false/);
  s.humanCheck("project/guidance/voice.md");
  const after = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.match(after, /"checked":\s*true/);
});

test("the pill turns green from the machine: the agent's reading records its proof — checkboxes stay human-only", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  // Stand INSIDE boot so read_contract is peekable — the mirror peeks the
  // machine on screen, and that is boot while the walk is in it.
  await session.advance(); await session.advance();
  // THE DEMAND MOVED WITH THE PROMOTION. read_contract's own read list went
  // to the prompt layer, so what is still owed is the root guidance every
  // packet pulls — asked for on ENTERING prepare_idle.
  const beforeState = session.stateInfo("prepare_idle") as { entry: { read: { met: boolean } } };
  assert.equal(beforeState.entry.read.met, false, "no reading earned yet");
  for (let j = 0; j < 40; j++) {
    if ((await readOne(server)) === null) break;
  }
  // Proving the last document walks the machine OUT of read_contract, so the
  // green is read from the gate having let it through.
  assert.ok(!session.active().includes("read_contract"), `the agent's reading is the pill's green: ${JSON.stringify(session.active())}`);
  // The human ledger is untouched: nothing checked, boxes stay empty.
  assert.deepEqual((session.packet() as { human_checked: string[] }).human_checked, []);
  // A version pins the proof: editing a doc drops it, the pill asks again.
  appendFileSync(join(root, "project", "guidance", "voice.md"), "\nEdited mid-session.\n");
  const edited = session.stateInfo("prepare_idle") as { entry: { read: { met: boolean } } };
  assert.equal(edited.entry.read.met, false, "an edited doc drops the agent's proof too");
});

test("THE HANDOVER RULE: the human walks boot on checkboxes, raises the slider — the agent owes the same reading", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(0); // manual start
  const server = buildServer(root, session);
  // The human drives: checks the boot docs, walks through read_contract.
  await session.advance(); await session.advance();
  checkDocs(session);
  await session.advance();
  assert.deepEqual(session.active(), ["boot/prepare_idle"]);
  // The packet tells the agent what the session has checked.
  const info = session.packet() as { human_checked: string[] };
  assert.ok(info.human_checked.includes("project/guidance/contract.md"));
  // The slider rises; the agent pulls — but its head holds none of it, so
  // the machine demands the same reading before it walks anywhere.
  session.setAutonomy(0.6);
  session.setTarget("idle"); // the person's aim
  const owed = await call(server, "se_pull");
  assert.equal(owed.body.pull, "read", "their checkmark is not the agent's reading");
  const served: string[] = [];
  for (let j = 0; j < 40; j++) {
    const doc = await readOne(server);
    if (doc === null) break;
    served.push(doc.path);
  }
  assert.ok(served.includes("project/guidance/contract.md"), `the same list is owed: ${served.join(", ")}`);
  // Proving the last document already moves the walk, so what matters here
  // is that the reading gate is discharged — not which door comes next.
  const landed = await call(server, "se_pull");
  assert.notEqual(landed.body.pull, "read", `the agent's own reading discharged it: ${JSON.stringify(landed.body)}`);
  assert.ok((landed.body.where as string[]).includes("idle"));
});
