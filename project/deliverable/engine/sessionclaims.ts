// CLAIMS, STATE FORMS AND WHAT TURNED GREY.
//
// Lifted out of Session whole. A claim is a signature over a corpus: it is
// made on a state form, it stands while its evidence still passes its own
// checks, and it falls when the corpus underneath it moves. Everything about
// making one, reading one, and explaining why one is grey lives here.
//
// It takes the walk as a host — the paths, where it stands, and the signal
// that something changed — and holds no state of its own.
//
// see dsp-evidence-forms.md#does-a-standing-claim-still-pass-its-own-form
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { brandPath } from "./brand.ts";
import { CLAUSES, Rejection } from "./errors.ts";
import { contentHash } from "./hash.ts";
import { claimFeeders, downstreamCone, fallenChain, type MachineDecl, reopenStates, type StateDecl } from "./machine.ts";
import { compileMachineCached, resolveRef } from "./machines/compile.ts";

/** see dsp-walk-machine.md#the-state-a-recorded-visit-names */
export function visitState(visit: string): string {
  return visit.split("@")[0].split("/").pop() ?? "";
}

import { replayFile } from "./decisions.ts";
import { shortId } from "./expmachine.ts";
import {
  formTemplatePath,
  lintForm,
  reopenedAfterSigning,
  stripComments,
  stripSignedOff,
  withAmended,
  withAuthor,
  withBless,
  withChecked,
  withFieldContent,
  withFrontmatter,
  withFrontmatterList,
  withReopened,
} from "./forms.ts";
import { pendingNotes } from "./inbox.ts";
import { type Iteration, iterationDrift, itList, itShortId, pinIsStale, repinColumn } from "./iterations.ts";
import { parseStateNote, readNode, section, writeNode } from "./notes.ts";
import { seDir } from "./paths.ts";
import { scanGuidance } from "./pull.ts";
import { levelName, loadLevels } from "./scale.ts";
import { type AmendOp, type Blocker, claimTime, FEEDS_DOWNSTREAM, type GreenPass, mainMachinePath, type Session } from "./session.ts";
import {
  amendOps,
  bindChart,
  bindView,
  mintFlipTripwires,
  mintScenarioEntries,
  refFacts,
  refPaths,
  stateFormChecked,
  stateFormScaffold,
} from "./sessionforms.ts";
import { elementMatrixArgs, nodeField, nodeList, stateFormFields, stateFormModel, tableRow } from "./stateform.ts";
import { claimProblems, templateOwed, templateProblems } from "./stateform-problems.ts";
import { buildPortableForm, type EmbeddedDoc, parseIsland } from "./stateform-sheet.ts";
import { corpusVersion, loadTrace, noteOf, traceDir } from "./trace.ts";

/** What the claims need of the walk: where things live, where it stands, and
 *  the one call that tells a held mirror something moved. Session satisfies
 *  it structurally. */
export type ClaimsHost = Pick<
  Session,
  | "machineRoot"
  | "workRoot"
  | "traceRoot"
  | "declIteration"
  | "currentMachine"
  | "machine"
  | "subs"
  | "top"
  | "leaves"
  | "state"
  | "active"
  | "bound"
  | "views"
  | "forgetRoute"
  | "notifyChange"
  | "owesASignature"
  | "repinSwap"
  | "rewalk"
  | "tierFor"
  | "autonomy"
>;

export class Claims {
  /** Claim verdicts, keyed to their inputs. Static on purpose: it is a pure
   *  function of (corpus, body, form), so two sessions on one root reach the
   *  same answer and there is nothing session-shaped about it. */
  private static readonly VERDICTS = new Map<string, boolean>();

  /** A write changed the corpus — every cached verdict is now a guess. */
  static forgetVerdicts(): void {
    Claims.VERDICTS.clear();
  }

  private readonly host: ClaimsHost;

  constructor(host: ClaimsHost) {
    this.host = host;
  }

  /** Open points of the BOUND record's decision graph — the jsonl is the
   *  source, so the check survives engine reloads. Scoped to the work's
   *  own states. */
  openRecordPoints(): { id: string; visit: string; brief: string }[] {
    const sid = shortId(this.host.bound!.id);
    const recorded = replayFile(join(this.host.bound!.path, "project", "spec", "expeditions", this.host.bound!.id, "decisions.jsonl"));
    // see dsp-walk-machine.md#a-visit-is-recorded-qualified
    return recorded.open.filter((n) => visitState(n.visit) === sid || visitState(n.visit) === `${sid}-leave`);
  }

  /** Pending notes whose text carries one of the markers — what a
   *  no_pending_note condition holds against ("needs retro" gates
   *  start_iteration; the retro's drain clears them). */
  blockingNotes(markers: string[]): { ref: string; text: string }[] {
    return pendingNotes(seDir(this.host.machineRoot()))
      .filter((n) => markers.some((m) => n.text.toLowerCase().includes(m.toLowerCase())))
      .map((n) => ({ ref: n.ref, text: n.text }));
  }

  /** see dsp-walk-machine.md#a-reopened-claim-is-owed-again */
  formReopened(name: string): boolean {
    try {
      const it = this.host.declIteration(this.host.currentMachine());
      if (it === undefined) return false;
      const fm = noteOf(this.evidenceAbs(it, name))?.frontmatter;
      return fm !== undefined && reopenedAfterSigning(fm);
    } catch {
      return false; // an unreadable claim is the tick's refusal to name, not this one's
    }
  }

  /** THE CORPUS CHECK'S VERDICT ON ONE STATE, or an empty list.
   *
   *  A claim can be complete, signed, and still refused: the form lint asks
   *  whether the fields are filled, and the corpus check asks whether what
   *  they say survives against the trace as it now stands. The second is the
   *  one that keeps a walk from leaving a state, and it had no voice anywhere
   *  the walk could hear it.
   *
   *  EMPTY MEANS NOTHING TO SAY — either the claim stands, or the state has no
   *  claim, or it could not be read. None of those is a stall this can explain,
   *  and inventing a reason would be worse than the silence it replaces. */
  claimStall(stateId: string): string[] {
    try {
      const m = this.host.currentMachine();
      const bare = stateId.slice(stateId.lastIndexOf("/") + 1);
      const decl = m.states.find((s) => s.id === bare);
      if (decl === undefined || decl.evidence_form.length === 0) return [];
      if (new Set(this.recordDone(m)).has(bare)) return [];
      const it = this.host.declIteration(m);
      if (it === undefined) return [];
      const body = noteOf(this.evidenceAbs(it, bare))?.body;
      if (body === undefined) return [];
      return claimProblems(this.host.traceRoot(it), decl, body, loadTrace(this.host.traceRoot(it)));
    } catch {
      return [];
    }
  }

  /** A CLAIM THAT WILL NOT STAND IS THE OTHER WAY A ZERO-STEP ROUTE HAPPENS.
   *
   *  The objective is the work owed next. When it is the state the walk is
   *  standing IN, the route is legitimately zero steps — and that means one of
   *  two opposite things:
   *
   *  - the state is done, and the walk has arrived;
   *  - the state's claim is refused, so the walk cannot leave it and the
   *    objective can never move off it.
   *
   *  Both used to answer "the target is where the walk already stands". The
   *  second is a STALL wearing an arrival's words, and it is SILENT: no
   *  completion is attempted, so no guard fires to explain it.
   *
   *  i3 sat in exactly this for an afternoon over two unclaimed engine files,
   *  with the sweep's verdict computed on every pull and shown nowhere.
   *
   *  THE FORM LINT CANNOT SEE IT. The form was met and signed; only the corpus
   *  check knows. This is the one place in the pull that can ask. */
  stalledClaim(
    r: { found: boolean; from?: string },
    head: () => Record<string, unknown>,
    extra: () => Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!r.found) return undefined;
    const at = r.from ?? this.host.active()[0] ?? "";
    const stalled = this.claimStall(at);
    if (stalled.length === 0) return undefined;
    return {
      pull: "do",
      ...head(),
      stopped_at: at,
      refusal: {
        kind: "rejected",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${at}'s claim to stand, so the walk can leave it`,
        got: `the route cannot move: ${at} IS the next work owed, and its claim does not pass its own checks — ${stalled.join(" · ")}`,
        remedy: {
          tool: "se_pull",
          args: {},
          note: "fix what is named, then submit the form again — the claim re-stamps and the route opens",
        },
        source: "engine/session.ts route",
      },
      do: "the stopped step says what it wants — do that, then pull again",
      ...extra(),
    };
  }

  /** ANY state's form is always fetchable (owner ruling 2026-08-04) —
   *  for export to a colleague wherever the walk stands. The machine on
   *  display resolves the name; the walk's machine is the default. */
  formMachine(machineId?: string): MachineDecl {
    if (machineId === undefined || machineId === "" || machineId === this.host.currentMachine().id) return this.host.currentMachine();
    return this.host.views.viewFor(machineId)?.decl ?? this.host.currentMachine();
  }

  /** see dsp-walk-machine.md#the-dispatch-between-the-two-form-kinds */
  isStateForm(name: string, m: MachineDecl = this.host.currentMachine()): boolean {
    if (existsSync(join(this.host.machineRoot(), formTemplatePath(name)))) return false;
    return m.states.some((s) => s.id === name && (s.kind === "work" || s.kind === "gate"));
  }

  /** Where the instance lives: the record whose machine carries the state
   *  (its evidence folder ON ITS BRANCH), the bound record as fallback,
   *  or the session store when neither exists. */
  stateFormHome(name: string, m: MachineDecl = this.host.currentMachine()): { instanceAbs: string; instanceRel: string } {
    const it = itList(this.host.machineRoot()).find((x) => x.open && itShortId(x.id) === m.id);
    if (it !== undefined) {
      const rel = `project/spec/iterations/${it.id}/evidence/${name}.md`;
      return { instanceAbs: join(it.path, rel), instanceRel: rel };
    }
    if (this.host.bound !== undefined) {
      const kind = this.host.bound.branch.startsWith("it/") ? "iterations" : "expeditions";
      const rel = `project/spec/${kind}/${this.host.bound.id}/evidence/${name}.md`;
      return { instanceAbs: join(this.host.workRoot(), rel), instanceRel: rel };
    }
    const rel = `.se/forms/${name}.md`;
    return { instanceAbs: join(this.host.machineRoot(), rel), instanceRel: rel };
  }

  stateFormState(name: string, m: MachineDecl = this.host.currentMachine()): StateDecl {
    const s = m.states.find((x) => x.id === name);
    if (s === undefined) {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: `a state of ${m.id} with an evidence form`,
        got: name,
        remedy: { tool: "se_pull", args: {}, note: "the walk's own states carry the forms" },
        source: "engine/session.ts stateform",
      });
    }
    return s;
  }

  brandName(): string {
    try {
      const b = JSON.parse(readFileSync(brandPath(this.host.machineRoot()), "utf8")) as {
        name?: string;
      };
      return typeof b.name === "string" ? b.name : "se";
    } catch {
      return "se";
    }
  }

  stateFormHeader(name: string, raw: string | undefined, m: MachineDecl = this.host.currentMachine()): Record<string, string> {
    const fm = raw === undefined ? ({} as Record<string, unknown>) : parseStateNote(raw).frontmatter;
    // The priority wears its RUNG NAME (owner ruling 2026-08-04) — the
    // numerical scale stays internal.
    const s = m.states.find((st) => st.id === name);
    return {
      project: this.brandName(),
      state: `${m.id}/${name}`,
      ...(s !== undefined ? { level: levelName(loadLevels(this.host.machineRoot()), s.priority) } : {}),
      ...(this.host.bound !== undefined ? { record: this.host.bound.id } : {}),
      "signed off": typeof fm.signed_off === "string" ? fm.signed_off.slice(0, 10) : "",
      by: typeof fm.by === "string" ? fm.by : "",
    };
  }

  /** see dsp-walk-machine.md#the-idpath-map-for-a-documents-own-record */
  docRefPaths(p: string): Record<string, string> {
    try {
      const m = /(?:^|[\\/])iterations[\\/]([^\\/]+)[\\/]/.exec(p);
      const own =
        m === null
          ? undefined
          : itList(this.host.machineRoot())
              .filter((x) => x.open)
              .find((x) => x.id === m[1]);
      return refPaths(this.host, own);
    } catch {
      return {};
    }
  }

  stateFormGet(name: string, m: MachineDecl = this.host.currentMachine()): Record<string, unknown> {
    const s = this.stateFormState(name, m);
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    const model = stateFormModel(
      this.host.machineRoot(),
      scanGuidance(this.host.machineRoot()),
      m,
      s,
      this.stateFormHeader(name, raw, m),
      raw,
      this.host.traceRoot(this.host.declIteration(m)),
      h.instanceAbs,
    );
    // The section lint plus the TEMPLATE checks — generic engine code,
    // configured per field in the templates' own markdown. One verdict
    // for both hands: the page's problems list and the gate's refusal.
    // The named-form lint judges a status line; state forms have none —
    // a synthetic one keeps the SECTION checks and mutes the dead field.
    // A LEGACY instance may still carry its own; never inject a second.
    const lint = lintForm(
      model.template,
      raw === undefined || /^status: /m.test(raw) ? raw : raw.replace(/^---\n/, "---\nstatus: done\n"),
      "",
    );
    const fills: Record<string, string> = {};
    if (raw !== undefined) {
      const body = parseStateNote(raw).body;
      for (const f of model.template.fields) fills[f.name] = stripComments(section(body, f.name)).trim();
    }
    // A BOUND FIELD IS REBUILT FROM THE NODES, and whatever the file holds is
    // ignored. That is the read half of the two-way view: edit the note and
    // the form agrees at the next look, with nothing to synchronise.
    //
    // It also settles the check. `met` asks whether every line has an answer,
    // and the lines now come from the register — so the state stands exactly
    // while every standing node carries its frontmatter, which is the claim
    // the state was making all along.
    const boundFills = bindView(this.host, s, model, m);
    Object.assign(fills, boundFills);
    // THE FORM'S OWN RECORD, not the session's binding. The mirror renders an
    // iteration's form from the desk with nothing bound, so resolving against
    // the binding made a node the record owns invisible on screen while the
    // same form passed its submit from inside the walk.
    const forIt = this.host.declIteration(m);
    const tp = templateProblems(model, fills, this.host.traceRoot(forIt));
    // see dsp-walk-machine.md#an-owed-box-is-not-green
    const owed = templateOwed(model, fills, this.host.traceRoot(forIt));
    const fmData = raw === undefined ? ({} as Record<string, unknown>) : parseStateNote(raw).frontmatter;
    return {
      state_form: true,
      ...model,
      // A REFERENCE IS AN ADDRESS, so the surface can open it. Without the
      // path the reader sees an id and has to go hunting for the file it
      // names, which is the whole reason references were hard to review.
      ref_paths: refPaths(this.host, forIt),
      // AND THE FACTS BEHIND THEM. A card asking which of two rows matters
      // more cannot be answered from two ids, and opening both notes for
      // every question is how a sixty-pair pass becomes a two-hour errand.
      ref_facts: refFacts(this.host, forIt),
      machine: m.id,
      checked: stateFormChecked(raw),
      active: this.stateFormActive(name, m),
      gate: s.kind === "gate",
      // A present-but-EMPTY signed_off is unsigned. Reading the key's mere
      // presence as a stamp is the same defect as withSignedOff's, mirrored.
      signed: typeof fmData.signed_off === "string" && fmData.signed_off.trim() !== "",
      // THE SIGNATURE SURVIVES A REOPEN, so the two are reported apart. The
      // page still shows who signed and when; `reopened_after` is what makes
      // the form owed again and the state grey.
      reopened: typeof fmData.reopened === "string" ? fmData.reopened : "",
      reopened_after: reopenedAfterSigning(fmData),
      // see dsp-walk-machine.md#a-recheck-is-not-a-rewrite
      recheck: reopenedAfterSigning(fmData)
        ? {
            was_signed: typeof fmData.signed_off === "string" ? fmData.signed_off : "",
            why: typeof fmData.reopened === "string" ? fmData.reopened : "",
            do: "THIS CLAIM STOOD BEFORE. Read what is already written, decide only whether the change above moved it, and submit if it still holds. Rewrite ONLY the fields the change actually touched. Submitting re-runs every check and re-signs.",
          }
        : undefined,
      amended: typeof fmData.amended === "string" ? fmData.amended : "",
      bless: typeof fmData.bless === "string" ? fmData.bless : "",
      instance: h.instanceRel,
      exists: raw !== undefined,
      ...lint,
      // THE BOUND FIELDS REACH THE SURFACE TOO. The lint reads the raw file,
      // which for a bound field holds nothing — the derived table is the
      // content, and without this override the mirror drew every cell empty.
      fields: lint.fields.map((f) =>
        boundFills[f.name] === undefined ? f : { ...f, content: boundFills[f.name], filled: boundFills[f.name].trim() !== "" },
      ),
      problems: [...lint.problems, ...tp],
      met: lint.met && tp.length === 0,
      // NAMED, NOT JUST COUNTED. A debt visible only as a number invites a
      // reader to skim past it; the ref is what lets the next person go
      // look (owner ruling 2026-08-13).
      owed_count: owed.length,
      owed,
    };
  }

  /** see dsp-walk-machine.md#green-from-the-record */
  evidenceAbs(it: Iteration, state: string): string {
    return join(it.path, `project/spec/iterations/${it.id}/evidence/${state}.md`);
  }

  standingClaims(decl: MachineDecl, it: Iteration, claimful: Set<string>, pass: GreenPass, paint = false): Set<string> {
    // THE CORPUS IS LOADED ONCE, NOT ONCE PER STATE. claimProblems takes it as
    // an argument for exactly this reason and recordDone was not passing it,
    // so every claimful state re-read the whole trace — about fifteen full
    // corpus loads per paint.
    //
    // That was survivable while recordDone only ran when something painted. It
    // stopped being survivable the moment the ROUTE started calling it, which
    // put it on every packet: se_aim measured 2936 ms and the next pull never
    // returned. The engine is single-threaded, so a synchronous scan that long
    // does not slow the server down — it stops it answering.
    const traceRoot = this.host.traceRoot(it);
    // ONCE PER OPERATION, not once per machine. Both of these sweep the whole
    // corpus; the pass carries them so the sweep happens on the first machine
    // and nowhere after it.
    pass.corpus ??= new Map();
    let corpus = pass.corpus.get(traceRoot);
    if (corpus === undefined) {
      corpus = loadTrace(traceRoot);
      pass.corpus.set(traceRoot, corpus);
    }
    // see dsp-the-goal-binds-the-walk.md#the-verdict-is-keyed-to-its-inputs
    pass.version ??= new Map();
    let version = pass.version.get(traceRoot);
    if (version === undefined) {
      version = corpusVersion(traceRoot);
      pass.version.set(traceRoot, version);
    }
    const standing = new Set<string>();
    for (const s of decl.states) {
      if (!claimful.has(s.id)) continue;
      const abs = this.evidenceAbs(it, s.id);
      if (!existsSync(abs)) continue;
      try {
        const note = noteOf(abs);
        if (note === undefined) continue;
        const fm = note.frontmatter;
        if (typeof fm.signed_off !== "string") continue;
        // see dsp-walk-machine.md#the-signature-time-comes-out-of-this-read
        pass.times ??= new Map();
        pass.times.set(s.id, claimTime(fm));
        // A REOPEN IS THE FOURTH WAY A CLAIM STOPS STANDING. The other three
        // are the claim's own doing; this one is somebody deciding it must be
        // re-earned. The downstream ripple is free — the fixed point below
        // drops everything fed by a state that just left this set.
        if (reopenedAfterSigning(fm)) continue;
        const key = [traceRoot, s.id, version, contentHash(note.body), contentHash(JSON.stringify(s.evidence_form))].join("\0");
        let failed = Claims.VERDICTS.get(key);
        if (failed === undefined) {
          // this.host.traceRoot(it) IN FULL, not the local. A guard test greps for
          // exactly this spelling, because a claim check resolving against
          // the wrong record is the drift it exists to catch.
          failed = claimProblems(this.host.traceRoot(it), s, note.body, corpus).length > 0;
          Claims.VERDICTS.set(key, failed);
        }
        if (failed) continue;
        // see dsp-walk-machine.md#green-means-submitted
        if (!paint && s.kind === "gate" && !(typeof fm.bless === "string" && fm.bless.startsWith("blessed"))) continue;
        standing.add(s.id);
      } catch {
        // an unreadable claim colours nothing
      }
    }
    for (const id of this.lawProvenClaims(decl, it, corpus, version, traceRoot)) standing.add(id);
    return standing;
  }

  /** A LAW-PROVEN STATE HAS NO FORM TO SIGN — its claim IS its law
   *  (rigor-matrix's refuseBadRow names the set). Green is the law passing,
   *  recomputed against the corpus like any other verdict. */
  lawProvenClaims(decl: MachineDecl, it: Iteration, corpus: ReturnType<typeof loadTrace>, version: string, traceRoot: string): Set<string> {
    const standing = new Set<string>();
    for (const s of decl.states) {
      if (s.evidence_form.length > 0 || s.submachine !== undefined) continue;
      if (!s.id.endsWith("fill-story-evidence")) continue;
      const key = [traceRoot, s.id, version, "law-only"].join("\0");
      let failed = Claims.VERDICTS.get(key);
      if (failed === undefined) {
        failed = claimProblems(this.host.traceRoot(it), s, "", corpus).length > 0;
        Claims.VERDICTS.set(key, failed);
      }
      if (!failed) standing.add(s.id);
    }
    return standing;
  }

  /** see dsp-walk-machine.md#green-is-calculated */
  drawingDone(id: string, seen: Set<string>, pass: GreenPass, paint = false): boolean {
    if (seen.has(id)) return false; // a cycle proves nothing
    seen.add(id);
    // AN UNSEEDED DRAWING PROVES NOTHING, and asking for one THROWS: viewFor
    // raises the typed refusal that tells an agent to seed it. That refusal is
    // right where the walk asked to enter, and wrong here — this is only
    // colouring a box, and a question about green must never take the walk
    // down with it.
    let sub: MachineDecl | undefined;
    try {
      sub = this.host.views.viewFor(id)?.decl;
    } catch {
      return false;
    }
    if (sub === undefined) return false;
    const done = new Set(this.recordDone(sub, seen, pass, paint));
    for (const s of sub.states) {
      if (s.evidence_form.length === 0 && s.submachine === undefined) continue;
      if (!done.has(s.id)) return false;
    }
    // see dsp-walk-machine.md#an-empty-drawing-is-vacuously-finished
    return true;
  }

  /** see dsp-walk-machine.md#collect-the-input-once */
  static newPass(): GreenPass {
    return { done: new Map() };
  }

  /** THE FEEDERS THIS CLAIM IS OLDER THAN — the ripple's time half, seen from
   *  one state rather than across the graph. Empty means nothing moved under
   *  it, which is the ordinary answer. */
  staleFeeders(stateId: string): string[] {
    const m = this.host.currentMachine();
    const it = this.host.declIteration(m);
    if (it === undefined) return [];
    const claimful = new Set(m.states.filter((s) => s.evidence_form.length > 0).map((s) => s.id));
    const feeders = claimFeeders(m, stateId, claimful);
    if (feeders.length === 0) return [];
    // ASKED ONCE, ABOUT ONE STATE. This is the diagnostic path rather than the
    // walk's, so it reads only the two ends it compares.
    const times = this.signedTimes(it, [stateId, ...feeders]);
    const mine = times.get(stateId);
    if (mine === undefined) return [];
    return feeders.filter((f) => (times.get(f) ?? "") > mine);
  }

  /** WHEN EACH STANDING CLAIM WAS SIGNED, for the staleness half of the
   *  ripple. ABSENT IS NOT ZERO: a state with no signature is left out of the
   *  map rather than given an empty time, so it can never read as older than
   *  everything. An unsigned claim is not in the green set to begin with. */
  signedTimes(it: Iteration, ids: Iterable<string>): Map<string, string> {
    const out = new Map<string, string>();
    for (const id of ids) {
      const fm = noteOf(this.evidenceAbs(it, id))?.frontmatter;
      const at = fm === undefined ? "" : claimTime(fm);
      if (at !== "") out.set(id, at);
    }
    return out;
  }

  recordDone(decl: MachineDecl, seen: Set<string> = new Set(), pass: GreenPass = Claims.newPass(), paint = false): string[] {
    const memoKey = paint ? `${decl.id}\0paint` : decl.id;
    const memo = pass.done.get(memoKey);
    if (memo !== undefined) return memo;
    const it = this.host.declIteration(decl);
    if (it === undefined) return [];
    // see dsp-walk-machine.md#the-ripple-covers-containers-too
    const claimful = new Set(decl.states.filter((s) => this.host.owesASignature(s, it)).map((s) => s.id));
    const green = this.standingClaims(decl, it, claimful, pass, paint);
    for (const s of decl.states) {
      if (s.submachine === undefined) continue;
      claimful.add(s.id);
      if (this.drawingDone(s.id, seen, pass, paint)) green.add(s.id);
    }
    // see dsp-walk-machine.md#green-stops-at-the-first-input-that-is-not
    const signedAt = pass.times ?? new Map<string, string>();
    for (let changed = true; changed; ) {
      changed = false;
      for (const id of [...green]) {
        const feeders = claimFeeders(decl, id, claimful);
        const mine = signedAt.get(id);
        const stale = mine !== undefined && feeders.some((f) => (signedAt.get(f) ?? "") > mine);
        if (!stale && feeders.every((f) => green.has(f))) continue;
        green.delete(id);
        changed = true;
      }
    }
    const done = [...green];
    // The mechanical start was necessarily walked on the way to any claim.
    if (done.length > 0) done.push("start");
    pass.done.set(memoKey, done);
    return done;
  }

  /** The panel's colour truth: green means SUBMITTED (owner ruling
   *  2026-08-11) — a signed gate paints before its bless, and the bless
   *  rides as the thumbs-up. The route never reads this. */
  recordPaint(decl: MachineDecl): string[] {
    return this.recordDone(decl, new Set(), Claims.newPass(), true);
  }

  /** THE THIRD KIND OF GREEN, for the drawing — see
   *  dsp-mirror-render.md#one-decider-says-which-kind-of-green-it-is. A
   *  law-proven state signed nothing: its claim IS its law, and a reader who
   *  cannot tell it from a stamped one is reading the weaker of the two. */
  lawProvenStates(decl: MachineDecl): string[] {
    const it = this.host.declIteration(decl);
    if (it === undefined) return [];
    const traceRoot = this.host.traceRoot(it);
    const corpus = loadTrace(traceRoot);
    return [...this.lawProvenClaims(decl, it, corpus, corpusVersion(traceRoot), traceRoot)];
  }

  /** see dsp-walk-machine.md#the-gates-whose-claims-carry-a-bless */
  blessedGates(decl: MachineDecl, painted?: Set<string>): string[] {
    const it = this.host.declIteration(decl);
    if (it === undefined) return [];
    // THE CALLER USUALLY HAS THE SET ALREADY. render.ts computes recordPaint
    // one line above this call, and recomputing it here would be a second
    // full green pass over the same corpus in the same operation — the exact
    // shape i33 exists to remove. Absent, it is computed once.
    const standing = painted ?? new Set(this.recordPaint(decl));
    const out: string[] = [];
    for (const s of decl.states) {
      if (s.kind !== "gate" || !standing.has(s.id)) continue;
      try {
        const fm = noteOf(this.evidenceAbs(it, s.id))?.frontmatter;
        if (fm !== undefined && typeof fm.signed_off === "string" && typeof fm.bless === "string" && fm.bless.startsWith("blessed"))
          out.push(s.id);
      } catch {
        // an unreadable claim marks nothing
      }
    }
    return out;
  }

  /** THE DRIFT (owner ruling 2026-08-05): which states were passed against a
   *  demand that has since moved, plus everything downstream of them.
   *
   *  GREEN MUST MEAN STILL GREEN NOW. The demand diff used to run only when a
   *  pin was rewritten, and a pin is only rewritten on an escalation. So
   *  editing a matrix row under a standing iteration changed what its steps
   *  ask for and left every one of them green against a question that no
   *  longer existed.
   *
   *  IT WRITES NOTHING. Somebody opening the machine to look must never
   *  change the record, so the view calls this and paints. The walk calls
   *  driftReopen, which is the only writer.
   *
   *  ONE WORD FOR ONE IDEA. A trace node standing on moved ground is suspect
   *  too, by the same mechanism and wearing the same mark — see
   *  trace.ts traceSuspects. */
  suspectStates(decl: MachineDecl): string[] {
    const it = this.host.declIteration(decl);
    if (it === undefined) return [];
    const moved = iterationDrift(this.host.machineRoot(), it).filter((id) => decl.states.some((s) => s.id === id));
    if (moved.length === 0) return [];
    // see dsp-walk-machine.md#only-a-pass-can-lapse
    const green = new Set(this.recordDone(decl));
    const cone = downstreamCone(decl, moved);
    return [...green].filter((id) => cone.has(id));
  }

  /** THE WRITER'S HALF: the walk arrives, so the drift stops being a mark on
   *  a picture and becomes an actual reopen. Reusing rewalk means the drift
   *  and the escalation reopen by exactly one mechanism.
   *
   *  Nothing to reopen is the normal case and costs one hash. */
  driftReopen(): void {
    const run = this.host.top();
    if (run === undefined) return;
    const it = this.host.declIteration(run.decl);
    if (it === undefined) return;
    // NO STALE PASS ANY MORE. It used to walk every claim and WRITE a suspect
    // mark onto the ones that had stopped passing. recordDone re-runs those
    // same form checks on every look, so the mark bought nothing and cost a
    // signature each time it fired.
    // THE PIN CATCHES UP WHENEVER THE MATRIX MOVED, and steps reopen only
    // where a demand moved with it. Returning early on an empty reopen list
    // left the record walking a snapshot taken before the correction, which
    // is how i3 kept skipping a state the column already required.
    if (!pinIsStale(this.host.machineRoot(), it)) return;
    const moved = iterationDrift(this.host.machineRoot(), it);
    // ONLY A STANDING CLAIM CAN BE REOPENED, and standing is the RECORD's
    // word, not this session's. Reading the instance's own history instead
    // meant a drift could only ever reopen steps filled since the last engine
    // start — so after a restart, nothing reopened at all.
    const done = new Set(this.recordDone(run.decl));
    const owed = moved.filter((id) => done.has(id));
    if (owed.length > 0) this.host.rewalk({ reopened: owed }, "the rigor matrix moved under the pin");
    // CONSUME IT EITHER WAY. The walk has now seen this move, whether or not
    // anything was standing to reopen. Leaving the pin stale would re-fire it
    // on the next pull, and the re-earned step would reopen forever.
    repinColumn(this.host.machineRoot(), it);
    // The frame under the walk's feet is the OLD machine until it is swapped,
    // so the reopened step would still serve the form it was reopened for.
    this.host.repinSwap();
  }

  /** The walk STANDS in the state — the one moment its questions are in
   *  order. Saves are welcome from anywhere; submit and bless are not:
   *  the steps before a step are where its answers become visible, and
   *  no lint can see what a skipped step would have shown. */
  stateFormActive(name: string, m: MachineDecl): boolean {
    const { machine, ids } = this.host.leaves();
    return machine.id === m.id && ids.includes(name);
  }

  assertStateFormActive(name: string, m: MachineDecl, verb: string): void {
    if (this.stateFormActive(name, m)) return;
    throw new Rejection({
      clause: CLAUSES.NOT_LEGAL_IN_STATE,
      expected: `the walk standing in ${name} — questions are answered in ORDER, and a ${verb} out of order skips the steps that feed it`,
      got: "the walk stands elsewhere",
      remedy: { tool: "se_pull", args: {}, note: "save keeps working from anywhere; the state's own moment is when it submits" },
      source: "engine/session.ts stateform",
    });
  }

  /** A QUALIFIED ID NAMES ITS OWN MACHINE, and every form lookup takes the
   *  bare name — the same normalisation whyGrey does, arrived at the same way.
   *  A walk reads `iterations/i15/draft-vision` in its own answers, so that is
   *  what it passes back, and the refusal then names a form-less state rather
   *  than the prefix it should have dropped. Measured on the i15 walk: one
   *  call spent, at the moment the walk was already stuck. */
  private bareState(name: string): string {
    return name.slice(name.lastIndexOf("/") + 1);
  }

  /** see dsp-walk-machine.md#two-operations-on-a-standing-claim */
  reopenClaim(rawName: string, reason: string, by: string, machineId?: string, confirm?: boolean): Record<string, unknown> {
    const name = this.bareState(rawName);
    this.host.forgetRoute();
    const m = this.formMachine(machineId);
    this.stateFormState(name, m); // refuses an undeclared or form-less state
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    if (raw === undefined || typeof parseStateNote(raw).frontmatter.signed_off !== "string") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${name} submitted — a reopen sends a STANDING claim back to be re-earned`,
        got: raw === undefined ? "no form on disk" : "never submitted",
        remedy: { tool: "se_pull", args: {}, note: "an unsubmitted form is already owed; walk to it and fill it" },
        source: "engine/session.ts reopen",
      });
    }
    if (reason.trim() === "") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "a reason — a reopen throws away accepted work and the record says why",
        got: "empty",
        remedy: { tool: "se_reopen", args: { state: name, reason: "<what stopped standing>" }, note: "one line is enough" },
        source: "engine/session.ts reopen",
      });
    }
    // see dsp-walk-machine.md#say-what-it-will-drop
    const blessedBy = parseStateNote(raw).frontmatter.bless;
    const byAPerson = typeof blessedBy === "string" && blessedBy.includes("human");
    if (byAPerson && confirm !== true) {
      const falls = this.wouldFall(name, m);
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "a confirmed reopen — this one destroys a person's adjudication",
        got: `${name} carries "${blessedBy}", and a reopen drops it. ${falls.length} state(s) fall with it: ${falls.join(", ") || "none"}`,
        remedy: {
          tool: "se_reopen",
          args: { state: name, reason, confirm: true },
          note: "if the claim's own content still passes, se_amend fixes the field and LEAVES THE TREE STANDING — the bless with it. Reopen only when the work is genuinely wrong.",
        },
        source: "engine/session.ts reopen",
      });
    }
    writeFileSync(h.instanceAbs, withReopened(raw, new Date().toISOString(), reason), "utf8");
    this.host.notifyChange();
    // The walk's tokens follow the file. reopenStates handles the join re-arming
    // that a bare token move gets wrong; a machine that does not declare this
    // state simply has no tokens to move, which is not an error.
    const run = this.host.top();
    if (run?.decl.states.some((s) => s.id === name)) {
      reopenStates(run.decl, run.instance, [name], reason, new Date().toISOString());
    }
    return { reopened: name, why: reason.trim(), by, still_green: this.recordDone(m) };
  }

  /** WHAT A REOPEN OF THIS STATE WOULD TAKE WITH IT.
   *
   *  Green ripples through the feeders, so everything downstream of a
   *  reopened claim falls. Counting it BEFORE the write is what turns a
   *  surprise into a decision. */
  wouldFall(name: string, m: MachineDecl): string[] {
    const standing = new Set(this.recordDone(m));
    if (!standing.has(name)) return [];
    const claimful = new Set(m.states.filter((s) => s.evidence_form.length > 0 || s.submachine !== undefined).map((s) => s.id));
    return [...standing].filter((s) => s !== name && claimful.has(s) && claimFeeders(m, s, claimful).includes(name));
  }

  amendClaim(
    name: string,
    fillsIn: Record<string, string>,
    reason: string,
    by: string,
    machineId?: string,
    ops: AmendOp[] = [],
    chain = false,
  ): Record<string, unknown> {
    this.host.forgetRoute();
    const m = this.formMachine(machineId);
    this.stateFormState(name, m);
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    if (raw === undefined || typeof parseStateNote(raw).frontmatter.signed_off !== "string") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${name} submitted — an amend edits a STANDING claim without disturbing it`,
        got: raw === undefined ? "no form on disk" : "never submitted",
        remedy: { tool: "se_pull", args: {}, note: "an unsubmitted form is owed; fill it on the pull instead" },
        source: "engine/session.ts amend",
      });
    }
    // THE OPS RESOLVE AGAINST THE FILE AS IT STANDS, and become fills. From
    // here down there is one path, so every guard below — the check re-run,
    // the restore, the refusal that names se_reopen — covers both shapes
    // without knowing which was used.
    const fills = { ...amendOps(raw, ops, name), ...fillsIn };
    const feeding = FEEDS_DOWNSTREAM.find((f) => name.endsWith(f.state) && fills[f.field] !== undefined);
    if (feeding !== undefined) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `an amend to a field this state keeps to itself — ${feeding.field} is read by ${feeding.reads}`,
        got: `an amend to ${feeding.field} — that is a reopen rather than a correction`,
        remedy: {
          tool: "se_reopen",
          args: { state: name, reason: "<what the states below must now answer differently>" },
          note: "an amend leaves every claim below standing, so a change here would slip past every state that answers it. A changed question is a reopen: those states go grey and earn their answers again.",
        },
        source: "engine/session.ts amend",
      });
    }
    if (reason.trim() === "" || Object.keys(fills).length === 0) {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "at least one field, and a reason — an amend that says nothing is an untracked edit",
        got: Object.keys(fills).length === 0 ? "no fields" : "no reason",
        remedy: {
          tool: "se_amend",
          args: {
            state: name,
            ops: [{ field: "<field>", old_string: "<text as it stands>", new_string: "<what it becomes>" }],
            reason: "<what was wrong>",
          },
          note: "ops patch a field in place; fills rewrite one whole. One of the two, and always a reason",
        },
        source: "engine/session.ts amend",
      });
    }
    const before = (this.stateFormGet(name, m) as { problems?: string[] }).problems ?? [];
    let next = raw;
    for (const [f, content] of Object.entries(fills)) next = withFieldContent(next, f, String(content));
    next = withAmended(next, new Date().toISOString(), by, reason);
    writeFileSync(h.instanceAbs, next, "utf8");
    // see dsp-walk-machine.md#an-amend-may-not-break-what-the-signature-covers
    let after: string[];
    try {
      after = (this.stateFormGet(name, m) as { problems?: string[] }).problems ?? [];
    } catch (e) {
      writeFileSync(h.instanceAbs, raw, "utf8");
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "an amend the form can still be read after — nothing was changed",
        got: e instanceof Error ? e.message : String(e),
        remedy: {
          tool: "se_amend",
          args: { state: name, fills: { "<field>": "<text>" }, reason: "<what was wrong>" },
          note: "the file was put back; try again",
        },
        source: "engine/session.ts amend",
      });
    }
    const broke = after.filter((p) => !before.includes(p));
    if (broke.length > 0) {
      writeFileSync(h.instanceAbs, raw, "utf8");
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: "an amend that leaves the claim standing — nothing was changed",
        got: broke.join(" · "),
        remedy: {
          tool: "se_reopen",
          args: { state: name, reason: "<why the claim itself must be re-earned>" },
          note: "a change this size is a reopen, not an amend",
        },
        source: "engine/session.ts amend",
      });
    }
    // see dsp-walk-machine.md#an-amend-leaves-the-signatures-date-alone
    const chained = chain ? this.refreshChain(name, m, reason, by) : {};
    this.host.notifyChange();
    return { amended: name, fields: Object.keys(fills), why: reason.trim(), by, signature_kept: true, ...chained };
  }

  /** see dsp-walk-machine.md#re-freshen-everything-below-a-mended-claim */
  refreshChain(from: string, m: MachineDecl, reason: string, by: string): Record<string, unknown> {
    const refreshed: string[] = [];
    const held: string[] = [];
    const why = `carried down from ${from}: ${reason.trim()}`;
    const when = new Date().toISOString();
    for (const id of downstreamCone(m, [from])) {
      const s = m.states.find((x) => x.id === id);
      if (s === undefined || s.evidence_form.length === 0) continue;
      const h = this.stateFormHome(id, m);
      if (!existsSync(h.instanceAbs)) continue;
      // THROUGH THE SHARED READER, never a direct read. readNode gives every
      // other reader in this operation the same parse, and the door's own
      // guard counts a bypass the day it appears.
      const raw = readNode(h.instanceAbs);
      if (raw === "" || typeof parseStateNote(raw).frontmatter.signed_off !== "string") continue;
      let problems: string[];
      try {
        problems = (this.stateFormGet(id, m) as { problems?: string[] }).problems ?? [];
      } catch {
        held.push(`${id} could not be read`);
        continue;
      }
      if (problems.length > 0) {
        held.push(`${id}: ${problems.join(" · ")}`);
        continue;
      }
      writeFileSync(h.instanceAbs, withAmended(raw, when, by, why), "utf8");
      refreshed.push(id);
    }
    return {
      chain: {
        refreshed,
        ...(held.length > 0 ? { held } : {}),
        note:
          held.length > 0
            ? `${String(refreshed.length)} claim(s) re-freshened; ${String(held.length)} left standing because their own checks do not pass — those are defects rather than ripple`
            : `${String(refreshed.length)} claim(s) re-freshened, every one of them clean on its own checks`,
      },
    };
  }

  /** THE BLESS (owner design 2026-08-04, v1's thumbs reborn): a gate's
   *  submitted form needs a hand ABOVE it — the human always, or an agent
   *  whose autonomy stands strictly above the gate's own weight. */
  formBless(name: string, ok: boolean, by: string, machineId?: string): Record<string, unknown> {
    this.host.forgetRoute();
    const m = this.formMachine(machineId);
    const s = this.stateFormState(name, m);
    this.assertStateFormActive(name, m, "bless");
    if (s.kind !== "gate") {
      throw new Rejection({
        clause: CLAUSES.NOT_LEGAL_IN_STATE,
        expected: "a GATE state — only gates carry a bless",
        got: `${name} (${s.kind})`,
        remedy: { tool: "se_pull", args: {}, note: "work states complete by their form alone" },
        source: "engine/session.ts bless",
      });
    }
    if (by !== "human" && this.host.autonomy <= s.priority) {
      throw new Rejection({
        clause: CLAUSES.ABOVE_THRESHOLD,
        expected: `a hand above this gate's weight — ${this.host.tierFor(s.priority).tier ?? "heavier"} work, or the person's thumb in the form`,
        got: `the agent stands at ${this.host.tierFor(this.host.autonomy).tier ?? "a lower rung"}`,
        remedy: { tool: "se_pull", args: {}, note: "present the gate to the person and stop — their bless resumes the walk" },
        source: "engine/session.ts bless",
      });
    }
    const h = this.stateFormHome(name, m);
    const braw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    if (braw === undefined || typeof parseStateNote(braw).frontmatter.signed_off !== "string") {
      throw new Rejection({
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${name} form submitted — the thumbs judge a STAMPED claim`,
        got: "not submitted yet",
        remedy: { tool: "se_pull", args: {}, note: 'fill, then {"submit": true} — the bless follows the stamp' },
        source: "engine/session.ts bless",
      });
    }
    writeFileSync(h.instanceAbs, withBless(braw, `${ok ? "blessed" : "dismissed"} by ${by}`), "utf8");
    this.host.notifyChange();
    return this.stateFormGet(name, m);
  }

  /** see dsp-walk-machine.md#one-or-many-fields-into-the-stored-instance */
  bindThrough(name: string, fields: Record<string, string>, m: MachineDecl): string[] {
    const s = this.stateFormState(name, m);
    // A CHART WRITES NOTES, and it is the only field that CREATES and DELETES
    // them. Drawing a line mints a candidate; deleting the row throws the note
    // away (owner ruling 2026-08-08).
    const charted: string[] = [];
    for (const f of s.evidence_form.filter((x) => x.template === "morph-box" && fields[x.name] !== undefined)) {
      charted.push(...bindChart(this.host, String(fields[f.name]), m));
    }
    const bound = s.evidence_form.filter((f) => f.template === "node-table" && fields[f.name] !== undefined);
    if (bound.length === 0) return charted;
    const byId = new Map(loadTrace(this.host.traceRoot(this.host.declIteration(m))).map((n) => [n.id, n]));
    const touched: string[] = [];
    for (const f of bound) {
      const cols = f.columns ?? [];
      for (const line of String(fields[f.name]).split("\n")) {
        const cells = tableRow(line);
        // The header and its rule have no node in the first cell, so they
        // fall out here without needing to be counted or skipped by position.
        const id = (cells[0] ?? "").replace(/^\[\[|\]\]$/g, "").trim();
        const file = byId.get(id)?.file;
        if (file === undefined) continue;
        let raw = readFileSync(file, "utf8");
        // see dsp-walk-machine.md#only-a-cell-that-moved-is-written
        let moved = false;
        cols.forEach((c, i) => {
          const v = (cells[i + 1] ?? "").replace(/\\\|/g, "|");
          const isListNow = nodeField(file, c) === "" && nodeList(file, c).length > 0;
          const current = isListNow ? nodeList(file, c).join(" · ") : nodeField(file, c);
          if (v === current) return;
          // A CELL THAT TRAILS OFF NEVER LANDS. Something between the agent
          // and the engine shortens a large table — the engine writes no
          // ellipsis of its own, and the nodes on disk carry none — so a cell
          // ending in one is a fragment of an answer rather than an answer.
          // The submit refuses it separately and says so; this stop is what
          // guarantees the node keeps its intact value meanwhile.
          if (/(?:…|\.\.\.)\s*$/.test(v)) return;
          moved = true;
          // A key that is a LIST on disk stays a list: the cell splits on
          // the · the read half joined with. The yaml writer quotes each
          // entry itself, so a colon in a test name cannot break the node.
          const isList = nodeField(file, c) === "" && nodeList(file, c).length > 0;
          raw =
            isList || v.includes(" · ")
              ? withFrontmatterList(
                  raw,
                  c,
                  v
                    .split(" · ")
                    .map((x) => x.trim())
                    .filter((x) => x !== ""),
                )
              : withFrontmatter(raw, c, v);
        });
        if (!moved) continue;
        writeFileSync(file, raw, "utf8");
        touched.push(id);
      }
    }
    return touched.concat(charted);
  }

  /** see dsp-walk-machine.md#a-named-cell-mints-one-skeleton */
  mintInterfaceCell(name: string, source: string, destination: string, machineId?: string): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const traceRoot = this.host.traceRoot(this.host.declIteration(m));
    const cell = elementMatrixArgs(traceRoot).cells.find((c) => c.source === source && c.destination === destination);
    const id = `if-${source.replace(/^el-/, "")}-to-${destination.replace(/^el-/, "")}`;
    const abs = join(traceDir(traceRoot), "interface", `${id}.md`);
    if (!existsSync(abs) && cell !== undefined) {
      mkdirSync(dirname(abs), { recursive: true });
      writeNode(
        abs,
        [
          "---",
          `id: ${id}`,
          'type: "[[interface]]"',
          "statement: <!-- the contract in one sentence -->",
          `source: ${source}`,
          `destination: ${destination}`,
          "carries:",
          ...(cell.missing.length > 0 ? cell.missing : cell.owed).map((f) => `  - ${f}`),
          "form: <!-- call | file | protocol | shared store -- concretely -->",
          "source_refs:",
          "  - decompose-structure, the element matrix's owed cell",
          "---",
          "",
          "<!-- the contract's detail -- direction, cadence, failure behavior -->",
        ].join("\n"),
      );
    }
    return this.stateFormGet(name, m);
  }

  /** ONE CLICK, ONE TRIPWIRE (owner ruling 2026-08-10). The flip deck posts
   *  a ruling as it is made; the line lands in the sensitivity section and
   *  the save mints its node before the page redraws. Idempotent: a cell
   *  already ruled answers with the standing form. The field name is the
   *  method's own — the deck lives on the sensitivity reading. */
  flipRuling(name: string, rival: string, winner: string, axis: string, by: string, machineId?: string): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const h = this.stateFormHome(name, m);
    // Through the door — the read ratchet holds, and the door already knows
    // this file if anything else looked at it this pass.
    const raw = readNode(h.instanceAbs);
    const current = raw === "" ? "" : section(parseStateNote(raw).body, "sensitivity").trim();
    if (current.includes(`[[${rival}]]`) && current.includes(`[[${axis}]]`)) return this.stateFormGet(name, m);
    const line = `- credible: [[${rival}]] over [[${winner}]] on [[${axis}]]`;
    return this.stateFormSave(name, { sensitivity: current === "" ? line : `${current}\n${line}` }, by, m);
  }

  /** ONE CLICK, ONE VERDICT (owner ruling 2026-08-10). The scenario deck
   *  posts a verdict as it is made; the line lands in the walk section and
   *  the save mints the register entry for at-risk and unaddressed before
   *  the page redraws. A fitness click files the requirement in
   *  fitness_candidates instead. Idempotent: a scenario already ruled
   *  answers with the standing form. */
  scenarioVerdict(
    name: string,
    kind: string,
    requirement: string,
    extra: { decision?: string; hinge?: string; note?: string },
    by: string,
    machineId?: string,
  ): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const h = this.stateFormHome(name, m);
    const raw = readNode(h.instanceAbs);
    const field = kind === "fitness" ? "fitness_candidates" : "walk";
    const current = raw === "" ? "" : section(parseStateNote(raw).body, field).trim();
    // THE FLAG LIVES ON THE REQUIREMENT NODE (owner ruling 2026-08-10):
    // fitness_candidate: true in its frontmatter, so the mark outlives the
    // form. The list line below shows the same fact where the reader is.
    if (kind === "fitness") {
      const nodeAbs = join(traceDir(this.host.traceRoot(this.host.declIteration(m))), "requirement", `${requirement}.md`);
      const nodeRaw = readNode(nodeAbs);
      if (nodeRaw !== "" && !nodeRaw.includes("fitness_candidate:"))
        writeNode(nodeAbs, withFrontmatter(nodeRaw, "fitness_candidate", "true"));
    }
    const already = kind === "fitness" ? current.includes(requirement) : current.includes(`[[${requirement}]]`);
    if (already) return this.stateFormGet(name, m);
    // The note stays one line by construction — a newline would break the
    // verdict grammar the mint reads back.
    const note = (extra.note ?? "").replace(/\s+/g, " ").trim();
    // see dsp-walk-machine.md#not-every-quality-needs-a-decision
    const line =
      kind === "addressed"
        ? `- [[${requirement}]] — addressed${(extra.decision ?? "") === "" ? "" : ` by [[${extra.decision}]]`}`
        : kind === "at-risk"
          ? `- at risk: [[${requirement}]] hinges on [[${extra.hinge ?? ""}]] — ${note === "" ? "the tradeoff is unstated" : note}`
          : kind === "unaddressed"
            ? `- unaddressed: [[${requirement}]]`
            : `- ${requirement}`;
    return this.stateFormSave(name, { [field]: current === "" ? line : `${current}\n${line}` }, by, m);
  }

  stateFormSave(
    name: string,
    fields: Record<string, string>,
    by: string,
    m: MachineDecl = this.host.currentMachine(),
  ): Record<string, unknown> {
    const t = stateFormFields(this.stateFormState(name, m));
    const h = this.stateFormHome(name, m);
    let raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : stateFormScaffold(name, t);
    // inputs_checked is the checkbox column, not a section — both hands
    // (the page's boxes, the agent's fill) send it through this one door.
    const { inputs_checked, ...rest } = fields;
    // see dsp-the-goal-binds-the-walk.md#a-credible-ruling-mints-its-tripwire-on-save
    mintFlipTripwires(this.host, rest, m, by);
    // The scenario walk's verdicts mint the same way — see mintScenarioEntries.
    mintScenarioEntries(this.host, rest, m, by);
    // BOUND FIELDS LAND ON THE NODES FIRST. The section is written too, so a
    // reader of the file still sees what was answered — but the NODES are
    // what the check reads and what the next look rebuilds the section from.
    this.bindThrough(name, rest, m);
    for (const [f, content] of Object.entries(rest)) raw = withFieldContent(raw, f, String(content));
    // The dead fields migrate out as legacy instances are touched.
    raw = raw.replace(/^status: .*\n?/m, "").replace(/^opened: .*\n?/m, "");
    // A changed claim is neither the submitted nor the blessed claim.
    //
    // AND THE ACCIDENTAL DOOR SAYS SO NOW. se_reopen does exactly this on
    // purpose, and it refuses without confirmation, naming how many states
    // fall. A field save does it in this one line and said nothing at all, so
    // the guarded door was the deliberate one and the unguarded door was the
    // one nobody meant to walk through.
    //
    // MEASURED ON THE i15 WALK: correcting a single wrong number on a signed
    // kickoff gate — 26 query files where there are 25 — dropped 28 claims
    // beneath it and cost a whole session re-earning states that were right.
    // se_amend fixes a field and LEAVES THE TREE STANDING, and its name lived
    // only on se_reopen's description, a verb that call never touched.
    let cleared: Record<string, unknown> | undefined;
    if (Object.keys(fields).length > 0) {
      if (typeof parseStateNote(raw).frontmatter.signed_off === "string") {
        const falls = this.wouldFall(name, m);
        cleared = {
          state: name,
          falls: falls.length,
          states: falls,
          why: "a changed claim is not the claim that was signed, so the signature and any bless are gone",
          instead:
            falls.length > 0
              ? `se_amend fixes a field and leaves these ${String(falls.length)} standing — use it where the claim's own content still passes, and re-submit only when the work is genuinely wrong`
              : "se_amend fixes a field without clearing the signature, where the claim's own content still passes",
        };
      }
      raw = stripSignedOff(withBless(raw, undefined));
    }
    if (inputs_checked !== undefined) {
      raw = withChecked(
        raw,
        String(inputs_checked)
          .split("\n")
          .map((x) => x.trim())
          .filter((x) => x !== ""),
      );
    }
    raw = withAuthor(raw, by);
    mkdirSync(dirname(h.instanceAbs), { recursive: true });
    writeFileSync(h.instanceAbs, raw, "utf8");
    this.host.notifyChange();
    return { ...this.stateFormGet(name, m), ...(cleared === undefined ? {} : { signature_cleared: cleared }) };
  }

  /** see dsp-walk-machine.md#the-state-form-the-walk-itself-owes */
  standingStateFormOwed(): string | undefined {
    if (!this.host.subs.some((s) => s.decl.id === "iterations")) return undefined;
    const { machine, ids } = this.host.leaves();
    const s = machine.states.find((x) => x.id === ids[0]);
    // see dsp-walk-machine.md#the-fourth-place-this-proxy-lived
    if (s === undefined) return undefined;
    // MACHINERY OWES NOTHING, and that is the only test needed here. start,
    // end, terminal and join never sign; asking them for a form throws from
    // formForAgent on the pull's own path, OUTSIDE the try below, so seven
    // tests went red when this guard was removed entirely.
    //
    // EVERYTHING ELSE IS ANSWERED BY THE LOOKUP. stateFormGet throws for a
    // work state that has no form — read_contract reads and never signs — and
    // the catch turns that into "owes nothing". So no test of FIELDS belongs
    // here: a state with a form and no fields is owed like any other, which is
    // what makes a bare submit reachable at all.
    if (s.kind !== "work" && s.kind !== "gate") return undefined;
    try {
      // Owed until SUBMITTED and still COMPLETE — a live input growing back
      // (a new inbox item) re-opens a signed form instead of leaving it
      // unpullable while the next state's entry refuses.
      const f = this.stateFormGet(s.id) as { signed?: boolean; met?: boolean; gate?: boolean; bless?: string; reopened_after?: boolean };
      // A GATE IS NOT DONE UNTIL IT IS BLESSED. Dropping it from the owed list
      // at the submit left the bless with no carrier — the pull stopped asking,
      // and a bless only rides a pull that is asking. The mirror's thumbs still
      // worked, so the gap was invisible to a person and total for an agent.
      // A GATE MISSING AN INPUT OWES NOTHING. Its form cannot be finished, and
      // owing it swallows every choice that would fetch the missing leg.
      //
      // THIS STAYS GATE-ONLY, and widening it was a deadlock. A work state
      // whose feeder is unsigned would owe no form, so it could never be
      // filled, so its feeder could never become signed either. The rule that
      // every input must be met belongs at the SUBMIT, where formDone checks
      // it. Owing a form and being allowed to stamp it are different questions.
      if (f.gate === true && this.feedersUnsigned(machine, s).length > 0) return undefined;
      const blessed = f.gate !== true || (f.bless ?? "") !== "";
      // A REOPENED CLAIM IS OWED AGAIN even though it is still signed. Without
      // this the reopen moved the walk's tokens and nothing else: the form
      // stayed unpullable, so the state could never be re-earned.
      if (f.reopened_after === true) return s.id;
      return f.signed === true && f.met === true && blessed ? undefined : s.id;
    } catch {
      return undefined;
    }
  }

  /** THE FAN'S OTHER LEGS.
   *
   *  A fan hands out one leg and reports the rest as not_walked, for the day
   *  several agents walk them at once. ONE agent then reaches the join with
   *  the other legs unwalked, and is stuck for good: the gate owes a form it
   *  cannot finish, and a choice is only read when nothing is owed, so every
   *  attempt to aim elsewhere is swallowed as a fill.
   *
   *  So where the walk stands stuck the unsigned feeders ARE the offer, and
   *  taking one puts the walk back on that leg. One agent walks a fan leg by
   *  leg; the list form still serves several agents unchanged. */
  joinStuck(): { machine: MachineDecl; feeders: string[] } | undefined {
    const { machine, ids } = this.host.leaves();
    const here = machine.states.find((s) => s.id === ids[0]);
    // A STATE THAT OWES NO FORM CANNOT BE STUCK OWING ONE. start and end
    // collect edges like anything else, but they never wait on them, so
    // offering their feeders as an escape stops a sweep that was fine.
    if (here === undefined || here.evidence_form.length === 0) return undefined;
    const feeders = this.feedersUnsigned(machine, here);
    return feeders.length === 0 ? undefined : { machine, feeders };
  }

  /** Put the walk back on a leg it never took. No history is superseded:
   *  nothing downstream was earned, because the join was never passed. */
  walkBackTo(id: string): void {
    const top = this.host.top();
    if (top === undefined) return;
    top.instance.active = [id];
    top.instance.current = id;
    top.instance.status = "open";
    this.host.notifyChange();
  }

  /** see dsp-walk-machine.md#every-state-requires-all-its-inputs */
  submachineIsScaffold(name: string): boolean {
    try {
      const decl = compileMachineCached(
        this.host.machineRoot(),
        resolveRef(this.host.machineRoot(), mainMachinePath(this.host.machineRoot()), name),
      );
      // Written with ?? rather than an equality on purpose. scaffold-entry's
      // inspection anchors on the entry guard's literal and takes the FIRST
      // match in this file, so a second copy of that phrase up here silently
      // pointed the assertion at the wrong block.
      return decl.scaffold ?? false;
    } catch {
      return false;
    }
  }

  feedersUnsigned(fm: MachineDecl, state: StateDecl): string[] {
    const REQUIRED = new Set(["normal", "approval"]);
    // see dsp-walk-machine.md#a-placeholder-that-runs-a-submachine-is-an-input
    const feeders = fm.states.filter(
      (p) =>
        (p.evidence_form.length > 0 || (p.submachine !== undefined && !this.submachineIsScaffold(p.submachine))) &&
        p.edges.some((e) => e.to === state.id && REQUIRED.has(e.role ?? "normal")),
    );
    if (feeders.length === 0) return [];
    // A SUBMACHINE STATE HAS NO SIGNATURE TO READ, so it is asked the question
    // the claim-guard asks instead: does the record call it done. An unseeded
    // drawing answers no, because drawingDone catches viewFor's refusal.
    //
    // COMPUTED ONLY WHERE SUCH A FEEDER EXISTS. recordDone paints the whole
    // machine and this runs on the submit path, so it stays off the hot path
    // for every state fed only by ordinary forms.
    let done: Set<string> | undefined;
    const finished = (p: StateDecl): boolean => {
      if (p.evidence_form.length === 0) {
        done ??= new Set(this.recordDone(fm));
        return done.has(p.id);
      }
      try {
        return (this.stateFormGet(p.id, fm) as { signed?: boolean }).signed === true;
      } catch {
        return false;
      }
    };
    const unsigned = feeders.filter((p) => !finished(p));
    // THE BAR IS THE AND: every input signed, or the state does not stamp.
    if (state.busbar === true) return unsigned.map((p) => p.id);
    // NO BAR IS THE OR, and the OR still demands ONE. A state waits until an
    // input actually arrives; it just does not care which.
    //
    // WITH A SINGLE INPUT THE TWO RULES MEET. One of one is all of one, so a
    // lone predecessor binds without any bar being drawn. That is the case
    // that was wide open: generalize-use-cases has exactly one input, so no
    // bar could have saved it and no OR excused it — nothing was checking a
    // work state's inputs at all.
    return unsigned.length === feeders.length ? unsigned.map((p) => p.id) : [];
  }

  /** see dsp-walk-machine.md#every-condition-holding-a-state-grey */
  ownClaimProblems(stateId: string, m: MachineDecl): string[] {
    const decl = m.states.find((s) => s.id === stateId);
    if (decl === undefined) return [];
    try {
      // this.host.traceRoot(it) IN FULL, not a renamed local. A guard test greps
      // for exactly this spelling, because a claim check resolving against
      // the wrong record is the drift it catches.
      const it = this.host.declIteration(m);
      if (it === undefined) return [];
      const body = noteOf(this.evidenceAbs(it, stateId))?.body;
      if (body === undefined) return [];
      return claimProblems(this.host.traceRoot(it), decl, body, loadTrace(this.host.traceRoot(it)));
    } catch {
      return []; // an unreadable claim falls back to the plain sentence
    }
  }

  /** see dsp-walk-machine.md#which-verb-fixes-a-fallen-input */
  fallenRemedy(fallen: string, m: MachineDecl): { tool: string; args: Record<string, unknown>; note: string } {
    // A THIRD CASE, FOUND WHEN THE REMEDY STARTED NAMING THE ROOT (i6). The
    // first hop is always a state the walk has been through, so it always had
    // a form to amend. A ROOT NEED NOT HAVE ONE: the honest reason a chain
    // starts somewhere is often that nobody has walked there yet.
    //
    // se_amend on a form that was never submitted patches nothing and reads as
    // a refusal. There is no claim to fix — there is a state to walk.
    const signed = (this.stateFormGet(fallen) as { signed?: boolean }).signed === true;
    if (!signed) {
      return {
        tool: "se_aim",
        args: { to: fallen, go: true },
        note: `${fallen} has no standing claim to fix — its form is not submitted. Go there, fill it and submit; nothing between it and here can move first.`,
      };
    }
    const problems = this.ownClaimProblems(fallen, m);
    if (problems.length === 0) {
      // see dsp-walk-machine.md#neither-case-is-an-amend
      const stale = this.staleFeeders(fallen);
      if (stale.length > 0) {
        return {
          tool: "se_reopen",
          args: { state: fallen, reason: "<what the re-signed input above asks that it did not before>" },
          note: `${fallen}'s own content still passes. It is down because ${stale.join(", ")} was RE-SIGNED after it, so it answered older ground. Re-earning it is cheaper than it sounds: the pull hands the form straight back with a recheck block, body and signature both still on the file. Read what is written, confirm this change did not move it, and submit. The submit is the re-sign.`,
        };
      }
      return {
        tool: "se_why",
        args: { state: fallen },
        note: `${fallen}'s own content still passes and nothing about it needs fixing. It is down because something ABOVE it is down. Ask it what holds it — fixing anything here changes nothing until that root stands.`,
      };
    }
    return {
      tool: "se_reopen",
      args: { state: fallen, reason: "<why it stopped standing>" },
      note: `${fallen}'s own content no longer passes: ${problems.join(" ")}. That is a defect rather than a ripple, so it is re-earned rather than amended.`,
    };
  }

  /** see dsp-walk-machine.md#the-ripple-names-its-root */
  claimBlockers(stateId: string, machine?: MachineDecl): Blocker[] {
    const m = machine ?? this.host.currentMachine();
    const decl = m.states.find((s) => s.id === stateId);
    // see dsp-walk-machine.md#the-seventh-place
    if (decl === undefined) return [];
    const done = new Set(this.recordDone(m));
    if (done.has(stateId)) return [];
    const fields = decl.evidence_form.length;
    const expected =
      fields > 0
        ? `${stateId}'s claim to stand before it completes — it declares ${String(fields)} evidence field(s)`
        : `${stateId}'s claim to stand before it completes — it declares no fields, so its check is COMPUTED and the failing list is below`;
    // see dsp-walk-machine.md#the-content-check-below-already-reports-the-failing-list
    const claimful = new Set(m.states.filter((s) => s.evidence_form.length > 0 || s.submachine !== undefined).map((s) => s.id));
    const fallen = claimFeeders(m, stateId, claimful).filter((f) => !done.has(f));
    if (fallen.length > 0) {
      // THE ROOT, NOT THE FIRST HOP (i6). A cycle returns no root, and then
      // the first hop is still better than silence.
      const { roots, path } = fallenChain(m, stateId, done, claimful);
      const at = roots[0] ?? fallen[0];
      const chain =
        path.length > 1
          ? ` THE CHAIN STARTS AT ${roots.join(", ")}: ${path.join(" → ")}. Fixing anything between changes nothing until the root stands.`
          : "";
      return [
        {
          kind: "fallen_input",
          // THE NAMES TRAVEL AS DATA, so the chain walk behind se_why follows
          // this kind instead of reading past it.
          states: fallen,
          clause: CLAUSES.CONDITION_UNMET,
          expected,
          got: `${stateId}'s OWN claim may be fine. It is dropped because these inputs are not standing: ${fallen.join(", ")}.${chain}`,
          // see dsp-walk-machine.md#name-the-verb
          remedy: this.fallenRemedy(at, m),
          source: "engine/session.ts claim-guard",
        },
      ];
    }
    // AND WHEN NOTHING UPSTREAM FELL, SAY WHAT IS WRONG WITH THIS ONE (owner
    // instruction 2026-08-13). The content check knows which field failed and
    // what it wanted; a check reports in the words of the question IT asked.
    const own = this.ownClaimProblems(stateId, m);
    if (own.length > 0) {
      return [
        {
          kind: "claim_content",
          clause: CLAUSES.CONDITION_UNMET,
          expected,
          got: `${stateId}'s claim does not pass its own checks: ${own.join(" · ")}`,
          remedy: {
            tool: "se_pull",
            args: {},
            note: "fix the named field, then submit again — the claim re-stamps and the completion follows",
          },
          source: "engine/session.ts claim-guard",
        },
      ];
    }
    return [];
  }

  stateBlockers(stateId: string): Blocker[] {
    const out: Blocker[] = [];
    const lint = this.stateFormGet(stateId) as {
      met?: boolean;
      signed?: boolean;
      problems?: string[];
      instance?: string;
      gate?: boolean;
      bless?: string;
    };
    // see dsp-walk-machine.md#a-placeholder-owes-no-form
    const here = this.host.currentMachine().states.find((s) => s.id === stateId);
    const owesForm = here === undefined || here.evidence_form.length > 0;
    if (owesForm && lint.met !== true) {
      out.push({
        kind: "form_incomplete",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} evidence form complete (${String(lint.instance)})`,
        got: (lint.problems ?? []).join(" · ") || "unfilled",
        remedy: { tool: "se_pull", args: {}, note: 'the pull serves the form; fill it, then finish with {"submit": true}' },
        source: "engine/session.ts stateform",
      });
    } else if (lint.signed !== true) {
      // ONLY WHEN COMPLETE. "Fill it" and "submit it" are the same instruction
      // twice on an unfilled form, and a list of two says the state is twice
      // as stuck as it is.
      out.push({
        kind: "unsubmitted",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} form SUBMITTED — the submit checks the fields and stamps the claim`,
        got: "complete but not submitted",
        remedy: { tool: "se_pull", args: {}, note: 'return {"submit": true} on the fill, or press submit in the form' },
        source: "engine/session.ts stateform",
      });
    }
    {
      const m = this.host.currentMachine();
      const gs = m.states.find((x) => x.id === stateId);
      const feeders = gs === undefined ? [] : this.feedersUnsigned(m, gs);
      if (feeders.length > 0) {
        out.push({
          kind: "unsigned_feeder",
          states: feeders,
          clause: CLAUSES.CONDITION_UNMET,
          expected: `a state requires ALL its inputs — every feeder form signed before ${stateId} passes`,
          got: `unsigned feeders: ${feeders.join(", ")}`,
          remedy: { tool: "se_pull", args: {}, note: "walk the named states and submit their forms; this one passes after" },
          source: "engine/session.ts stateform",
        });
      }
    }
    // WHAT ACTUALLY HOLDS A PLACEHOLDER: its drawing. An unseeded one proves
    // nothing and drawingDone answers false, so the state never goes green and
    // everything under it falls. Naming the drawing points at the state that
    // authors it; naming a form points at a file to write by hand.
    if (here?.submachine !== undefined && !new Set(this.recordDone(this.host.currentMachine())).has(stateId)) {
      out.push({
        kind: "submachine_unfinished",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `${stateId} runs a drawing — it is finished when every state that drawing declares is green`,
        got: "the drawing is unseeded or its states are not all green",
        remedy: {
          tool: "se_pull",
          args: {},
          note: "walk the state that AUTHORS the drawing and let it seed one; a drawing written by hand is not seeded and proves nothing",
        },
        source: "engine/session.ts stateform",
      });
    }
    // see dsp-the-goal-binds-the-walk.md#the-claims-own-blockers
    out.push(...this.claimBlockers(stateId));
    if (lint.gate === true && !(lint.bless ?? "").startsWith("blessed")) {
      out.push({
        kind: "unblessed_gate",
        clause: CLAUSES.CONDITION_UNMET,
        expected: `the ${stateId} gate blessed — the 👍 in the form, by the human or a hand above the gate's rung`,
        got: (lint.bless ?? "") === "" ? "submitted, awaiting the bless" : String(lint.bless),
        remedy: {
          tool: "se_pull",
          args: {},
          note: 'present the gate and stop; a fill of {"bless": true} blesses only from above its weight',
        },
        source: "engine/session.ts bless",
      });
    }
    return out;
  }

  /** IS THIS HOP THE DRAWN PATH FOR THE STATE FAILING?
   *
   *  A `fallback` or `error` edge exists for exactly one reason: the thing
   *  went wrong and the drawing has somewhere to put it. Walking one is not
   *  leaving with the work done, and the claim gate must not read it as such.
   *
   *  IT MUST BE UNAMBIGUOUS. Where `to` also has a normal edge from here, the
   *  hop is a forward move that happens to share a target, and the gate stands.
   *  Only a target reachable ONLY by a repair edge is a repair. */
  takesRepairEdge(m: MachineDecl, cur: string, to: string | undefined): boolean {
    if (to === undefined) return false;
    const edges = this.host.state(m, cur).edges.filter((e) => e.to === to);
    return edges.length > 0 && edges.every((e) => e.role === "fallback" || e.role === "error");
  }

  assertStateFormMet(stateId: string): void {
    // THE FIRST BLOCKER IS THE REFUSAL, unchanged. The walk refuses exactly
    // where it refused before, with the same clause and the same remedy.
    const first = this.stateBlockers(stateId)[0];
    if (first === undefined) return;
    const { kind: _kind, ...rejection } = first;
    throw new Rejection(rejection);
  }

  /** see dsp-walk-machine.md#the-root-of-the-ripple */
  greyRoots(bare: string, seen: Set<string>): { state: string; blockers: Blocker[] }[] {
    if (seen.has(bare)) return [];
    seen.add(bare);
    let blockers: Blocker[];
    try {
      blockers = this.stateBlockers(bare);
    } catch {
      return [];
    }
    if (blockers.length === 0) return [];
    // BOTH KINDS OF UPSTREAM, READ AS DATA (i6). This parsed the feeder names
    // out of one blocker's sentence and ignored `fallen_input` entirely — so a
    // walk held by a ripple was told "the work is here" while the work was
    // three states upstream.
    const feeders = blockers
      .filter((b) => b.kind === "unsigned_feeder" || b.kind === "fallen_input")
      .flatMap((b) => b.states ?? [])
      .map((s) => s.slice(s.lastIndexOf("/") + 1))
      .filter((s) => s !== "");
    if (feeders.length === 0) return [{ state: bare, blockers }];
    const upstream = feeders.flatMap((f) => this.greyRoots(f, seen));
    // A FEEDER THAT READS AS UNSIGNED BUT HOLDS NOTHING leaves this state as
    // the root. Reporting nothing at all would be worse than reporting here.
    return upstream.length === 0 ? [{ state: bare, blockers }] : upstream;
  }

  /** THE VERB'S ANSWER. One state, every condition holding it, and a plain
   *  sentence saying which of the two cases you are in.
   *
   *  NO ARGUMENT MEANS WHERE THE WALK STANDS, which is the question somebody
   *  actually has when they ask. */
  whyGrey(stateId?: string): Record<string, unknown> {
    const at = stateId ?? this.host.active()[0];
    if (at === undefined) {
      return { state: null, standing: false, blockers: [], says: "the walk stands nowhere" };
    }
    // A QUALIFIED ID NAMES ITS OWN MACHINE. The form lookup takes the bare
    // name, so "iterations/i3/write-requirements" is asked as its last part.
    const bare = at.slice(at.lastIndexOf("/") + 1);
    let blockers: Blocker[];
    try {
      blockers = this.stateBlockers(bare);
    } catch (e) {
      // AN UNKNOWN STATE IS AN ANSWER, not a crash. The verb exists to be
      // asked from a position of not knowing, so it must survive a wrong name.
      return {
        state: at,
        standing: false,
        blockers: [],
        says: `${bare} could not be read as a state of this machine: ${String((e as Error).message)}`,
      };
    }
    if (blockers.length === 0) {
      // see dsp-walk-machine.md#content-passing-is-not-standing
      const stale = this.staleFeeders(bare);
      if (stale.length > 0) {
        return {
          state: at,
          standing: false,
          blockers,
          says: `${bare}'s own content passes, and it is NOT standing. It was signed before ${stale.join(", ")} was RE-SIGNED, so it answered ground that has since moved. An amend will not clear this: an amend corrects wording and leaves the signature where it is, and a signature is what says a claim answers today's ground. The act is se_reopen. It is cheaper than it sounds — the pull hands the form straight back with a recheck block, the body and the signature both still on the file, and you read what is written, confirm this change did not move it, and submit. The submit is the re-sign.`,
        };
      }
      return {
        state: at,
        standing: true,
        blockers,
        says: `${bare} stands — nothing holds it. If the walk still will not go there, the reason is the route or the dial, not this state.`,
      };
    }
    // THE WHOLE CHAIN, NOT THE FIRST LINK. Asked about a state whose only
    // problem is an unsigned feeder, the answer used to name that feeder and
    // stop — so the reader asked again, and again, until they reached the
    // state that actually needs work.
    const roots = this.greyRoots(bare, new Set()).filter((r) => r.state !== bare);
    return {
      state: at,
      standing: false,
      blockers,
      ...(roots.length > 0 ? { root: roots } : {}),
      says:
        roots.length === 0
          ? `${bare} is held by ${blockers.length}: ${blockers.map((b) => b.kind).join(", ")}. The first is what the next pull refuses with. Nothing upstream is waiting — the work is here.`
          : `${bare} is WAITING, not broken. The work is at ${roots.map((r) => r.state).join(", ")}, held by ${roots.map((r) => r.blockers.map((b) => b.kind).join("/")).join(" · ")}. Fix that and this goes green with it.`,
    };
  }

  /** ONE self-contained HTML: the sheet, the fills, the reading and the
   *  templates baked in — the island is what travels back. */
  stateFormExport(name: string, machineId?: string): string {
    const m = this.formMachine(machineId);
    const s = this.stateFormState(name, m);
    const h = this.stateFormHome(name, m);
    const raw = existsSync(h.instanceAbs) ? readFileSync(h.instanceAbs, "utf8") : undefined;
    const model = stateFormModel(
      this.host.machineRoot(),
      scanGuidance(this.host.machineRoot()),
      m,
      s,
      this.stateFormHeader(name, raw, m),
      raw,
      this.host.traceRoot(this.host.declIteration(m)),
      h.instanceAbs,
    );
    const fills: Record<string, string> = {};
    if (raw !== undefined) {
      const body = parseStateNote(raw).body;
      for (const f of model.template.fields) fills[f.name] = stripComments(section(body, f.name)).trim();
    }
    // A BOUND FIELD IS REBUILT FROM THE NODES, and whatever the file holds is
    // ignored. That is the read half of the two-way view: edit the note and
    // the form agrees at the next look, with nothing to synchronise.
    //
    // It also settles the check. `met` asks whether every line has an answer,
    // and the lines now come from the register — so the state stands exactly
    // while every standing node carries its frontmatter, which is the claim
    // the state was making all along.
    Object.assign(fills, bindView(this.host, s, model, m));
    const docs: EmbeddedDoc[] = [];
    for (const i of model.inputs) {
      if (i.path === undefined) continue;
      try {
        docs.push({ path: i.path, content: readFileSync(join(this.host.machineRoot(), i.path), "utf8") });
      } catch {
        docs.push({ path: i.path, content: "(unreadable at export time)" });
      }
    }
    return buildPortableForm(model, fills, docs, stateFormChecked(raw));
  }

  /** The returned copy's island lands as fills, marked imported — a
   *  claim like every other, judged at the gate. */
  stateFormIngest(name: string, html: string, machineId?: string): Record<string, unknown> {
    const m = this.formMachine(machineId);
    const island = parseIsland(html);
    if (island === undefined || island.form !== name) {
      throw new Rejection({
        clause: CLAUSES.REQUIRED_ARGS,
        expected: `a returned portable form carrying the se-form island for ${name}`,
        got: island === undefined ? "no island in the file" : `an island for ${island.form}`,
        remedy: { tool: "se_pull", args: {}, note: "export first, have it filled and saved, ingest that file" },
        source: "engine/session.ts stateform",
      });
    }
    const author = island.author === "" ? "imported" : `${island.author} (imported)`;
    const fields = { ...island.fields, inputs_checked: island.checked.join("\n") };
    return { ingested: name, author, ...this.stateFormSave(name, fields, author, m) };
  }
}
