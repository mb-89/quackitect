// The commit verb: reads the message, lands the commit, runs the check, and pushes on green from a cloud box.
// [[spec/tickets/cli-js-leaves]]

import { commitDoors } from "../cli-check.js";
import { commitVerb } from "../commit-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => commitVerb(commitDoors(), words);

await verbMain(import.meta.url, run);
