// see dsp-lane-door.md — the payload limit guard.
//
// req-supported-harness-serves-one-lane-contract. A host that truncates a
// payload hands the model something it cannot act on, and says nothing. The
// instruction text and the tool descriptions are the two payloads no answer
// bound covers: they are served at connect, not as a call's result.
//
// MEASURE ON THE WIRE, NEVER THE RAW FILE. A document is JSON-escaped into a
// response, and escaping is where the surprise lives — quotes and newlines
// roughly double a prose page. Break 1 of harness-portability found
// refusals.md at 18,909 raw and 21,675 on the wire, which is under the limit
// by one measure and over it by the other.
import { smallestInlineOutputBytes } from "./harness.ts";

/** What a bare envelope costs around a served document, measured off a plain
 *  pull. */
export const ENVELOPE_BYTES = 2_310;

export interface Payload {
  name: string;
  text: string;
}

export interface Oversize {
  name: string;
  onWire: number;
  limit: number;
  over: number;
}

/** What this text costs once serialised into a response, envelope included. */
export function onWireBytes(text: string): number {
  return JSON.stringify(text).length + ENVELOPE_BYTES;
}

/** Every payload that would not survive the tightest measured host.
 *
 *  THE LIMIT IS PASSED, NEVER DEFAULTED. A default swallows an explicit
 *  `undefined`, so a caller saying "nothing is measured" would silently get
 *  the registry's number instead — which is the one answer that must not be
 *  invented. `measuredLimit()` is the convenience for callers that want it.
 *
 *  THE LIMIT IS THE SMALLEST ACROSS HOSTS, not the one this machine happens
 *  to run. A page that fits here and not on a colleague's box is still a
 *  break, and it is the kind nobody is testing for. */
export function oversizedPayloads(payloads: Payload[], limit: number | undefined): Oversize[] {
  if (limit === undefined) return [];
  const out: Oversize[] = [];
  for (const p of payloads) {
    const onWire = onWireBytes(p.text);
    if (onWire > limit) out.push({ name: p.name, onWire, limit, over: onWire - limit });
  }
  return out;
}

/** The limit the registry currently knows, for callers that want it. */
export function measuredLimit(): number | undefined {
  return smallestInlineOutputBytes();
}

/** How close the worst payload is to the line, as a fraction of the limit.
 *
 *  WHY A MARGIN AND NOT A PASS. A page one edit away from the limit crosses
 *  it silently, on a host nobody is testing on. retro.md sat at 19,460
 *  against 20,480 — inside, and one paragraph from outside. */
export function worstMargin(payloads: Payload[], limit: number | undefined): number | undefined {
  if (limit === undefined || payloads.length === 0) return undefined;
  const worst = Math.max(...payloads.map((p) => onWireBytes(p.text)));
  return (limit - worst) / limit;
}
