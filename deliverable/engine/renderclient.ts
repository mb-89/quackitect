// THE BROWSER-SIDE APPLICATION, carried as one string and served with the page.
//
// It is two thousand lines of JavaScript that never runs in the engine — it
// runs in the reader's panel. It stays a string because the mirror is a page
// we serve ourselves: no bundler, no build step, no nonce.
//
// IT IS ONE PROGRAM IN SIX PARTS. The parts are joined in the order below and
// nothing else joins them, so a declaration in an earlier part is in scope for
// every later one — the split is where a reader looks, not a module boundary.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts
import { DETAIL } from "./renderclient-detail.ts";
import { FORM } from "./renderclient-form.ts";
import { LIVE } from "./renderclient-live.ts";
import { LOG } from "./renderclient-log.ts";
import { PANEL } from "./renderclient-panel.ts";
import { PLACE } from "./renderclient-place.ts";
import { WALK } from "./renderclient-walk.ts";

// PLACE IS FIRST because every other part asks it what the reader's place is,
// and a declaration in an earlier part is in scope for every later one.
export const SCRIPT = [PLACE, DETAIL, WALK, FORM, PANEL, LOG, LIVE].join("\n");
