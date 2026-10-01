// The index verb: the index itself.
// [[spec/tickets/cli-js-leaves]]

import { asksIndex } from "../cli-read.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => asksIndex(words.length ? words : ["standing"]);

await verbMain(import.meta.url, run);
