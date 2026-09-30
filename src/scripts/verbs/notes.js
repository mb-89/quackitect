// The notes verb: the notes the words belong to, ranked by name and body.
// [[spec/tickets/cli-js-leaves]]

import { asksIndex } from "../cli-read.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => asksIndex(["notes", ...words]);

await verbMain(import.meta.url, run);
