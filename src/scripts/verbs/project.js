// The project verb: writes every projection again, from the source it names.
// [[spec/tickets/cli-js-leaves]]

import { project } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = async () => project();

await verbMain(import.meta.url, run);
