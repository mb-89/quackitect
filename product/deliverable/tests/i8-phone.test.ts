// i8's phone lane, red-first against the designed API: publish on offer,
// bless from a matched tap, ignore strays, stay silent unconfigured, keep
// the secret out of logs, never wedge on a stalled transport.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { layout } from "../engine/layout.ts";
import { Loop } from "../engine/loop.ts";
import { loadMachine } from "../engine/machines/load.ts";
import { plantMachines } from "./fixtures.ts";
import { PhoneLane, type Transport, type PhoneAnswer } from "../engine/phone.ts";
import { CallLog } from "../engine/calllog.ts";

/** A mock transport recording publishes and feeding scripted answers. */
class MockTransport implements Transport {
  published: { topic: string; message: string; actions: unknown; id: string }[] = [];
  answers: PhoneAnswer[] = [];
  async publish(topic: string, msg: { message: string; actions: unknown; id: string }): Promise<void> {
    this.published.push({ topic, ...msg });
  }
  async pollSince(_topic: string, since: number): Promise<PhoneAnswer[]> {
    return this.answers.filter((a) => a.at > since);
  }
}

const freshRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "se-i8-"));
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
  loop.start("i0-phone");
  loop.submit({ goal: "g", load_bearing_for: "l", exit_check: "e" });
  loop.submit({ changed: "c" });
  const p = loop.submit({ exit_check_result: "done" });
  return p.offer_hash!;
};

const writeConfig = (root: string, cfg: object): void =>
  writeFileSync(join(layout.seDir(root), "phone.json"), JSON.stringify(cfg), "utf8");

test("configured: an offer publishes the brief + bless action carrying the offer hash as the id", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, { enabled: true, topic: "t-out", answer_topic: "t-in", token: "SECRET-TOK" });
    const tx = new MockTransport();
    const lane = new PhoneLane(root, tx);
    const hash = reachOffer(root);
    await lane.announceOffer();
    assert.equal(tx.published.length, 1, "one publish");
    assert.equal(tx.published[0].topic, "t-out");
    assert.equal(tx.published[0].id, hash, "the offer hash is the correlation id");
    assert.match(JSON.stringify(tx.published[0].actions), /bless/i, "a bless action is offered");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a matched tap records a channel=phone grant bound to the hash and dismisses the offer", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, { enabled: true, topic: "t-out", answer_topic: "t-in" });
    const tx = new MockTransport();
    const lane = new PhoneLane(root, tx);
    const hash = reachOffer(root);
    tx.answers.push({ id: hash, action: "bless", at: Date.now() });
    await lane.pollAnswers();
    const grants = readFileSync(layout.grantsPath(root), "utf8").trim().split("\n").map((l) => JSON.parse(l));
    const g = grants.at(-1);
    assert.equal(g.channel, "phone");
    assert.equal(g.adjudicated_by, "owner");
    assert.equal(g.hash, hash, "bound to the offered hash");
    assert.equal(existsSync(layout.offerPath(root)), false, "the offer was dismissed");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("a dismiss tap dismisses the offer without a grant", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, { enabled: true, topic: "t-out", answer_topic: "t-in" });
    const tx = new MockTransport();
    const lane = new PhoneLane(root, tx);
    const hash = reachOffer(root);
    const before = existsSync(layout.grantsPath(root)) ? readFileSync(layout.grantsPath(root), "utf8") : "";
    tx.answers.push({ id: hash, action: "dismiss", at: Date.now() });
    await lane.pollAnswers();
    assert.equal(existsSync(layout.offerPath(root)), false, "offer gone");
    const after = existsSync(layout.grantsPath(root)) ? readFileSync(layout.grantsPath(root), "utf8") : "";
    assert.equal(after, before, "no grant written");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("stale, mismatched and duplicate taps leave the grant chain unchanged", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, { enabled: true, topic: "t-out", answer_topic: "t-in" });
    const tx = new MockTransport();
    const lane = new PhoneLane(root, tx);
    const hash = reachOffer(root);
    tx.answers.push({ id: "wrong-hash", action: "bless", at: Date.now() });
    await lane.pollAnswers();
    assert.ok(existsSync(layout.offerPath(root)), "a mismatched tap does not bind");
    // Honor the real one, then replay it: the duplicate must be a no-op.
    tx.answers.push({ id: hash, action: "bless", at: Date.now() + 1 });
    await lane.pollAnswers();
    const afterFirst = readFileSync(layout.grantsPath(root), "utf8");
    tx.answers.push({ id: hash, action: "bless", at: Date.now() + 2 });
    await lane.pollAnswers();
    assert.equal(readFileSync(layout.grantsPath(root), "utf8"), afterFirst, "the duplicate wrote nothing");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("unconfigured: no publish, no poll, no throw - other channels untouched", async () => {
  const root = freshRoot();
  try {
    const tx = new MockTransport();
    const lane = new PhoneLane(root, tx); // no phone.json written
    reachOffer(root);
    await assert.doesNotReject(() => lane.announceOffer());
    await assert.doesNotReject(() => lane.pollAnswers());
    assert.equal(tx.published.length, 0, "silent when unconfigured");
    assert.ok(existsSync(layout.offerPath(root)), "the offer is untouched");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the credential never reaches the call log (req-phone-config-secret)", async () => {
  const root = freshRoot();
  try {
    writeConfig(root, { enabled: true, topic: "t-out", answer_topic: "t-in", token: "SECRET-TOK" });
    const tx = new MockTransport();
    const lane = new PhoneLane(root, tx, new CallLog(layout.seDir(root)));
    reachOffer(root);
    await lane.announceOffer();
    tx.answers.push({ id: "nope", action: "bless", at: Date.now() });
    await lane.pollAnswers();
    const logPath = join(layout.seDir(root), "calls.jsonl");
    const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
    assert.ok(!log.includes("SECRET-TOK"), "no token in the call log");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the transport read is bounded even when the endpoint hangs (S4 guard)", async () => {
  const server = createServer(() => {}); // never responds
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", () => r()));
  const port = (server.address() as { port: number }).port;
  try {
    const { NtfyTransport } = await import("../engine/phone.ts");
    const tx = new NtfyTransport(`http://127.0.0.1:${port}`, { timeoutMs: 300 });
    const started = Date.now();
    await assert.rejects(() => tx.pollSince("t-in", 0));
    assert.ok(Date.now() - started < 2000, "the poll returned within the bound, not wedged");
  } finally {
    server.close();
  }
});
