// THE SAME REFUSAL, OVER AND OVER, IS ITS OWN FAULT CONDITION.
//
// A refusal carries a clause, what was expected, what it got, and an
// executable remedy. That is enough to recover in one turn — WHEN THE READER
// TAKES IT. A reader who does not take it gets the identical answer again,
// and nothing anywhere counts that.
//
// MEASURED ON THE i15 WALK: se_file_move was refused 27 times with SE-C-110,
// the whole burst inside NINE SECONDS. The tool was not legal in that state
// and never became legal, so every retry was answered exactly as the first
// one was. No guard fired, because the two that exist measure something else
// — the toll counts silence, and the stall guard counts updates since
// anything closed. Both were happy: the walk was narrating and the walk was
// busy. It was busy asking one question that had already been answered.
//
// SO THIS COUNTS THE ONE THING THEY DO NOT. It cannot refuse — the call is
// already refused — so it rides ON the refusal and says how many times this
// exact one has now come back, and that the remedy is not landing.

/** How many identical refusals before the answer starts saying so. Two is
 *  the retry a transient failure earns; the third is a pattern. */
const NOTICE_AT = 3;

/** Where a repeat stops being a mistake and becomes a loop. Nothing here can
 *  stop it, so what changes at this count is the ADVICE: not "read the
 *  remedy again" but "this remedy cannot work from where you stand". */
const STUCK_AT = 5;

export interface RepeatNote {
  /** How many times in a row this exact refusal has come back. */
  count: number;
  /** What the reader should do differently, which is never "try again". */
  do: string;
}

/** One walk's memory of its last refusal. Deliberately one slot deep: what
 *  matters is a refusal repeating BACK TO BACK, and any call that gets
 *  through means the walk moved and the loop broke. A tally across the whole
 *  session would flag a clause hit twice an hour apart, which is not a loop
 *  and not worth a word. */
export class RepeatWatch {
  private key = "";
  private count = 0;

  /** Records one refusal. Returns a note from the third identical one on, and
   *  nothing before that. */
  refused(tool: string, clause: string): RepeatNote | undefined {
    const key = `${tool} ${clause}`;
    if (key === this.key) this.count += 1;
    else {
      this.key = key;
      this.count = 1;
    }
    if (this.count < NOTICE_AT) return undefined;
    return { count: this.count, do: advice(tool, clause, this.count) };
  }

  /** A call that was NOT refused clears the memory. The walk moved, so
   *  whatever was repeating has stopped. */
  passed(): void {
    this.key = "";
    this.count = 0;
  }
}

/** What to say instead of the remedy the reader is already ignoring.
 *
 *  THE ADVICE NAMES THE READER'S OWN LOOP FIRST, because that is the fact
 *  they do not have: from inside, the third identical answer looks exactly
 *  like the first. */
function advice(tool: string, clause: string, count: number): string {
  const head = `${tool} has now been refused ${count} times in a row with ${clause}, and the answer has not changed. THE REMEDY IS NOT LANDING — sending it again cannot work.`;
  if (count >= STUCK_AT) {
    return `${head} STOP REPEATING IT. Say plainly, in your own words, what you were trying to do and what stands in the way. If no answer could let you continue from here, that is an escape — se_pull with escape: "<why>". If an answer would unblock you, ask for it where you stand and wait; you do not leave the state to ask a question.`;
  }
  return `${head} Read the clause itself rather than the remedy line: it says what the engine wanted, and the gap between that and what you sent is the thing to change. If the refusal is a STATE GATE — the tool is not legal where you stand — no argument to this tool will open it, and the state holds that job on purpose. Do the work the state names, or capture it with se_note and keep walking.`;
}
