// A recorded visit id, and the one rule for reading it.
//
// IT IMPORTS NOTHING ON PURPOSE. Three modules parsed this by hand, and the
// obvious homes for the shared copy all sit inside the session cycle. A leaf
// with no imports can be reached from any of them.

/** The state a recorded visit names.
 *
 *  A visit id is `container/state@instance`, and the parse applies two rules:
 *  drop the instance suffix at `@`, then take the innermost segment after `/`.
 *
 *  see dsp-walk-machine.md#the-state-a-recorded-visit-names */
export function visitState(visit: string): string {
  return visit.split("@")[0].split("/").pop() ?? "";
}
