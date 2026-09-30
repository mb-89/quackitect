// The branch verb: work branches and groups, each word handed to the work.
// [[spec/tickets/cli-js-leaves]]

import { it } from "../cli-doors.js";
import { verbMain } from "../verb-run.js";
import { work } from "../work.js";

export const run = async (words) => work(it.work, words, it);

await verbMain(import.meta.url, run);
