// The ticket verb. You pull a ticket, and the engine takes the branch it stands on.
// [[spec/design_output/pull#the-hand-out]]

import { it } from "../cli-doors.js";
import { pullArgvOf } from "../pull-tool.js";
import { ticket } from "../ticket.js";
import { verbMain } from "../verb-run.js";
import { pulling } from "../work.js";

export const run = async (words) =>
  words[0] === "pull"
    ? pulling(it.work, pullArgvOf(words), it)
    : ticket(it.work, words, it);

await verbMain(import.meta.url, run);
