// The fix verb: the fixes a program can make. The fixer reads its own flags.
// [[spec/tickets/the-small-faults-land]]

import { fix } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = (words) => fix(words);

await verbMain(import.meta.url, run);
