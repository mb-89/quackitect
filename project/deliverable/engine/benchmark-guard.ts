// see dsp-benchmark-guard.md#responsibility
//
// NOT BUILT YET — see the note in benchmark.ts. Neutral answers on purpose.

/** THE CEILING. A commit newer than the rewind point is ABSENT from a depth-1
 *  fetch rather than tested for, so this asks whether it resolves at all. */
export function resolvesInBoundTree(_tree: string, _commit: string): boolean {
  return true;
}

/** THE POSITIVE CONTROL. An empty fetch and a correct rewind look identical
 *  from inside, so a run proves the tree HAS what it should. */
export function controlFilesPresent(_tree: string, _otherIteration: string): number {
  return 0;
}

/** THE CONCEALMENT, asked at each of the four measured call sites rather than
 *  attached to one of the four disagreeing exclusion lists. */
export function concealedFromLane(_rel: string, _bound: boolean): boolean {
  return false;
}

/** The call sites the mask covers. Asserted, so a verb added later fails
 *  rather than escaping the rule. */
export function concealmentCallSites(): string[] {
  return [];
}
