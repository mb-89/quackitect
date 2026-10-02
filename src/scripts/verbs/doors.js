// The doors verb: every door, and the contract test that holds it.
// [[spec/tickets/cli-js-leaves]]

import { doorsHold } from "../cli-check.js";
import { verbMain } from "../verb-run.js";

export const run = async () => doorsHold();

await verbMain(import.meta.url, run);
