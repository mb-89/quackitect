// A BOUND RECORD MUST NOT SWALLOW THE OWNER'S DECLARED ROOTS.
//
// Found live 2026-08-01, and it cost the owner two messages. Inside a bound
// expedition, se_file_read resolved "@ai/..." perfectly while
// se_file_glob and se_file_search refused the SAME name with SE-C-127,
// "none declared" — and handed over a remedy telling the caller to declare a
// root that was already declared. Following that remedy would have
// overwritten a correct file with a guess.
//
// The cause was not the roots registry. laneRoot() had always routed an
// "@" address to the project root, where .se/roots.json lives. The two tools
// simply never SHOWED it the address: they called rootOf() with no argument,
// so the ambient root answered, and it has no .se/roots.json.
//
// So there are two things to hold: the routing rule, and the wiring that
// feeds it. The wiring is the half that broke.
import { strict as assert } from "node:assert";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { Session } from "../engine/session.ts";
import { anyGuidanceDoc, freshRoot } from "./helpers.ts";

describe("declared roots", { concurrency: true }, () => {
  // THE ROUTING RULE. An "@" address is session state exactly like .se/, so it
  // is answered by the PROJECT root however deep in a record the walk is.
  // A FIXTURE ROOT, NEVER THE REAL ONE: a Session on the real root reads the
  // owner's live settings, and block_sleep=true made every worker here spawn
  // an immortal keepawake — the battery's four-kill wedge of 2026-08-03.
  test("an @ address routes to the project root, whatever else is bound", () => {
    const root = freshRoot();
    const s = new Session(root);
    assert.equal(s.laneRoot("@ai"), root, "a bare root name");
    assert.equal(s.laneRoot("@ai/sya_kb/digest"), root, "a path inside one");
    assert.equal(s.laneRoot("@ai/**/*.md"), root, "A GLOB — the case that broke");
  });

  // ...and the other side of it, so a fix here never quietly redirects
  // ordinary work out of the root it belongs in.
  test("everything else still answers from the work root", () => {
    const s = new Session(freshRoot());
    assert.equal(s.laneRoot(), s.workRoot(), "no address at all");
    assert.equal(s.laneRoot(anyGuidanceDoc()), s.workRoot(), "an ordinary path");
    assert.equal(s.laneRoot("project/**/*.md"), s.workRoot(), "an ordinary glob");
  });

  // THE WIRING. The routing rule is worthless if the tool never shows it the
  // address, which is exactly what happened. Every file tool that accepts a
  // root selector must pass THAT SELECTOR to rootOf, never nothing.
  test("the glob and search handlers pass their selector to the root chooser", async () => {
    const { readFileSync } = await import("node:fs");
    const src = readFileSync(new URL("../engine/model-fs.ts", import.meta.url), "utf8");
    const globLine = src.split("\n").find((line) => line.includes("fileGlob(this.rootOf("));
    const searchLine = src.split("\n").find((line) => line.includes("search(this.rootOf("));
    assert.ok(globLine?.includes("this.rootOf(glob)"), "se_file_glob must route on its glob");
    assert.ok(searchLine?.includes("this.rootOf(opts.path)"), "se_file_search must route on its path scope");
  });

  // The refusal that misled the owner. It should never claim nothing is
  // declared when something is.
  test("a root that IS declared is never reported as undeclared", async () => {
    const { declaredRoots } = await import("../engine/paths.ts");
    const root = mkdtempSync(join(tmpdir(), "se-roots-"));
    mkdirSync(join(root, ".se"), { recursive: true });
    writeFileSync(join(root, ".se", "roots.json"), JSON.stringify({ books: "C:\\\\books" }), "utf8");
    assert.deepEqual(Object.keys(declaredRoots(root)), ["books"]);
    // And a root with no declaration at all answers empty rather than throwing,
    // so the caller can say "none declared" honestly.
    const bare = mkdtempSync(join(tmpdir(), "se-roots-bare-"));
    assert.deepEqual(declaredRoots(bare), {});
  });
});

// THE WRITE SIDE OF A DECLARED ROOT — four cases from
// tsp-a-produced-tree-is-bounded-and-named.
//
// The first two CHARACTERISE guards that already stand in engine/paths.ts and
// that nothing has ever exercised. They should pass on the unchanged engine; a
// red there means the guard was never real.
//
// The last two describe the second write target, which is not built. They are
// red on purpose and stay red until chunk-declared-write-target lands.
describe("the write side of a declared root", { concurrency: true }, () => {
  // A fixture root carrying a roots.json, and a separate folder to point at.
  const fixture = (declared: unknown): { root: string; target: string } => {
    const target = mkdtempSync(join(tmpdir(), "se-target-"));
    const root = mkdtempSync(join(tmpdir(), "se-writeroot-"));
    mkdirSync(join(root, ".se"), { recursive: true });
    const map = typeof declared === "function" ? (declared as (t: string) => unknown)(target) : declared;
    writeFileSync(join(root, ".se", "roots.json"), JSON.stringify(map), "utf8");
    return { root, target };
  };

  // A TREE'S IDENTITY LIVES IN ITS BRAND FILE, and a produced tree records the
  // identity it came from beside its vendored things. Writing both is how the
  // source case builds a real situation rather than asserting into a vacuum:
  // nothing declares a target to BE the source, the guard has to derive it.
  const BRAND = ["project", "deliverable", "brand", "brand.json"];
  const UPSTREAM = ["project", "deliverable", "vendor", "upstream", "upstream.json"];
  const writeIdentity = (tree: string, parts: string[], id: string): void => {
    const dir = join(tree, ...parts.slice(0, -1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, parts[parts.length - 1]), JSON.stringify({ id }), "utf8");
  };

  test("a write lane refuses an @ address", async () => {
    const { resolveInRoot } = await import("../engine/paths.ts");
    const { root } = fixture((t: string) => ({ books: t }));
    assert.throws(
      () => resolveInRoot(root, "@books/note.md", "roots.test"),
      "resolveInRoot must refuse a root-ref — a declared root is read-only",
    );
  });

  test("a path cannot climb out of the base it was declared against", async () => {
    const { resolveDeclaredRoot } = await import("../engine/paths.ts");
    const { root } = fixture((t: string) => ({ books: t }));
    assert.throws(
      () => resolveDeclaredRoot(root, "@books/../escaped.md", "roots.test"),
      "resolveDeclaredRoot must refuse anything resolving outside its declared base",
    );
  });

  // RED UNTIL THE SECOND WRITE TARGET EXISTS.
  test("a root declared WRITABLE resolves on a write lane, inside its base", async () => {
    const { resolveInRoot } = await import("../engine/paths.ts");
    const { root, target } = fixture((t: string) => ({ site: { path: t, writable: true } }));
    assert.doesNotThrow(
      () => resolveInRoot(root, "@site/index.md", "roots.test"),
      "a writable declared root must be reachable from a write lane",
    );
    assert.ok(
      resolveInRoot(root, "@site/index.md", "roots.test").startsWith(target),
      "and it must land inside the folder that was declared",
    );
    // A WRITABLE ROOT IS STILL A BASE. Making one writable must not also make
    // it climbable, which is the containment half of the spec's third step.
    assert.throws(() => resolveInRoot(root, "@site/../escaped.md", "roots.test"), "nothing climbs out of a writable declared base either");
  });

  // A vehicle must not be able to name the tree it came from as a writable
  // target. That is the isolation promise, and it is graded fatal.
  test("a writable root naming the tree this system came from is refused AS the source", async () => {
    const { resolveInRoot } = await import("../engine/paths.ts");
    // THE ROOT IS NAMED `elsewhere` ON PURPOSE. An earlier draft called it
    // `upstream`, and the refusal echoes the path it was given — so the check
    // matched its own input and passed for the wrong reason.
    const { root, target } = fixture((t: string) => ({ elsewhere: { path: t, writable: true } }));
    // This tree records that it came from `the-engine`. The target tree says
    // it IS `the-engine`. Neither fact mentions the other, and the collision
    // is the guard's to find.
    writeIdentity(root, UPSTREAM, "the-engine");
    writeIdentity(target, BRAND, "the-engine");
    // AND THE WHOLE ERROR OBJECT IS NOT THE REASON. A first draft matched
    // JSON.stringify(e) against /\bsource\b/ and passed on the unchanged
    // engine — because a Rejection carries a FIELD called `source`, naming the
    // module that threw. The check was reading a key name. Only the prose a
    // reader would see counts, so only that is joined here.
    type Said = { expected?: string; remedy?: { note?: string } };
    let reason = "";
    try {
      resolveInRoot(root, "@elsewhere/engine.ts", "roots.test");
    } catch (e) {
      const r = e as Said;
      reason = [r.expected ?? "", r.remedy?.note ?? "", String((e as Error).message ?? "")].join(" ");
    }
    assert.ok(
      /came from|\bthe source\b|\bits origin\b/i.test(reason),
      `the refusal must name WHY — that the target is the tree this one came from — and it said: ${reason.trim() || "nothing, it did not refuse"}`,
    );
  });

  // THE OTHER HALF. Without it, a guard that refused EVERY writable target
  // would pass the case above and read as correct.
  test("a writable root that is a different tree resolves normally", async () => {
    const { resolveInRoot } = await import("../engine/paths.ts");
    const { root, target } = fixture((t: string) => ({ site: { path: t, writable: true } }));
    writeIdentity(root, UPSTREAM, "the-engine");
    writeIdentity(target, BRAND, "somebody-elses-product");
    assert.ok(
      resolveInRoot(root, "@site/index.md", "roots.test").startsWith(target),
      "a target carrying its own identity is not the source, and must resolve",
    );
  });
});
