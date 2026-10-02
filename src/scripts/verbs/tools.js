// The tools verb: asks this box where every tool stands, and writes it down.
// [[spec/tickets/cli-js-leaves]]

import { tools } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = async () => tools();

await verbMain(import.meta.url, run);
