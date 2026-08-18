/** see dsp-record-lifecycle.md#the-seed-states-its-dependency-or-refuses */
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
