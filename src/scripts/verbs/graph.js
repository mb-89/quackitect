// The graph verb: a process or a ticket, drawn as the graph the editor reads.
// [[spec/tickets/cli-js-leaves]]

import { drawing } from "../mint-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => drawing(words);

await verbMain(import.meta.url, run);
