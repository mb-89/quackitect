// i8d, red-first against the designed API: the gate reaches the owner's phone
// as a TAPPABLE card, the decision is READABLE behind an encrypted link, the
// host holds only ciphertext, the lane DEGRADES loudly instead of blocking,
// and it publishes EXACTLY when the run would otherwise wait for the owner.
//
// Requirement ids are the register's (evidence/write_requirements-1.json).
// R9's register wording says "when a human will adjudicate"; the owner
// sharpened it on 2026-07-25 to the test used here — publish iff the run
// would otherwise WAIT. se.adr-announce-by-adjudicator carries the ruling.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { Loop } from "../engine/loop.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { plantMachines } from "./fixtures.ts";
import { seal, unseal, briefPage, briefHtml, publishBrief, MAX_BRIEF_TTL_S, type BriefStore } from "../engine/brief.ts";
import { PhoneLane, answerUrl, type Transport, type PhoneAnswer } from "../engine/phone.ts";
import { seWait } from "../engine/wait.ts";
import { CallLog } from "../engine/calllog.ts";

const drop = (root: string): void => {
  try {
    rmSync(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  } catch {
    /* temp cleanup is best-effort on Windows */
  }
};

class MockTransport implements Transport {
  published: { topic: string; message: string; actions: unknown; id: string; title?: string; priority?: number; tags?: string[] }[] = [];
  answers: PhoneAnswer[] = [];
  failPublish = false;
  async publish(topic: string, msg: { message: string; actions: unknown; id: string; title?: string; priority?: number; tags?: string[] }): Promise<void> {
    if (this.failPublish) throw new Error("transport down");
    this.published.push({ topic, ...msg });
  }
  async pollSince(_topic: string, since: number): Promise<PhoneAnswer[]> {
    return this.answers.filter((a) => a.at > since);
  }
}

/** A brief store that can refuse to store, or store but never serve. */
class MockStore implements BriefStore {
  puts: { key: string; body: string; ttlS: number }[] = [];
  failPut = false;
  neverServes = false;
  async put(key: string, body: string, ttlS: number): Promise<void> {
    if (this.failPut) throw new Error("store down");
    this.puts.push({ key, body, ttlS });
  }
  async serves(key: string): Promise<boolean> {
    return !this.neverServes && this.puts.some((p) => p.key === key);
  }
  url(key: string): string {
    return `https://brief.example/${key}`;
  }
}

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-i8d-"));
  mkdirSync(layout.seDir(root), { recursive: true });
  plantMachines(root);
  return root;
};

const leanOK = (root: string) => {
  const m = loadMachine(root, "lean")!;
  return { ...m, states: m.states.map((s) => (s.id === "verify" ? { ...s, command: 'node -e "process.exit(0)"' } : s)) };
};

/** Drive a lean iteration to a live gate offer; return the offer hash. */
const reachOffer = (root: string): string => {
  const loop = new Loop(root, leanOK(root));
  loop.start("i0-brief");
  loop.submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
  loop.submit({ changed: "c" });
  return loop.submit({ exit_check_result: "done" }).offer_hash!;
};

const writeConfig = (root: string, cfg: object): void =>
  writeFileSync(join(layout.seDir(root), "phone.json"), JSON.stringify(cfg), "utf8");

const CONFIG = { enabled: true, base: "https://ntfy.example", topic: "t-out", answer_topic: "t-in", token: "SECRET-TOK" };

// ---------------------------------------------------------------- the crypto

test("R5/SP1: a brief round-trips, and the sealed payload carries none of its words", async () => {
  const plain = "<h1>GATE gate_release</h1><p>the deciding sentence</p>";
  const { payload, key } = seal(plain);
  assert.equal(await unseal(payload, key), plain, "round trip");
  for (const word of ["deciding", "sentence", "GATE", "gate_release"]) {
    assert.ok(!payload.includes(word), `the payload leaks "${word}"`);
  }
});

test("R5/SP1: corruption is loud - a wrong key or a tampered payload throws, never returns garbage", async () => {
  const { payload, key } = seal("the decision");
  const other = seal("x").key;
  await assert.rejects(() => unseal(payload, other), "a wrong key must throw");
  const raw = Buffer.from(payload, "base64");
  raw[raw.length - 1] ^= 1;
  await assert.rejects(() => unseal(raw.toString("base64"), key), "GCM must authenticate");
});

test("SP1: the key is url-safe, so a URL fragment carries it intact", () => {
  for (let i = 0; i < 40; i++) {
    assert.match(seal("x").key, /^[A-Za-z0-9_-]+$/, "base64url only - no + / or =");
  }
});

test("R4/R5: the page carries the ciphertext and its own decryptor, never the plaintext", async () => {
  const plain = "<p>UNIQUEPLAINTEXTMARKER</p>";
  const { payload, key } = seal(plain);
  const page = briefPage(payload);
  assert.ok(!page.includes("UNIQUEPLAINTEXTMARKER"), "the page must not embed the plaintext");
  assert.ok(page.includes(payload), "the page carries its ciphertext");
  assert.match(page, /location\.hash/, "the key comes from the fragment, never the path or query");
  assert.match(page, /crypto\.subtle/, "it decrypts in the browser");
  assert.equal(await unseal(payload, key), plain, "and what it carries is the brief");
});

test("R4: the brief renders the gate's own text, escaped", () => {
  const html = briefHtml({ iteration: "i8d", state: "gate_release", brief: "line one\nline <two> & more" });
  assert.match(html, /i8d/);
  assert.match(html, /gate_release/);
  assert.match(html, /line one/);
  assert.ok(!html.includes("<two>"), "markup in the brief must be escaped, not injected");
  assert.match(html, /&lt;two&gt;/);
});

// ---------------------------------------------------------- publish + verify

test("R6: a page that never serves is never announced - publishBrief yields no link", async () => {
  const store = new MockStore();
  store.neverServes = true;
  assert.equal(await publishBrief(store, "<p>x</p>", 600), null, "no link when the store will not serve it");
});

test("R6: a served page yields a link whose key rides the fragment only", async () => {
  const store = new MockStore();
  const url = await publishBrief(store, "<p>x</p>", 600);
  assert.ok(url !== null, "a served page yields a link");
  const [base, frag] = url!.split("#");
  assert.match(base, /^https:\/\/brief\.example\//);
  assert.match(frag, /^[A-Za-z0-9_-]+$/, "the key is the fragment");
  assert.ok(!base.includes(frag), "the key must not appear in the path or query");
});

test("R7: a brief cannot outlive its decision - the ttl is bounded", async () => {
  const store = new MockStore();
  await publishBrief(store, "<p>x</p>", 600);
  assert.equal(store.puts[0].ttlS, 600, "the requested life is honoured");
  await publishBrief(store, "<p>x</p>", MAX_BRIEF_TTL_S * 10);
  assert.equal(store.puts[1].ttlS, MAX_BRIEF_TTL_S, "and capped - no unbounded archive");
});

test("R8: a store that refuses never throws outward - it degrades to no link", async () => {
  const store = new MockStore();
  store.failPut = true;
  assert.equal(await publishBrief(store, "<p>x</p>", 600), null, "degrade, do not throw");
});

// ------------------------------------------------------------------ the card

test("R1: every action URL is absolute http(s) - the defect that started this iteration", async () => {
  assert.match(answerUrl("https://ntfy.example", "t-in"), /^https:\/\/ntfy\.example\/t-in$/);
  assert.match(answerUrl("https://ntfy.example/", "t-in"), /^https:\/\/ntfy\.example\/t-in$/, "no double slash");
  const root = freshRoot();
  try {
    writeConfig(root, CONFIG);
    const tx = new MockTransport();
    const lane = new PhoneLane(root, () => tx);
    reachOffer(root);
    await lane.announceOffer({ store: new MockStore() });
    const actions = tx.published[0].actions as { url?: string }[];
    assert.ok(actions.length > 0, "actions were published");
    for (const a of actions) {
      assert.match(String(a.url), /^https?:\/\//, `"${a.url}" is not a tappable URL`);
    }
  } finally {
    drop(root);
  }
});

test("R2: a gate looks like a gate - titled, raised, tagged", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, CONFIG);
    const tx = new MockTransport();
    const lane = new PhoneLane(root, () => tx);
    reachOffer(root);
    await lane.announceOffer({ store: new MockStore() });
    const p = tx.published[0];
    assert.match(String(p.title), /i0-brief/, "the iteration is on the lock screen");
    assert.match(String(p.title), /gate/i, "and so is the gate");
    assert.ok((p.priority ?? 0) >= 4, "raised above an ordinary message");
    assert.ok((p.tags ?? []).length > 0, "distinctly tagged");
  } finally {
    drop(root);
  }
});

test("R3: at most three actions, and the third opens the brief", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, CONFIG);
    const tx = new MockTransport();
    const lane = new PhoneLane(root, () => tx);
    reachOffer(root);
    await lane.announceOffer({ store: new MockStore() });
    const actions = tx.published[0].actions as { action: string; url: string }[];
    assert.ok(actions.length <= 3, "ntfy drops the rest silently");
    assert.equal(actions.length, 3, "bless, dismiss, and the brief");
    assert.equal(actions[2].action, "view", "the third opens the brief");
    assert.match(actions[2].url, /#/, "with its key");
  } finally {
    drop(root);
  }
});

test("R8/Q1: the brief may fail, the summons may not - the card still carries bless and dismiss", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, CONFIG);
    const tx = new MockTransport();
    const store = new MockStore();
    store.failPut = true;
    const lane = new PhoneLane(root, () => tx);
    reachOffer(root);
    const res = await lane.announceOffer({ store });
    assert.equal(res.announced, true, "the owner is still summoned");
    assert.equal(res.brief, "degraded", "and the degradation is named, not hidden");
    const actions = tx.published[0].actions as { action: string }[];
    assert.equal(actions.length, 2, "bless and dismiss survive");
  } finally {
    drop(root);
  }
});

test("R12/Q1: every announcement is recorded - success and failure alike, never neither", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, CONFIG);
    const tx = new MockTransport();
    const lane = new PhoneLane(root, () => tx, new CallLog(layout.seDir(root)));
    reachOffer(root);
    await lane.announceOffer({ store: new MockStore() });
    const logPath = join(layout.seDir(root), "calls.jsonl");
    const ok = readFileSync(logPath, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    assert.ok(ok.some((r) => String(r.tool).includes("announce") && r.ok === true), "the success is recorded");

    tx.failPublish = true;
    const res = await lane.announceOffer({ store: new MockStore() });
    assert.equal(res.announced, false, "an unreachable owner is reported as such");
    const all = readFileSync(logPath, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    assert.ok(all.some((r) => String(r.tool).includes("announce") && r.ok === false), "the failure is recorded - never silence");
  } finally {
    drop(root);
  }
});

test("R11: the token reaches neither the log, nor the result, nor the brief", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, CONFIG);
    const tx = new MockTransport();
    const store = new MockStore();
    const lane = new PhoneLane(root, () => tx, new CallLog(layout.seDir(root)));
    reachOffer(root);
    const res = await lane.announceOffer({ store });
    const logPath = join(layout.seDir(root), "calls.jsonl");
    assert.ok(!readFileSync(logPath, "utf8").includes("SECRET-TOK"), "not in the call log");
    assert.ok(!JSON.stringify(res).includes("SECRET-TOK"), "not in the returned result");
    assert.ok(!store.puts.some((p) => p.body.includes("SECRET-TOK")), "not in the published page");
  } finally {
    drop(root);
  }
});

// ------------------------------------------------- publish iff the run waits

test("R9: parking on an offer announces it - the wait IS the trigger", async () => {
  const root = freshRoot();
  try {
    reachOffer(root);
    let parked = 0;
    await seWait(root, { kind: "offer" }, 1, { onPark: async () => void parked++ });
    assert.equal(parked, 1, "the act of waiting for the owner publishes, exactly once");
  } finally {
    drop(root);
  }
});

test("R9: nothing else announces - not a file wait, not a wait with no offer live", async () => {
  const root = freshRoot();
  try {
    let parked = 0;
    const bump = async (): Promise<void> => void parked++;
    reachOffer(root);
    await seWait(root, { kind: "file", path: join(root, "nope"), until: "exists" }, 0.5, { onPark: bump });
    assert.equal(parked, 0, "waiting for a file is not waiting for the owner");

    const bare = freshRoot();
    try {
      await seWait(bare, { kind: "offer" }, 0.5, { onPark: bump });
      assert.equal(parked, 0, "with no offer live there is nobody to summon");
    } finally {
      drop(bare);
    }
  } finally {
    drop(root);
  }
});

test("R9: the board no longer announces on a timer - it only reads taps", () => {
  const board = readFileSync(join(import.meta.dirname, "..", "bin", "se-board.ts"), "utf8");
  assert.ok(!board.includes("announceOffer"), "a poller cannot know the run is waiting - the park seam owns the push");
  assert.ok(board.includes("pollAnswers"), "but a tap must still land while the agent's turn is over");
});

test("R10: the pairing is read at announce time, so restoring it works without a restart", async () => {
  const root = freshRoot();
  try {
    const tx = new MockTransport();
    const lane = new PhoneLane(root, () => tx); // built BEFORE any pairing exists
    reachOffer(root);
    const silent = await lane.announceOffer({ store: new MockStore() });
    assert.equal(silent.announced, false, "unpaired stays silent");
    assert.equal(tx.published.length, 0);

    writeConfig(root, CONFIG); // the owner pairs now - no board cycle
    const after = await lane.announceOffer({ store: new MockStore() });
    assert.equal(after.announced, true, "the same live lane honours the new pairing");
    assert.equal(tx.published.length, 1);
  } finally {
    drop(root);
  }
});
