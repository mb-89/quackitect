// The doctor verb: what is installed, and what level zero found.
// [[spec/tickets/cli-js-leaves]]

import { doctor } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = () => doctor();

await verbMain(import.meta.url, run);
