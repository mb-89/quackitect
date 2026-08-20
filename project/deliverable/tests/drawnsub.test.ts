// A DRAWN SUB-MACHINE IS VIEWABLE (owner report 2026-08-08).
//
// Clicking enumerate-space in the drawing landed the reader back on the main
// machine. Every resolver the mirror had knew only GENERATED children —
// containers, archive decades, seeded machines — so a matrix row whose
// submachine names a .canvas was invisible, even though the walk could
// descend into it perfectly well.
//
// The walk and the view disagreeing about what exists is the worst shape for
// this: nothing errors, and the reader concludes the state is empty.
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { itFind, pinIteration } from "../engine/iterations.ts";
import { compileMachine } from "../engine/machines/compile.ts";
import { renderMirror } from "../engine/render.ts";
import { Session } from "../engine/session.ts";
import { checkDocs, freshRoot } from "./helpers.ts";

function gitInit(root: string): void {
  for (const a of [
    ["init"],
    ["config", "user.email", "se@test.local"],
    ["config", "user.name", "se test"],
    ["add", "-A"],
    ["commit", "-q", "-m", "seed"],
  ]) {
    const r = spawnSync("git", a, { cwd: root, encoding: "utf8", windowsHide: true });
    if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr}`);
  }
}

/** A root with one iteration open and its column pinned to major, which is
 *  the only column that carries enumerate-space. */
async function rootWithMajorIteration(): Promise<{ session: Session; root: string; id: string }> {
  const root = freshRoot();
  gitInit(root);
  // THE CHART'S OPTIONS EXIST BEFORE THE SESSION DOES. A morph-box field
  // declares `resolves: artifact`, so the two options the fixture draws must be
  // real nodes — and the corpus is stamped, so writing them after the session
  // has loaded it is a race the test would lose.
  for (const opt of ["opt-a", "opt-b"]) {
    const f = join(root, "project", "spec", "trace", "option", `${opt}.md`);
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(
      f,
      `---\nid: ${opt}\ntype: "[[option]]"\nstatement: one mechanism drawn for the container-paint test\ncluster: the-test\nfound_by: prior-art\nsource: the test fixture\n---\n\n## Mechanism\n\nIt stands so the chart has a cell to point at.\n`,
      "utf8",
    );
  }
  const session = new Session(root);
  for (let i = 0; i < 2; i++) await session.advance();
  checkDocs(session);
  for (let i = 0; i < 3; i++) await session.advance();
  session.setAutonomy(1);
  const id = String(session.iterationSeed("prove the drawn view", "a drawn sub-machine opens in the mirror").seeded);
  pinIteration(root, itFind(root, id), "major");
  return { session, root, id };
}

test("a matrix row's drawn sub-machine resolves to its own drawing", async () => {
  const { session } = await rootWithMajorIteration();
  const view = session.viewFor("enumerate-space");
  assert.ok(view !== undefined, "enumerate-space resolves to a view — undefined is the bug: the mirror falls back to main");
  assert.equal(view?.decl.id, "enumerate-space", "it takes the canvas's name, which is the state's name");
  assert.ok(
    view?.decl.states.some((s) => s.id === "find_prior_art"),
    "the compiled drawing carries the finders",
  );
});

// The breadcrumbs have to say where it hangs, or the reader cannot get back.
test("the drawn sub-machine's chain runs through its iteration", async () => {
  const { session } = await rootWithMajorIteration();
  const chain = session.viewChain("enumerate-space");
  assert.equal(chain[0], "main", "main leads");
  assert.equal(chain[chain.length - 1], "enumerate-space", "and it ends where it was clicked");
  assert.ok(chain.includes("iterations"), `the iterations container stands between them: ${chain.join(" > ")}`);
  assert.ok(chain.length >= 4, `the iteration itself is a crumb too: ${chain.join(" > ")}`);
});

// EVERY FINDER CAN BE SKIPPED, AND ONLY WITH A NAMED REASON (owner ruling
// 2026-08-08). A physical build nobody can execute from the lane is an
// honest skip; a blank one is a search nobody did wearing a search's
// clothes. The field is the same on all seven so a reader finds it in the
// same place every time.
test("every finder carries its applies field", () => {
  const root = freshRoot();
  const m = compileMachine(root, join(root, "project", "deliverable", "machines", "enumerate-space.canvas"));
  const finders = m.states.filter((s) => s.id.startsWith("find_"));
  assert.equal(finders.length, 7, "seven finders");
  for (const f of finders) {
    const applies = f.evidence_form.find((e) => e.name === "applies");
    assert.ok(applies !== undefined, `${f.id} carries no applies field — it cannot be skipped honestly`);
    assert.ok((applies?.guidance ?? "").includes("A SKIP WITH NO REASON IS NOT A SKIP"), `${f.id} does not say what a skip costs`);
  }
});

// ONE EVIDENCE LANGUAGE (owner ruling 2026-08-08). The canvas compiler used
// to have its own: one line per field, carrying a name, a description and
// required-or-optional, and nothing else. So a drawn state could never ask
// for what a matrix row asks for every day, and the five finders — the first
// drawn states that wanted a real form — compiled with empty ones.
test("a drawn state declares evidence exactly as a matrix row does", () => {
  const root = freshRoot();
  const m = compileMachine(root, join(root, "project", "deliverable", "machines", "enumerate-space.canvas"));
  const finder = m.states.find((s) => s.id === "find_prior_art");
  assert.ok(finder !== undefined, "the state compiles");
  assert.ok((finder?.evidence_form.length ?? 0) > 0, "and it carries its form — empty is the bug this test exists for");

  const options = finder?.evidence_form.find((f) => f.name === "options");
  assert.ok(options !== undefined, "the options field is there");
  assert.equal(options?.template, "refs", "carrying a template, which the old language could not say");
  assert.equal(options?.of, "option", "and an item type, which it also could not say");
  assert.ok((options?.guidance ?? "").includes("meth-prior-art"), "and its guidance, which it could not say either");
});

// THE DRAWING IS GENERATED, top to bottom, so a fan's bar reads as a bar.
test("the drawn view is laid out like an iteration, not from authored coordinates", async () => {
  const { session } = await rootWithMajorIteration();
  const view = session.viewFor("enumerate-space");
  assert.ok(view !== undefined);
  const at = (id: string): { x: number; y: number } => {
    const n = (view?.canvas.nodes ?? []).find((e) => e.id === `n-${id}`);
    assert.ok(n !== undefined, `${id} is drawn`);
    return { x: n?.x ?? 0, y: n?.y ?? 0 };
  };
  const legs = [
    "find_prior_art",
    "find_contradiction",
    "find_analogy",
    "find_without",
    "find_by_heuristic",
    "find_by_transforming",
    "find_by_probing",
  ];

  // Top to bottom: start above the fan, the end below it.
  for (const leg of legs) assert.ok(at("start").y < at(leg).y, `start sits above ${leg}`);
  for (const leg of legs) assert.ok(at(leg).y < at("end").y, `${leg} sits above the end`);

  // Side by side: five independent legs share a row and differ only in x.
  const ys = new Set(legs.map((l) => at(l).y));
  assert.equal(ys.size, 1, "the legs share one row, because none depends on another");
  assert.equal(new Set(legs.map((l) => at(l).x)).size, legs.length, "and they stand apart across it");
});

// A seeded sub-machine must NOT take the drawn path. Its shape varies per
// record, so compiling a shared machines/ file for it would serve the wrong
// thing.
//
// WHAT IT SERVES INSTEAD IS THE PIN'S PLACEHOLDER (owner ruling, b9). Pinning
// writes a two-state start-to-end stub into the record for every seeded
// sub-machine, so no route refuses over a drawing a later state has not
// authored yet — engine/iterations.ts, "EVERY SEEDED DRAWING GETS ITS
// PLACEHOLDER IN THE PIN'S OWN ACT".
//
// THIS TEST USED TO ASSERT undefined, which was right before the scaffolds
// existed. The rule it guards did not move: never a machines/ drawing.
test("a seeded sub-machine gets the pin's placeholder, never a machines/ drawing", async () => {
  const { session } = await rootWithMajorIteration();
  const view = session.viewFor("build-steps");
  assert.ok(view !== undefined, "the placeholder resolves — the pin wrote one so the route stays drawable");
  assert.deepEqual(
    view?.decl.states.map((s) => s.id),
    ["start", "end"],
    "and it is the STUB, not a compiled drawing — build-chunks has no authored states yet",
  );
  assert.match(
    String(view?.decl.states.find((s) => s.id === "start")?.guidance),
    /Nothing was seeded, explicitly/,
    "the stub says why it is empty, so a reader who opens it is not left guessing",
  );
});

// A STATE THAT CANNOT BE OPENED MUST NOT LOOK LIKE ONE THAT CAN (owner report
// 2026-08-08). Double-clicking an unseeded sub-machine navigated to a view the
// resolver could not find, and the resolver quietly served the MAIN machine —
// so the reader was thrown out of the drawing they were reading.
//
// Nothing errored, which is what made it read as a feature.
//
// THE RULE IS UNCHANGED; WHAT MOVED IS WHICH STATES RESOLVE. Since the pin
// scaffolds a placeholder for every seeded sub-machine (owner ruling, b9), a
// pinned iteration holds none that cannot be opened — so both cases below now
// open, and the empty one explains itself once opened.
test("a sub-machine is double-clickable exactly when its drawing resolves", async () => {
  const { session, root } = await rootWithMajorIteration();
  // The iteration is the crumb just above the drawn sub-machine.
  const iteration = session.viewChain("enumerate-space").at(-2) ?? "";
  const html = renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", iteration);

  const marked = (id: string): { open: boolean; shut: boolean } => ({
    open: html.includes(`data-sub="${id}"`),
    shut: new RegExp(`data-detail="state:${id}"[^>]*data-nosub="1"`).test(html),
  });

  const drawn = marked("enumerate-space");
  assert.equal(drawn.open, true, "a drawn sub-machine has its drawing, so it opens");

  // run-candidates is SEEDED: build-chart authors its drawing, and build-chart
  // has not run. The pin left it a placeholder, so it opens — onto a stub that
  // says nothing was seeded yet, which is the honest answer.
  const seeded = marked("run-candidates");
  assert.equal(seeded.open, true, "the pin's placeholder resolves, so a seeded sub-machine opens too");
  assert.equal(seeded.shut, false, "and it is not marked unopenable, because it is not");
  assert.match(
    String(session.viewFor("run-candidates")?.decl.states.find((s) => s.id === "start")?.guidance),
    /Nothing was seeded, explicitly/,
    "what opens is the stub, and the stub says why it is empty",
  );

  // NOT PINNED HERE: the shut marker itself. render.ts still writes
  // data-nosub="1" for a sub-machine whose drawing does not resolve, and that
  // branch is unchanged — but a pinned iteration no longer holds such a state,
  // so this fixture cannot reach it. Covering it again means rendering a
  // machine view outside a pinned record, which is its own piece of work.

  // The DOUBLE BORDER is a different fact and it stays: the state IS a
  // sub-machine whether or not its drawing exists yet.
  assert.match(html, /data-detail="state:run-candidates"[\s\S]{0,400}class="[^"]*inner"/, "it still draws as a sub-machine");
});

// A WALKED SUB-MACHINE MUST NOT LOOK UNSTARTED (owner report 2026-08-09).
// From trunk, i1 read "not done" although every claim under its last gate
// stood signed and blessed on disk. Two mechanisms, both fixed together:
// a drawn sub-machine browsed from the desk resolved to NO iteration (only
// the bound record answered), and a container or an end carries no claim of
// its own, so nothing record-backed could ever paint them.
test("a finished sub-machine does NOT paint its container while the container's own inputs are grey", async () => {
  const { session, root, id } = await rootWithMajorIteration();
  const view = session.viewFor("enumerate-space");
  assert.ok(view !== undefined);

  // Leave every claimful state signed on disk, the way a finished walk does.
  for (const s of view.decl.states.filter((x) => x.evidence_form.length > 0)) {
    // ONE TREE SINCE i34: a record's evidence stands under the root.
    const ev = join(root, "project", "spec", "iterations", id, "evidence", `${s.id}.md`);
    mkdirSync(dirname(ev), { recursive: true });
    // Each template gets the cheapest content its checks accept: a choice
    // field wants its literal option with a reason, a chart wants two drawn
    // rows, and a refs field reads `- none` as an honest empty (free prose
    // is refused there — "no references").
    const filled = (f: { template?: string }): string => {
      if (f.template === "choice-with-rationale") return "yes — proven for the container-paint test";
      if (f.template === "morph-box") return "| [[opt-a]] | one | drawn for the test | x |\n| [[opt-b]] | two | drawn for the test | x |";
      return "- none — proven for the container-paint test";
    };
    const body = s.evidence_form.map((f) => `## ${f.name}\n\n${filled(f)}\n`).join("\n");
    writeFileSync(ev, `---\nsigned_off: 2026-08-09T10:00:00.000Z\nby: agent\nauthors: human\n---\n\n${body}`, "utf8");
  }

  // The interior is green FROM THE DESK — nothing bound, no live run.
  const green = new Set(session.recordDone(view.decl));
  for (const s of view.decl.states.filter((x) => x.evidence_form.length > 0)) {
    assert.ok(green.has(s.id), `${s.id} stands green from the desk — grey means the sub-machine found no iteration`);
  }

  // A CONTAINER OBEYS THE SAME RIPPLE AS EVERY OTHER STATE (owner ruling
  // 2026-08-09). Its interior is finished, but nothing upstream of it in the
  // HOST is signed here — so it stays grey.
  //
  // THIS TEST USED TO ASSERT THE OPPOSITE, and that was the defect the owner
  // reported three times: enumerate-space drew green above a grey
  // derive-criteria feeding it. The renderer painted a container from its own
  // interior alone, which is a second rule, and two rules is how a drawing
  // comes to contradict itself.
  const iteration = session.viewChain("enumerate-space").at(-2) ?? "";
  const host = renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", iteration);
  assert.doesNotMatch(
    host,
    // THE CLASS CAN CARRY A THIRD WORD. A law-proven green renders
    // `class="state done proven"`, so matching the closing quote would turn a
    // second kind of green into a false red here.
    /data-detail="state:enumerate-space"[^>]*>[\s\S]{0,300}?class="state done/,
    "a container whose feeders are grey stays grey, however finished its interior",
  );

  // NOT PINNED HERE: the positive case, where the whole host chain is signed
  // and the container turns green. Building a fully green host fixture means
  // satisfying every template's own checks across the iteration, which is its
  // own piece of work. The interior assertion above still proves the
  // sub-machine is seen from the desk, which was the original bug.

  // And the sub-machine's own view paints its END green.
  const sub = renderMirror({ session, root, lastPacket: undefined, mode: "manual" }, "machine", "enumerate-space");
  assert.match(
    sub,
    /data-detail="state:end"[^>]*>[\s\S]{0,300}?class="state done/,
    "its end is green — the machine completed on the record",
  );
});

// THE DESK IS NEVER BEHIND THE WORK (owner emergency ruling 2026-08-11, same
// day as and superseding the descend-however-deep rule for walks standing
// OUTSIDE the record). Every idle door is double-headed and the return halves
// compile as alternative; counting them as feeders made the whole machine
// upstream of front_desk, so boot descended into the open iteration and
// served the record's reading as its own. From outside a record, the
// objective of a desk aim IS the desk.
//
// NOT PINNED HERE: the wedge the descend rule fixed — a walk standing on a
// finished fan leg INSIDE the record still learns its owed sibling, via the
// active-chain ask in subObjective. Standing a fixture walk mid-record means
// signing its gates one by one, which is its own piece of work.
test("an aim at the front desk never descends into an open record", async () => {
  const { session } = await rootWithMajorIteration();
  const r = session.route("front_desk");
  assert.equal(r.target, "front_desk", `the aim stands — got ${r.target}`);
  for (const s of r.steps) {
    assert.ok(!s.to.startsWith("iterations/"), `the route to the desk enters ${s.to}`);
  }
});

// THE ROUTE CARRIES THE WHOLE FAN (owner, 2026-08-09). One drawn path named
// one leg of the three-way join and the walk met the other legs one refusal
// at a time. The route now reports every unsigned leg of a bar it runs
// through or feeds, and the drawing draws them all.
test("the route reports a bar's owed legs as its fan", async () => {
  const { session } = await rootWithMajorIteration();
  const chain = session.viewChain("enumerate-space").slice(1);
  const r = session.route(`${chain.join("/")}/build_chart`);
  const bar = r.fan.find((f) => f.at.endsWith("/build_chart"));
  assert.ok(bar !== undefined, `the bar reports its fan — got ${JSON.stringify(r.fan)}`);
  assert.ok(bar.legs.length >= 6, `the unsigned finder legs all ride along — got ${JSON.stringify(bar.legs)}`);
});
