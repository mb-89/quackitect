/** THE SEED STATES ITS DEPENDENCY OR REFUSES (owner ruling 2026-08-13).
 *
 *  TWO ANSWERS USED TO LOOK IDENTICAL ON DISK: I FORGOT, and I DECIDED NONE.
 *  Only one of them is a decision, and the empty list is what makes it
 *  expressible. Without it the key cannot tell a silence from a statement,
 *  and that is the whole defect rather than a nicety.
 *
 *  THE GUIDANCE ALREADY EXISTED AND DID NOT HOLD. The rule stood in the seed
 *  tool's own argument description, in the argument list, unmissable.
 *  Measured 2026-08-13: twenty-seven iterations seeded and the key set on
 *  seven. Three stated a wait in their own vision prose and carried no edge
 *  for it — the UI sitting after the panel round, the comment system after
 *  the machine format, and the cloud iteration after the lane binding.
 *
 *  A RULE BROKEN THAT WAY WANTS A REFUSAL, NOT ANOTHER SENTENCE.
 *
 *  ONE MODULE, TWO DOORS. The agent's seed verbs and the mirror's seed form
 *  both land here, so a person and an agent are held to the same demand and
 *  read the same remedy.
 *
 *  req-a-seed-states-its-dependency */
import { CLAUSES, Rejection } from "./errors.ts";

const SRC = "engine/seed.ts";

/** THE REMEDY IS THE CALL TO MAKE INSTEAD, with the key present and an empty
 *  list in it. A refusal saying only that the key is missing leaves the caller
 *  to work out that empty is legal, and most will assume it is not. */
export function requiredDependsOn(verb: string, arg: unknown, rest: Record<string, unknown> = {}): string[] {
  if (Array.isArray(arg)) return arg.map(String).filter((s) => s.trim() !== "");
  // THE MIRROR SENDS A STRING, because a form field is text. An empty box is
  // the person's empty list: the field was shown, and they left it blank on
  // purpose. That is a statement, and it is why the form always sends the key.
  if (typeof arg === "string") {
    return arg
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");
  }
  throw new Rejection({
    clause: CLAUSES.REQUIRED_ARGS,
    expected: "depends_on: the ids this record waits for, or [] to state that it waits for nothing",
    got: arg === undefined ? "the key was omitted" : `depends_on: ${JSON.stringify(arg)}`,
    remedy: {
      tool: verb,
      args: { ...rest, depends_on: [] },
      note: "the dependency is the container's DAG, and the only thing stopping two agents being handed files that fight. An empty list is a stated decision; a missing key is a silence, and the two must not be the same bytes on disk.",
    },
    source: SRC,
  });
}

/** THE EMPTY LIST IS WRITTEN OUT, never left as a bare key. A bare
 *  `depends_on:` parses to null, which is the same bytes I-forgot leaves
 *  behind — and telling those apart is the whole row. */
export function dependsOnLines(dependsOn: string[]): string[] {
  if (dependsOn.length === 0) return ["depends_on: []"];
  return ["depends_on:", ...dependsOn.map((d) => `  - ${JSON.stringify(d)}`)];
}
