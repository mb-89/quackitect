// THE READ PROOF: the agent's proofs are EARNED BY READING. se_file_read
// credits as it serves; the pull serves one document and credits it once
// its tail comes back. Checkboxes stay the person's — one check per doc
// VERSION. An edited doc unchecks itself and drops the agent's credit alike.
import { strict as assert } from "node:assert";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { pulledFor, scanGuidance } from "../engine/pull.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { buildServer } from "../engine/tools.ts";
import { bootedServer, call, checkDocs, craftDocs, freshRoot, GUIDANCE, readOne } from "./helpers.ts";

// THREE HOMES, NOT ONE (owner ruling 2026-07-29). voice.md is about HOW YOU
// TALK. It had accumulated rules about writing SOFTWARE and building
// INTERFACES, and a reader looking for one had to sift the other two.
//
// The split is only half the ruling. A guidance nobody pulls is a guidance
// nobody reads: software and ux name the states they bind with applies_to,
// so the pull serves them THERE and nowhere else. voice is PROMOTED: the
// prompt layer carries it on every turn, so the pull skips it.
//
// THEY LEFT THE GUIDANCE ROOT (owner ruling 2026-08-06). A root doc is pulled
// into every packet, and neither of these binds a design-input step. The step
// that maps stakeholders was reading how to write code.
test("the guidance splits three ways, and every home reaches the reader", () => {
  const root = freshRoot();
  const s = new Session(root);
  // THE SELECTOR IS TESTED DIRECTLY, against a state NAMED rather than found.
  // Which states the drawn machine happens to carry is not this test's
  // subject, and a fixture missing one would fail it for the wrong reason.
  const docs = scanGuidance(root);
  const at = (id: string): string[] =>
    pulledFor(root, docs, s.machine, { id, kind: "work", tags: [] } as unknown as Parameters<typeof pulledFor>[3]).map((p) => p.path);
  const idle = at("front_desk");
  const work = at("build-steps");
  const craft = craftDocs();
  for (const home of craft) {
    assert.ok(!idle.includes(home), `${home} still rides every packet — it names its own states now`);
    assert.ok(work.includes(home), `${home} is not pulled where it binds — a guidance nobody pulls is a guidance nobody reads`);
  }
  assert.ok(!idle.includes(GUIDANCE.voice), "a promoted source must not also ride the wire");
  const read = (p: string): string => readFileSync(join(root, ...p.split("/")), "utf8");
  const voice = read(GUIDANCE.voice);
  const software = read(craft.find((p) => p.endsWith("software.md")) ?? "");
  const ux = read(craft.find((p) => p.endsWith("ux.md")) ?? "");
  // Each rule sits in exactly one home. Two copies is how they drift apart.
  assert.match(software, /Do not repeat \(DRY\)/, "DRY is a software rule");
  assert.match(software, /Comments and provenance/, "so is how you comment");
  assert.match(software, /Dated guidance/, "so is judging dated advice");
  assert.match(ux, /Nothing ever hangs/, "the interface rule the owner added leads the UX home");
  assert.match(ux, /NEVER BLOCK THE PROCESS THAT DRAWS THE INTERFACE/, "including the half that actually bites");
  assert.match(ux, /ONE SURFACE NEVER RESETS ANOTHER/, "and the place rules");
  for (const moved of [/Do not repeat \(DRY\)/, /Comments & provenance/, /### Visual design/, /### Figures/]) {
    assert.ok(!moved.test(voice), `voice.md kept ${String(moved)} — it belongs to a sibling now`);
  }
  // What voice.md is FOR stays in it.
  assert.match(voice, /### Sentences/);
  assert.match(voice, /### Answered questions/);
  assert.match(voice, /The sycophancy guard/);
});

test("a check pins the VERSION: editing the doc unchecks it and the gate asks again", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.advance();
  await s.advance();
  checkDocs(s);
  await s.advance();
  await s.advance();
  await s.advance();
  assert.deepEqual(s.active(), ["front_desk"]);
  // THE DOOR DEMANDS A PERSON'S READING. Since software and ux left the
  // guidance root, a door that demands nothing is vacuously ready and can
  // never go stale, so it would prove nothing here.
  //
  // IT USED TO BE THE DESK, reached from the removed hub. The walk stands ON
  // the desk now, so the door has to be one ahead of it. Measured on the live
  // machine: `retro` and `overhaul` are the two that demand one.
  const door = s.machine.states.find((x) => x.id === "retro")!;
  const docs = s.pulled(s.machine, door).map((p) => p.path);
  assert.ok(docs.length > 0, "the door pulls guidance, or there is nothing to pin");
  for (const d of docs) s.humanCheck(d);
  const doc = docs[0];
  assert.equal(s.entryReadyHuman(s.machine, door), true, "all pulled docs checked — entry ready");
  // The owner edits it mid-session: the pinned hash no longer matches.
  appendFileSync(join(root, ...doc.split("/")), "\nEdited mid-session.\n");
  assert.equal(s.entryReadyHuman(s.machine, door), false, "the edited doc unchecked itself");
  await assert.rejects(
    () => s.advance("retro"),
    (e) => (e as { clause?: string }).clause === "SE-C-112",
  );
  // One fresh check of the NEW version and the walk flows again.
  s.humanCheck(doc);
  await s.advance("retro");
  assert.deepEqual(s.active(), ["retro"]);
});

// THE WRITTEN HANDOVER IS GONE (owner ruling 2026-08-07). It was demanded at
// the `end` state, and sessions do not end there — they get killed, so the
// gate almost never fired. The owner put it plainly: they kill the session, so
// there was never a handover. Boot DERIVES the briefing from the call log now
// and rides it on the banner, which costs no document and no proof.
test("a left-behind handover file is neither read nor destroyed — it is simply ignored", async () => {
  const root = freshRoot();
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(join(root, ".se", "HANDOVER.md"), "# Handover\n\nfrom the old world.\n", "utf8");
  const server = buildServer(root);
  await call(server, "se_pull");
  const served: string[] = [];
  for (let j = 0; j < 40; j++) {
    const doc = await readOne(server);
    if (doc === null) break;
    served.push(doc.path);
  }
  assert.ok(!served.includes(".se/HANDOVER.md"), `the handover is not part of the reading any more: ${served.join(", ")}`);
  // NOT DESTROYED EITHER. Deleting a file the engine no longer claims to
  // manage would be the engine reaching outside its own rules.
  assert.equal(existsSync(join(root, ".se", "HANDOVER.md")), true, "left alone, not consumed");
});

test("end opens with no handover written, because nobody writes one now", async () => {
  const server = await bootedServer(freshRoot());
  // end is one of the desk's offered doors, so the choice form answers it.
  const out = await call(server, "se_pull", { form: { choice: "end" } });
  assert.equal(out.isError, false, JSON.stringify(out.body));
  assert.equal(out.body.refusal, undefined, "the way out is no longer gated on a file");
  // TAKING THE DOOR AIMS THE WALK; the reading owed on the way is answered
  // before it arrives. The desk absorbed the removed hub's guidance, so it
  // carries a document of its own and that comes first.
  for (let j = 0; j < 40; j++) {
    if ((await readOne(server)) === null) break;
  }
  const landed = await call(server, "se_pull");
  assert.deepEqual(landed.body.where, ["end"]);
});

test("an edited doc drops the agent's credit: the pull asks for the reading again", async () => {
  const root = freshRoot();
  // A DOC THAT APPLIES EVERYWHERE, written for this case. The law under test
  // is that a DEMANDED doc going stale is demanded again, and since software
  // and ux left the guidance root nothing else is demanded at every door.
  writeFileSync(
    join(root, "guidance", "method", "always.md"),
    "---\nid: always\napplies: always\nstatement: A document every state pulls.\n---\n\nThe body every door demands.\n",
    "utf8",
  );
  const server = await bootedServer(root);
  // The boot reading stands credited; the owner edits a pulled doc.
  appendFileSync(join(root, "guidance", "method", "always.md"), "\nEdited mid-session.\n");
  const again = await call(server, "se_pull", { form: { choice: "expeditions" } });
  assert.equal(again.body.pull, "read", "a stale credit is no credit — the doc is owed again");
  for (let j = 0; j < 40; j++) {
    if ((await readOne(server)) === null) break;
  }
  // Proving the last document already moves the walk, so the gate being
  // DISCHARGED is what this case is about. A further pull with no aim left
  // comes home to the front desk, which is the router's business.
  const ok = await call(server, "se_pull");
  assert.notEqual(ok.body.pull, "read", `re-read, so the gate opened: ${JSON.stringify(ok.body)}`);
});

test("se_file_read credits too: reading the docs by hand carries the walk unaided", async () => {
  const root = freshRoot();
  const session = new Session(root);
  const server = buildServer(root, session);
  session.setTarget("front_desk"); // the person's aim
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
  assert.ok((walked.body.where as string[]).includes("front_desk"), "buffered credits carried the boot walk to idle");
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
  second.setTarget("front_desk");
  const owed = await call(secondServer, "se_pull");
  assert.equal(owed.body.pull, "read", "a fresh session proves the reading itself, inheriting nothing");
});

test("the mirror renders per-doc checkboxes and never locks reading itself", async () => {
  const root = freshRoot();
  const s = new Session(root);
  await s.advance();
  await s.advance(); // at boot/read_contract
  const html = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.ok(html.includes("docheck"), "checkboxes are served");
  assert.ok(!html.includes('class="primary confirm"'), "the old one-click confirm is gone");
  // The mirror's SE_DATA carries checked per pulled doc — the human ledger.
  assert.match(html, /"checked":\s*false/);
  const here = (s.packet() as { states: { pulled?: { path: string }[] }[] }).states[0]?.pulled?.[0]?.path;
  assert.ok(here !== undefined, "the state pulls a doc to check");
  s.humanCheck(here);
  const after = renderMirror({ session: s, root, lastPacket: undefined, mode: "manual" });
  assert.match(after, /"checked":\s*true/);
});

test("the pill turns green from the machine: the agent's reading records its proof — checkboxes stay human-only", async () => {
  const root = freshRoot();
  // WHAT read_contract OWES IS ITS TAG-PULLED GUIDANCE. The contract, the
  // walk, the lane and the voice went to the prompt layer, and the handover
  // was retired outright (owner ruling 2026-08-07) — what remains is the boot
  // method reading, demanded by tag rather than named on the state.
  const session = new Session(root);
  const server = buildServer(root, session);
  // Stand INSIDE boot so read_contract is peekable — the mirror peeks the
  // machine on screen, and that is boot while the walk is in it.
  await session.advance();
  await session.advance();
  // PREFIXED, because active() names states by their full path. Asserting the
  // bare id here passed for free and proved nothing — caught 2026-08-07.
  assert.ok(session.active().includes("boot/read_contract"), `standing where the reading is owed: ${JSON.stringify(session.active())}`);
  for (let j = 0; j < 40; j++) {
    if ((await readOne(server)) === null) break;
  }
  // Proving the last document walks the machine OUT of read_contract, so the
  // green is read from the gate having let it through.
  assert.ok(
    !session.active().includes("boot/read_contract"),
    `the agent's reading is the pill's green: ${JSON.stringify(session.active())}`,
  );
  // The human ledger is untouched: nothing checked, boxes stay empty.
  assert.deepEqual((session.packet() as { human_checked: string[] }).human_checked, []);
  // The version-pinning half moved out rather than away: "an edited doc drops
  // the agent's credit" still guards it, against the root guidance the pull
  // demands. Asserting it here as well would be the same check twice.
});

test("THE HANDOVER RULE: the human walks boot on checkboxes, raises the slider — the agent owes the same reading", async () => {
  const root = freshRoot();
  const session = new Session(root);
  session.setAutonomy(0); // manual start
  const server = buildServer(root, session);
  // The human drives: checks the boot docs, walks through read_contract.
  await session.advance();
  await session.advance();
  checkDocs(session);
  await session.advance();
  assert.deepEqual(session.active(), ["boot/prepare_desk"]);
  // The packet tells the agent what the session has checked.
  const info = session.packet() as { human_checked: string[] };
  assert.ok(info.human_checked.includes(GUIDANCE.bootMethod));
  // The slider rises; the agent pulls — but its head holds none of it, so
  // the machine demands the same reading before it walks anywhere.
  session.setAutonomy(0.6);
  session.setTarget("front_desk"); // the person's aim
  const owed = await call(server, "se_pull");
  assert.equal(owed.body.pull, "read", "their checkmark is not the agent's reading");
  const served: string[] = [];
  for (let j = 0; j < 40; j++) {
    const doc = await readOne(server);
    if (doc === null) break;
    served.push(doc.path);
  }
  // THE PROOF IS THE DOC THE PERSON CHECKED. It comes back to the agent, which
  // is the whole rule: a checkmark is theirs and never the agent's reading.
  //
  // IT USED TO NAME A CRAFT DOC. Those are demanded at a craft door, and the
  // route to the desk no longer passes one — the hub that did is gone. Naming a
  // doc this route never owes would have asserted the wrong thing.
  assert.ok(served.includes(GUIDANCE.bootMethod), `the same list is owed: ${served.join(", ")}`);
  // Proving the last document already moves the walk, so what matters here
  // is that the reading gate is discharged — not which door comes next.
  const landed = await call(server, "se_pull");
  assert.notEqual(landed.body.pull, "read", `the agent's own reading discharged it: ${JSON.stringify(landed.body)}`);
});
