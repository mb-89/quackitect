// The push verb: pushes the branch you stand on, once the check answers green on it.
// [[spec/tickets/cli-js-leaves]]

import { commitDoors } from "../cli-check.js";
import { pushVerb } from "../push-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async () => pushVerb(commitDoors());

await verbMain(import.meta.url, run);
