// THE TWO PRODUCING ACTS, END TO END
// (tsp-a-vehicle-is-made-and-then-drives-something-else, and the containment
// rows of tsp-a-produced-tree-is-bounded-and-named).
//
// THE OWNER ASKED FOR THIS ON 2026-08-18: "a test that creates a vehicle and
// from that creates a project and checks if that project is usable."
//
// v1 HAD ONE AND IT IS THE MODEL. product/engine-go/i18_red3.go at ref main —
// "the vehicle-drives-stub chain, end to end. One hermetic walk of the owner's
// field case." What makes it a test rather than a walk somebody performs is
// that it is HERMETIC: temporary directories, and nothing of the real machine
// changed.
//
// WHAT IS STILL NOT A TEST, and the requirements are right about it: a
// genuinely foreign machine with nothing of the source on it. That stays a
// demonstration, and it is the only part of the story that does.
//
// THESE RUN SEQUENTIALLY ON PURPOSE. A producing act's bound is process-wide
// by design — one act names one tree — so two of them in flight at once would
// collide on it and refuse.
import { strict as assert } from "node:assert";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { drivenBy, produceProject, produceVehicle } from "../engine/produce.ts";
import { inventory } from "../engine/update.ts";

const REPO = fileURLToPath(new URL("../../../", import.meta.url));
const emptyDir = (): string => mkdtempSync(join(tmpdir(), "se-produce-"));
const readJson = (p: string): Record<string, unknown> => JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>;

const BRAND = join("project", "deliverable", "brand", "brand.json");
const UPSTREAM = join("project", "deliverable", "vendor", "upstream", "upstream.json");
const SPEC = join("project", "spec");

// ONE VEHICLE, MADE ONCE. Copying a whole tree is the expensive part of this
// file, and every case that only READS the result can share one.
let theVehicle: { dest: string; id: string; instance: string } | undefined;
const aVehicle = (): { dest: string; id: string; instance: string } => {
  if (theVehicle === undefined) theVehicle = produceVehicle(REPO, { dest: emptyDir(), name: "Blue Heron", abbr: "BH" }, "produce.test");
  return theVehicle;
};

describe("producing a vehicle", () => {
  test("it refuses before writing anything when the destination is not empty", () => {
    const dest = emptyDir();
    writeFileSync(join(dest, "somebody-elses-work.md"), "mine\n", "utf8");
    assert.throws(
      () => produceVehicle(REPO, { dest, name: "Blue Heron", abbr: "BH" }, "produce.test"),
      "an occupied destination must stop the act before the first byte",
    );
    // REFUSE RATHER THAN HALF-DO. A failed act that leaves a partial tree
    // behind is worse than one that leaves nothing, because the half looks
    // finished.
    assert.deepEqual(readdirSync(dest), ["somebody-elses-work.md"], "nothing may be written into an occupied destination");
  });

  test("it refuses a missing name or abbreviation rather than falling back to its own", () => {
    // A FORGOTTEN ARGUMENT SHIPS THIS PRODUCT TO SOMEBODY ELSE UNDER OUR NAME.
    // The shipped export learned that and demanded all three; the guard travels.
    const a = emptyDir();
    assert.throws(() => produceVehicle(REPO, { dest: a, name: "", abbr: "BH" }, "produce.test"), "a missing name must refuse");
    const b = emptyDir();
    assert.throws(
      () => produceVehicle(REPO, { dest: b, name: "Blue Heron", abbr: "" }, "produce.test"),
      "a missing abbreviation must refuse",
    );
    const c = emptyDir();
    assert.throws(
      () => produceVehicle(REPO, { dest: c, name: "!!!", abbr: "BH" }, "produce.test"),
      "a name with nothing to make an id from must refuse",
    );
    assert.deepEqual([...readdirSync(a), ...readdirSync(b), ...readdirSync(c)], [], "and none of them may leave anything behind");
  });

  test("it produces a complete tree under the new name, in a repository of its own", () => {
    const made = aVehicle();

    // THE NAME IS ONE FACT, written once in the brand file at the root.
    const brand = readJson(join(made.dest, BRAND));
    assert.equal(brand.name, "Blue Heron");
    assert.equal(brand.id, "blue-heron", "the id survives being a folder name, an npm name and a command id");
    assert.equal(brand.abbr, "BH");

    // AND AN IDENTITY IS MINTED, NEVER DERIVED. Two people can produce copies
    // called Atlas; a driven tree naming "atlas" would then resolve to
    // whichever was found first, which fails WRONGLY rather than absently.
    assert.equal(brand.instance, made.instance, "the act reports the identity it minted");
    assert.match(String(brand.instance), /^[0-9a-f]{12}$/);

    // COMPLETE: the method travels, so the vehicle runs on what it shipped with.
    assert.ok(existsSync(join(made.dest, "project", "deliverable", "engine", "paths.ts")), "the engine travels");
    assert.ok(existsSync(join(made.dest, "project", "guidance", "refusals.md")), "the guidance travels");
    assert.ok(existsSync(join(made.dest, "README.md")), "and a front door of its own");

    // A COPY, NEVER A CLONE. Its own repository, and no history of ours.
    assert.ok(existsSync(join(made.dest, ".git")), "a vehicle has a repository of its own");
  });

  test("it leaves the engine's own records at home and an empty place ready", () => {
    const made = aVehicle();
    // A VEHICLE OPENING ITS OWN ARCHIVE SHOULD FIND ITS OWN HISTORY, OR NONE.
    // The engine's spec is its expeditions, its iterations AND its trace, and
    // every part of it describes work the receiver never did.
    assert.ok(existsSync(join(made.dest, SPEC)), "the place its own records go exists from the start");
    assert.deepEqual(readdirSync(join(made.dest, SPEC)), [], "and it is empty");
    assert.ok(!existsSync(join(made.dest, ".se")), "the session state belongs to the machine, not to the copy");
    assert.ok(!existsSync(join(made.dest, "node_modules")), "and nothing installed travels");
    // NOTHING GENERATED TRAVELS, and this is the assertion that sentence used
    // to claim while checking only node_modules. `dist` alone held six release
    // archives totalling 20.8 MB, copied into every vehicle.
    // EVERY PATH HERE IS ONE THE SOURCE ACTUALLY HAS, and the first assertion
    // enforces that. Two of them named `.obsidian` and `.vscode` at the ROOT,
    // where neither exists — both live one level down. Those two were checking
    // paths the source never had, so they passed against an engine with no
    // exclusion list at all. Fourth wrong-reason pass in this iteration, same
    // shape as the other three.
    for (const generated of ["dist", join("project", "scratchpad"), join("project", ".obsidian"), join("project", ".vscode")]) {
      assert.ok(existsSync(join(REPO, generated)), `${generated} must exist in the source, or this case is checking nothing`);
      assert.ok(!existsSync(join(made.dest, generated)), `${generated} is generated or local, and must not travel`);
    }
  });

  test("the one file the arrival needs travels, and the generated one beside it does not", () => {
    const made = aVehicle();
    // THE ROOT .claude IS COMMITTED and is the only hook a fresh clone reads at
    // session start, so it is what fires the arrival. Dropping it ships a
    // product whose headline feature never fires — the exact defect the 4.5.0
    // archive had, fixed in the packaging script and reproduced here until the
    // two exclusion lists became one.
    assert.ok(existsSync(join(made.dest, ".claude", "settings.json")), "the root .claude is the one exception and must travel");
    // AND project/.claude IS GENERATED, placed by the arrival or the editor.
    assert.ok(!existsSync(join(made.dest, "project", ".claude")), "the generated one must not");
    // AND THE COPILOT HALF OF THE PROMPT LAYER, which lives under a `.github`
    // that is otherwise excluded by name. It is a declared method file, so a
    // vehicle without it has lost one host's whole prompt layer while the other
    // two keep theirs — the quietest way to ship a broken copy.
    assert.ok(
      existsSync(join(made.dest, "project", ".github", "instructions", "protocol.instructions.md")),
      "the Copilot host's prompt layer must travel, even though .github does not",
    );
    assert.ok(!existsSync(join(made.dest, ".github")), "and the repository's own workflows do not");
  });

  test("a failure past the copy leaves nothing behind", () => {
    // A TREE COMPLETE ENOUGH TO START THE ACT AND NOT TO FINISH IT: it can say
    // its own name, and it has no README template to render. The act gets past
    // requireEmpty and past the copy, then throws.
    const half = emptyDir();
    mkdirSync(join(half, "project", "deliverable", "brand"), { recursive: true });
    writeFileSync(join(half, BRAND), JSON.stringify({ name: "Half", id: "half", instance: "000000000000" }), "utf8");
    // TWO STATES ARE LEGAL TO START FROM, and cleanup means returning to
    // whichever it was rather than to whichever is easier.
    const existing = emptyDir();
    assert.throws(() => produceVehicle(half, { dest: existing, name: "Doomed", abbr: "DM" }, "produce.test"));
    // A HALF-MADE TREE IS WORSE THAN NONE, because the half looks finished.
    assert.deepEqual(readdirSync(existing), [], "an empty folder the person made must still be there, and still empty");

    const absent = join(emptyDir(), "not-yet");
    assert.throws(() => produceVehicle(half, { dest: absent, name: "Doomed", abbr: "DM" }, "produce.test"));
    assert.ok(!existsSync(absent), "a destination that did not exist must not exist afterwards");
  });

  test("it records where it came from, as an identity and never an address", () => {
    const made = aVehicle();
    const upstream = readJson(join(made.dest, UPSTREAM));
    const engine = readJson(join(REPO, BRAND));
    assert.equal(upstream.id, engine.id, "it names the engine it came from");
    assert.ok(typeof upstream.version === "string" && upstream.version.length > 0, "and at what version");
    // NOT AN ADDRESS. A git remote is somewhere you fetch from and, with one
    // wrong flag, push to. A recorded identity can reach nothing by itself.
    //
    // COMPARE PARSED VALUES, NEVER THE SERIALISED FORM. A first draft matched
    // `JSON.stringify(upstream).includes(REPO)`, and JSON escapes every
    // backslash — so a Windows path genuinely present in the file appeared
    // with doubled separators and the check could not fail. It would have
    // passed against an engine that DID write the path back. Third assertion
    // in this iteration to pass for the wrong reason, and the i16 tester found
    // this one.
    assert.ok(
      !Object.values(upstream).some((v) => typeof v === "string" && v.includes(REPO)),
      "the upstream file must carry no path back to the engine",
    );
  });

  test("the engine keeps no record of what it produced", () => {
    const before = readdirSync(REPO).sort();
    produceVehicle(REPO, { dest: emptyDir(), name: "Grey Heron", abbr: "GH" }, "produce.test");
    assert.deepEqual(readdirSync(REPO).sort(), before, "producing must not add anything to the tree it was launched from");
    // AND NO REGISTRY ANYWHERE. A consumer inside the engine would be a path
    // from the vehicle back to it, which is graded fatal.
    assert.ok(!existsSync(join(REPO, UPSTREAM)), "the engine was produced from nothing and never gains an upstream file");
  });
});

describe("a vehicle producing a project", () => {
  test("the project carries none of the method and one record naming its vehicle", () => {
    const vehicle = aVehicle();
    const project = emptyDir();
    produceProject(vehicle.dest, { dest: project, name: "Somebody Else's Thing" }, "produce.test");

    // NONE OF THE METHOD. That is what makes it a driven tree rather than a
    // second copy, and it is the whole reason the record has to exist.
    assert.ok(!existsSync(join(project, "project", "deliverable", "engine")), "a driven tree carries no engine");
    assert.ok(!existsSync(join(project, "project", "guidance")), "and none of the method");

    const record = readJson(join(project, "driven-by.json"));
    assert.equal(record.id, "blue-heron", "the record names WHICH copy drives it");
    assert.equal(record.instance, vehicle.instance, "by identity, so two copies sharing a name cannot be confused");
    assert.ok(typeof record.version === "string" && record.version.length > 0, "and at what version");
    // WHAT, NEVER WHERE. A path goes stale the moment either tree moves.
    // Parsed values, for the same reason the upstream case gives.
    assert.ok(
      !Object.values(record).some((v) => typeof v === "string" && v.includes(vehicle.dest)),
      "the record must carry no path to the vehicle",
    );
  });

  test("a driving tree that cannot say who it is refuses, rather than writing itself an identity", () => {
    const nameless = emptyDir();
    mkdirSync(join(nameless, "project", "deliverable", "brand"), { recursive: true });
    writeFileSync(join(nameless, BRAND), JSON.stringify({ name: "Nameless", id: "nameless" }), "utf8");
    const before = readFileSync(join(nameless, BRAND), "utf8");
    assert.throws(() => produceProject(nameless, { dest: emptyDir(), name: "Something" }, "produce.test"));
    // THE ACT USED TO MINT ONE INTO THE LAUNCHER'S OWN BRAND FILE, justified as
    // what a normal run records anyway. Nothing else in the product writes
    // `instance`, so it was not that — it was the one write this act made
    // outside the tree it produces.
    assert.equal(readFileSync(join(nameless, BRAND), "utf8"), before, "a producing act may not write the tree it was launched from");
  });

  test("a tree with no record is not a driven project, and it says which record it looked for", () => {
    const answer = drivenBy(emptyDir());
    assert.equal(answer.driven, false, "absence is an answer, never a guess");
    assert.ok(answer.looked_for.includes("driven-by.json"), `it must name the record it looked for, and it said: ${answer.looked_for}`);
  });

  test("a record naming a copy this machine has never seen answers on the identity", () => {
    const stranger = emptyDir();
    writeFileSync(join(stranger, "driven-by.json"), JSON.stringify({ id: "nobody", instance: "000000000000", version: "0.0.0" }), "utf8");
    const answer = drivenBy(stranger);
    assert.equal(answer.driven, true, "the record is present, so this IS a driven project");
    assert.equal(answer.resolved, false, "but the copy it names is not reachable");
    assert.ok(String(answer.identity).includes("nobody"), "and the answer names the identity rather than a path");
    // THE GAP IS NAMED RATHER THAN HIDDEN. Turning an identity into a tree
    // needs a register of copies this machine has seen, and there is none.
    assert.ok(String(answer.why).length > 0, "and it says why it could not resolve");
  });

  test("a malformed record refuses rather than passing for a tree that has none", () => {
    const broken = emptyDir();
    writeFileSync(join(broken, "driven-by.json"), "{ not json", "utf8");
    assert.throws(() => drivenBy(broken), "a record nobody can read must never read as 'not a driven project'");
  });
});

// THE ACTS HAVE TO BE REACHABLE, and a function nobody wired is not an act.
//
// THIS CHECKS THE WIRING RATHER THAN THE BEHAVIOUR, which is the same shape
// roots.test.ts uses for the root chooser. The behaviour is checked above by
// calling the producers; what this catches is the half nobody notices — a
// producer that works perfectly and that no surface can reach.
describe("both producing acts are reachable through the lane", () => {
  test("each is declared as a verb and each handler calls its producer", async () => {
    const src = readFileSync(new URL("../engine/tools.ts", import.meta.url), "utf8");
    for (const [verb, fn] of [
      ["se_produce_vehicle", "produceVehicle"],
      ["se_produce_project", "produceProject"],
    ]) {
      assert.ok(src.includes(`name: "${verb}"`), `${verb} must be declared as a lane verb`);
      // WHITESPACE-TOLERANT ON PURPOSE. The formatter decides where this call
      // breaks across lines, and a check a formatter can turn red is measuring
      // the formatter rather than the wiring.
      assert.match(
        src,
        new RegExp(`${fn}\\(\\s*session\\.workRoot\\(\\)`),
        `${verb}'s handler must call its producer against the tree the lane is working in`,
      );
    }
  });
});

// THE BUTTONS, CHECKED AS WIRING RATHER THAN AS BEHAVIOUR. Pressing one needs
// an editor, so what is mechanical here is that every leg of the wire exists —
// which is the leg-by-leg failure this project repeats most.
describe("the two buttons", () => {
  test("each is declared in the manifest and registered in the extension", () => {
    const manifest = readFileSync(new URL("../vscode/package.json", import.meta.url), "utf8");
    const ext = readFileSync(new URL("../vscode/src/extension.ts", import.meta.url), "utf8");
    for (const cmd of ["createVehicle", "createProject"]) {
      // DECLARED AND NOT REGISTERED is a palette entry that errors when pressed.
      // REGISTERED AND NOT DECLARED is a command nobody can find. Both halves,
      // or the button is not there.
      assert.ok(manifest.includes(`"$PRODUCT_ID$.${cmd}"`), `${cmd} must be declared in the extension manifest`);
      assert.ok(ext.includes(`"$PRODUCT_ID$.${cmd}"`), `${cmd} must be registered in the extension`);
    }
    // AND THE ACT ENDS WITH THE BUILDER INSIDE THE RESULT, in a new window,
    // leaving the one they pressed it from exactly as they left it.
    assert.match(ext, /vscode\.openFolder[\s\S]{0,200}forceNewWindow: true/, "the act must open what it produced in a NEW window");
  });

  test("the engine serves the acts on a route a button can reach", () => {
    const src = readFileSync(new URL("../engine/mirror.ts", import.meta.url), "utf8");
    assert.ok(src.includes('"/produce"'), "the mirror must serve /produce");
    assert.match(src, /produce\(\s*state\.session\.workRoot\(\)/, "and it must run the acts against the tree the walk is working in");
  });

  test("an unknown kind is refused rather than defaulted to one of the two", async () => {
    const { produce } = await import("../engine/produce.ts");
    // GUESSING WOULD MAKE THE WRONG KIND OF TREE from a typo, and a wrong tree
    // that looks finished is the failure this whole cluster is grouped around.
    assert.throws(
      () => produce(REPO, { kind: "vehcile", dest: emptyDir(), name: "Typo" }, "produce.test"),
      "a misspelled kind must refuse",
    );
  });
});

// WHAT A VEHICLE MADE ITS OWN (el-change-reporter).
//
// THE BASE IS THE VEHICLE'S OWN ROOT COMMIT. The element said this could not
// run at all under a vehicle sharing no commit with its engine — written
// against a clone, and wrong once the owner ruled for a copy. A copy has its
// own root commit, and that commit IS the engine's content as vendored.
describe("what a vehicle made its own", () => {
  test("a fresh vehicle has made nothing its own, and names the commit it was vendored as", () => {
    const inv = inventory(aVehicle().dest, "produce.test");
    assert.match(inv.since, /^[0-9a-f]{40}$/, "the base is a real commit in the vehicle's own repository");
    assert.deepEqual(inv.own, [], "a vehicle nobody has edited has changed nothing");
  });

  test("it derives what the owner wrote, changed and removed", () => {
    // ITS OWN VEHICLE, not the shared one. This case edits the tree, and a
    // shared fixture would make the case above depend on running first.
    const vehicle = produceVehicle(REPO, { dest: emptyDir(), name: "Night Heron", abbr: "NH" }, "produce.test");
    writeFileSync(join(vehicle.dest, "project", "guidance", "mine.md"), "# a card of my own\n", "utf8");
    writeFileSync(join(vehicle.dest, "README.md"), "# mine now\n", "utf8");
    rmSync(join(vehicle.dest, "RUNME.ps1"));
    execFileSync("git", ["add", "-A"], { cwd: vehicle.dest, stdio: "ignore" });
    execFileSync("git", ["commit", "-q", "-m", "mine"], { cwd: vehicle.dest, stdio: "ignore" });

    const inv = inventory(vehicle.dest, "produce.test");
    const how = (p: string): string | undefined => inv.own.find((c) => c.path === p)?.how;
    // THE WORDS ARE THE ELEMENT'S, not a surface's. "What did you make your
    // own", never "how far have you wandered" — a vehicle's owner changing
    // things is the entire value proposition, and a report phrased as damage
    // would make the product argue with its own promise.
    assert.equal(how("project/guidance/mine.md"), "written");
    assert.equal(how("README.md"), "changed");
    assert.equal(how("RUNME.ps1"), "removed");
  });

  test("a tree with no repository is refused rather than answered emptily", () => {
    // AN EMPTY ANSWER WOULD READ AS "you have changed nothing", which is a
    // wrong answer rather than an absent one.
    assert.throws(() => inventory(emptyDir(), "produce.test"), "the inventory is a repository query and says so");
  });
});
