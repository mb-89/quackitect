// The lint verb: the rules over the tree, or over what you name.
// [[spec/tickets/cli-js-leaves]]

import { lint } from "../cli-read.js";
import { verbMain, whereOf } from "../verb-run.js";

export const run = (words) => lint(whereOf(words));

await verbMain(import.meta.url, run);
