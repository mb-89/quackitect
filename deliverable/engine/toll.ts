// The work in hand, and the question the engine asks about it.
// see dsp-narration.md#the-toll
//
// NOTHING IS DEMANDED HERE ANY MORE. A token taken and a token settled ARE the
// narration and both log themselves, so a floor has nothing left to enforce.
// What is left is a QUESTION about the piece of work in hand, and a question
// can be ignored.

/** see dsp-narration.md#the-cadence-is-the-readers-control */
export const NARRATION_DEFAULT_MINUTES = 5;
export const NARRATION_DEFAULT_CALLS = 20;

export class Toll {
  private readonly now: () => number;
  private armed = false;
  private pending?: string;
  /** The piece of work last reported in hand, and when it took the hand. */
  private inHand = "";
  private inHandSince = 0;

  constructor(opts: { now?: () => number } = {}) {
    this.now = opts.now ?? Date.now;
  }

  private minutes(ms: number): number {
    return Math.round(ms / 60000);
  }

  /** A hop the machine forced, which pays no call.
   *
   *  TWO SHAPES, AND ONE ARGUMENT COVERS BOTH. The machine forced the hop, no
   *  judgment happened on it, and a toll falling due there could only ever be
   *  paid with filler.
   *
   *  see dsp-narration.md#the-reading-loop-is-not-a-judgment */
  private static isReadingHop(tool: string, args: Record<string, unknown>): boolean {
    // WAITING ON A JOB YOU ALREADY STARTED IS THE SAME SHAPE AS THE READING
    // LOOP. The battery runs asynchronously and hands back a handle, so the
    // only way to learn it finished is to ask — and asking is not work.
    //
    // MEASURED on the i15 walk: se_test was called 40 times. The 4 that
    // STARTED a run were never refused. Of the 36 that polled a running job,
    // 25 were refused by this toll — 62% of every se_test call in the
    // session, none of them about testing. Each one had to be paid with an
    // update saying nothing, or resent until it was.
    if (tool === "se_test") return typeof args.job === "string" && args.job !== "";
    // FOLLOWING THE LANE'S OWN CURSOR IS THE SAME CASE. A bounded answer hands
    // back a page and the exact call that fetches the rest; making that call
    // is the engine's instruction being obeyed, not work to narrate. Charging
    // for it refuses the only route to a result the lane itself withheld.
    if (tool === "se_file_read") {
      const path = String(args.path ?? "").replace(/\\/g, "/");
      return path.startsWith(".se/answers/");
    }
    if (tool !== "se_pull") return false;
    const form = args.form as Record<string, unknown> | undefined;
    if (form === undefined || form.read === undefined) return false;
    // ONLY a proof. A pull carrying evidence or a choice beside it is doing
    // real work and pays like anything else.
    return Object.keys(form).length === 1;
  }

  /** A NARRATION ACT, which cannot be charged for narrating.
   *
   *  THE TOLL IS A DISPATCH GUARD AND RUNS BEFORE THE HANDLER. Charging this
   *  one would mean the refusal's own remedy names a call the lane then
   *  refuses, which is a closed loop with no way out of it.
   *
   *  IT IS THE OPPOSITE ARGUMENT TO THE READING LOOP. A reading hop is exempt
   *  because no judgment happened on it. A work act is exempt because it IS
   *  the judgment the toll asks for, and every act demands a comment the store
   *  refuses to leave empty.
   *
   *  THE EXEMPTION IS NOT THE PAYMENT. Only a SUCCEEDING act calls paid(), on
   *  the way out, so a refused one slips the charge for a single call and
   *  clears nothing.
   *
   *  see dsp-narration.md#the-toll */
  private static isWorkAct(tool: string): boolean {
    return tool === "se_work";
  }

  /** The dispatch guard. Arms itself on the first call after boot. */
  check(booted: boolean, tool: string, args: Record<string, unknown>): void {
    if (!this.armed) {
      if (booted) this.armed = true;
      return;
    }
    if (Toll.isReadingHop(tool, args)) return;
    if (Toll.isWorkAct(tool)) return;
    // NOTHING IS DEMANDED. A token taken and a token settled ARE the narration,
    // and both log themselves, so there is nothing left to ask for and nothing
    // a refusal could honestly be about.
    //
    // WHAT STANDS INSTEAD IS A QUESTION. `sameWork` asks at most once a minute
    // whether the piece of work in hand is still the one in hand. A question
    // can be ignored; that is the whole difference from a toll.
  }

  /** HOW LONG ONE PIECE OF WORK MAY HOLD THE HAND before the walk is asked
   *  about it. A minute is short enough to catch a stray and long enough that
   *  ordinary work is never interrupted. */
  private static readonly SAME_WORK_MS = 60_000;

  /** THE NUDGE, AND IT NEVER REFUSES.
   *
   *  A PIECE OF WORK THAT HOLDS THE HAND FOR A LONG TIME IS TWO THINGS AT ONCE,
   *  and only the walker knows which. Either it is genuinely one long piece of
   *  work, or the walker strayed onto something else and owes a token for it.
   *
   *  SO THE ENGINE ASKS RATHER THAN DEMANDS. Nothing is refused, nothing is
   *  counted, and an answer is never owed. The question is the whole mechanism.
   *
   *  IT ASKS AT MOST ONCE A MINUTE. Asking on every call would be a toll wearing
   *  a question's clothes.
   *
   *  A CHANGE OF WORK ANSWERS IT. Settling one and opening the next resets the
   *  clock by itself, because the id in hand moved. */
  sameWork(id: string, said: string): void {
    if (id === "") {
      this.inHand = "";
      this.inHandSince = 0;
      return;
    }
    if (id !== this.inHand) {
      this.inHand = id;
      this.inHandSince = this.now();
      return;
    }
    const held = this.now() - this.inHandSince;
    if (held < Toll.SAME_WORK_MS) return;
    this.inHandSince = this.now();
    this.pending = `still on "${said}" after ${this.minutes(held)} min — if that is right, carry on. Strayed onto something else? Open a token for it: se_work {act: "open", id: "", comment: "<what you are actually doing>"}. A big piece of work wants sub-tokens rather than one that never closes.`;
  }

  /** A WORK ACT ANSWERS THE QUESTION, so a nudge waiting to be read is dropped.
   *  Showing it after the walker already moved would be asking about work that
   *  is no longer in hand. */
  paid(): void {
    this.pending = undefined;
  }

  /** The nudge, if one is due — reading it clears it; the result decorator
   *  attaches it to the next successful response. */
  takeWarning(): string | undefined {
    const w = this.pending;
    this.pending = undefined;
    return w;
  }
}
