// The check verb: the tests, the doors, the server, then the rules over the tree.
// [[spec/tickets/cli-js-leaves]]

import { check } from "../check-verb.js";
import { verbMain } from "../verb-run.js";

export const run = (words) => check(words);

await verbMain(import.meta.url, run);
