// THE READER'S PLACE, IN ONE PLACE (i4).
//
// Focus, scroll and an unsubmitted edit are the browser's own state. They
// change on every keystroke, so they stay on the surface rather than crossing
// the seam into the view model — a model carrying them would need a round trip
// per character typed.
//
// WHAT WAS WRONG WAS NOT WHERE THEY LIVED. It was that six places each decided
// for themselves what "the reader's place" meant, and no two agreed. One said
// the element with focus, another said the element that contains it, a third
// blurred first and asked afterwards.
//
// SO THIS IS THE ONE DECIDER. Every part of the client script is joined after
// it, so every part can call it, and nothing else answers these questions.
//
// see dsp-the-computed-view.md#the-redraw-decision-which-the-build-must-make-once

/** The first part of the client script: what "the reader's place" means. */
export const PLACE = `
// --- the reader's place ---

/** Is the person typing in this element, or in something inside it?
 *
 *  ONE ANSWER FOR BOTH QUESTIONS. A redraw asks it of a single input and of a
 *  whole table, and the containment case is why asking === by hand kept
 *  getting it wrong for the table. */
function sePlaceHasFocus(el) {
  const active = document.activeElement;
  if (!el || !active) return false;
  return el === active || el.contains(active);
}

/** The value in this field is the person's, not the server's.
 *
 *  A REDRAW NEVER OVERWRITES IT. That is the whole rule, and it is the same
 *  rule as focus — the field being typed in holds an unsubmitted edit. */
function sePlaceIsEdited(el) {
  return sePlaceHasFocus(el);
}

/** Let go of whatever the person was typing in.
 *
 *  IT IS THE OPPOSITE ACT AND IT BELONGS HERE ANYWAY. One place decides what
 *  "the reader's place" means, and giving it up is part of that. Leaving this
 *  one site reading the DOM directly is how the six became seven. */
function sePlaceRelease() {
  const active = document.activeElement;
  if (active && active.blur) active.blur();
}

/** Run a redraw and leave the scroll where the reader had it.
 *
 *  STUCK TO THE TOP STAYS STUCK. A feed the reader has scrolled to the top of
 *  is a feed they want to keep following, so it stays at the top rather than
 *  being pinned to the pixel it happened to be at. */
function sePlaceKeepScroll(el, redraw, opts) {
  if (!el) { redraw(); return; }
  const stickAt = (opts && opts.stickWithin) || 0;
  const wasStuck = stickAt > 0 && el.scrollTop < stickAt;
  const top = el.scrollTop;
  redraw();
  el.scrollTop = wasStuck ? 0 : top;
}

/** Redraw a pane, keeping the scroll only while it is showing the SAME thing.
 *
 *  A NEW SUBJECT STARTS AT THE TOP. Carrying the old scroll onto different
 *  content lands the reader in the middle of something they have not read. */
function sePlaceKeepScrollForSubject(el, sameSubject, redraw) {
  if (!el) { redraw(); return; }
  const top = sameSubject ? el.scrollTop : 0;
  redraw();
  el.scrollTop = top;
}
`;
