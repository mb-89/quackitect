// The cloud verb: the cloud routine.
// [[spec/tickets/cli-js-leaves]]

import { it } from "../cli-doors.js";
import { verbMain } from "../verb-run.js";
import { cloud } from "../work.js";

export const run = async (words) => cloud(it.work, words, it);

await verbMain(import.meta.url, run);
