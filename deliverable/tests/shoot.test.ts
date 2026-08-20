// SE_SHOOT — the agent looks at what it built.
//
// This exists because a surface cannot be judged from its HTML. Two UI rounds
// in one session were corrected by the owner before a screenshot loop was
// built by hand; the third round caught its own mistakes. The tool is that
// loop, made permanent.
import { strict as assert } from "node:assert";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Rejection } from "../engine/errors.ts";
import { shoot } from "../engine/shoot.ts";

const PAGE = `<style>body{background:#101418;margin:0}h1{color:#e8b339;font:700 40px system-ui;padding:24px}</style><h1>se</h1>`;

describe("se_shoot", { concurrency: true }, () => {
  test("it renders HTML to a real picture and hands the image back", () => {
    const root = mkdtempSync(join(tmpdir(), "se-shoot-"));
    const r = shoot(root, PAGE, { width: 400, height: 200, name: "probe" });

    assert.equal(r.media_type, "image/png");
    assert.ok(r.bytes > 500, "a real PNG, not an empty file");
    assert.equal(r.path, ".se/shots/probe.png");
    assert.equal(r._attachments.length, 1, "the picture rides with the result");
    assert.equal(r._attachments[0].type, "image");
    assert.ok(r._attachments[0].data.length > 100, "and carries actual bytes");
    // THE SHOT LANDS UNDER .se/, which is SESSION state. A binary file in the
    // product tree is a defect the suite refuses, and a screenshot tool that
    // dropped one there would fail the repo on its first use.
    //
    // THIS USED TO SAY "not under project/". That folder is gone, so the
    // assertion held for every value it could ever be given. The positive form
    // is the claim that was always meant.
    assert.ok(existsSync(join(root, ".se", "shots", "probe.png")));
    assert.ok(r.path.startsWith(".se/"), `the shot belongs to session state, not the product tree: ${r.path}`);
  });

  test("an oversize shot is REFUSED, never silently downscaled", () => {
    const root = mkdtempSync(join(tmpdir(), "se-shoot-big-"));
    // A page of noise at a large viewport: the point is that the refusal
    // states the size and offers a smaller window, rather than resizing
    // behind the caller's back.
    const noisy =
      `<style>body{margin:0}</style>` +
      Array.from(
        { length: 400 },
        (_, i) => `<div style="height:40px;background:rgb(${i % 255},${(i * 7) % 255},${(i * 13) % 255})"></div>`,
      ).join("");
    try {
      const r = shoot(root, noisy, { width: 3000, height: 6000, name: "big" });
      // Some hosts compress this well enough to pass, and that is a legitimate
      // outcome rather than a broken test. What must never happen is a silent
      // downscale, so assert the shot is honest about its own size.
      assert.equal(r.width, 3000);
      assert.equal(r.height, 6000);
    } catch (e) {
      assert.ok(e instanceof Rejection, "an oversize shot refuses with a typed rejection");
      assert.match(String((e as Rejection).expected), /under \d+ bytes/);
      assert.equal((e as Rejection).remedy?.tool, "se_shoot", "and the remedy is a smaller shot");
    }
  });

  test("a shot is reproducible: the same page twice gives the same hash", () => {
    const root = mkdtempSync(join(tmpdir(), "se-shoot-same-"));
    const a = shoot(root, PAGE, { width: 300, height: 150, name: "a" });
    const b = shoot(root, PAGE, { width: 300, height: 150, name: "b" });
    assert.equal(a.hash, b.hash, "nothing in the pipeline is time-dependent");
  });
});
