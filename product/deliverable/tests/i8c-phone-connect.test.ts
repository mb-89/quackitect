// i8c phone-connect: the board's connect action pairs a phone in one gesture -
// generate an ntfy topic pair, write phone.json ATOMICALLY, and render a QR
// encoded LOCALLY (the topic is the credential, never sent anywhere).
// Red-first against the designed API in engine/connect.ts.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.SE_STATE_DIR = mkdtempSync(join(tmpdir(), "se-state-"));
import { connectPhone, phoneConfigPath } from "../engine/connect.ts";
import { encodeQR } from "../engine/vendor/qrcode.ts";

const root = () => mkdtempSync(join(tmpdir(), "i8c-connect-"));

test("R1 CONNECT: writes phone.json enabled with a generated topic and returns a QR matrix", () => {
  const r = root();
  try {
    const res = connectPhone(r);
    assert.ok(existsSync(phoneConfigPath(r)), "phone.json written");
    const cfg = JSON.parse(readFileSync(phoneConfigPath(r), "utf8"));
    assert.equal(cfg.enabled, true, "enabled");
    assert.ok(typeof cfg.topic === "string" && cfg.topic.length >= 16, "a high-entropy topic");
    assert.ok(Array.isArray(res.qr) && Array.isArray(res.qr[0]) && typeof res.qr[0][0] === "boolean", "a QR module matrix");
    assert.equal(res.topic, cfg.topic, "the returned topic matches the written config");
  } finally {
    try { rmSync(r, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("R3 QR-CORRECT: the encoder turns a known input into a valid QR matrix (finder pattern present)", () => {
  const m = encodeQR("ntfy.sh/se-quackitect-a1b2c3d4e5");
  const n = m.length;
  assert.ok(n >= 21 && n === m[0].length, "a square matrix >= 21x21 (a real QR version)");
  // Finder patterns: the 7x7 corner has a dark ring - (0,0) dark, (0,1) dark ... (1,1) light.
  assert.equal(m[0][0], true, "top-left finder corner is dark");
  assert.equal(m[1][1], false, "inside the finder ring is light");
});

test("R2 SECRECY: connect encodes locally - no external network call", () => {
  const r = root();
  const origFetch = globalThis.fetch;
  let called = false;
  globalThis.fetch = (() => { called = true; throw new Error("no network in connect"); }) as typeof fetch;
  try {
    connectPhone(r);
    assert.equal(called, false, "connect made no fetch call - the topic never leaves");
  } finally {
    globalThis.fetch = origFetch;
    try { rmSync(r, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});

test("R5 ATOMIC: an encode failure leaves NO phone.json (no partial config)", () => {
  const r = root();
  try {
    assert.throws(() => connectPhone(r, { encode: () => { throw new Error("encode boom"); } }), /boom/);
    assert.ok(!existsSync(phoneConfigPath(r)), "no partial phone.json after an encode failure");
  } finally {
    try { rmSync(r, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 }); } catch { /* temp cleanup is best-effort */ }
  }
});
