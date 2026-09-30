// The standing verb: what level zero hands the agent every session.
// [[spec/tickets/cli-js-leaves]]

import { standing } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = (words) => standing(words);

await verbMain(import.meta.url, run);
