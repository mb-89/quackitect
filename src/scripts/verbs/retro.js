// The retro verb: the retro a group's route runs.
// [[spec/tickets/cli-js-leaves]]

import { it } from "../cli-doors.js";
import { retro } from "../retro.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => retro(it.work, words, it);

await verbMain(import.meta.url, run);
