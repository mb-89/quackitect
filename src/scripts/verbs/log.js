// The log verb: the session log, narrowed by span, level, kind and count.
// [[spec/design_output/log#one-verb-reads-the-log]]

import { tuiDoors } from "../cli-check.js";
import { logVerb } from "../log-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => logVerb(tuiDoors(), words);

await verbMain(import.meta.url, run);
