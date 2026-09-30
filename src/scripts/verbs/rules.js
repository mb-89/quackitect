// The rules verb: the mechanical rules Vale holds.
// [[spec/tickets/cli-js-leaves]]

import { listRules } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = async () => listRules();

await verbMain(import.meta.url, run);
