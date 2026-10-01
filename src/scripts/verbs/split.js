// The split verb: cuts a file past the ceiling into the targets you name.
// [[spec/tickets/cli-js-leaves]]

import { splitDoors } from "../cli-check.js";
import { splitVerb } from "../split-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => splitVerb(splitDoors(), words);

await verbMain(import.meta.url, run);
