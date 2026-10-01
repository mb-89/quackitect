// The mint verb: writes a new note of a kind, in the shape its schema names.
// [[spec/tickets/cli-js-leaves]]

import { mint } from "../mint-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => mint(words);

await verbMain(import.meta.url, run);
