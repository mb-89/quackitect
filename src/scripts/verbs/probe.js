// The probe verb: measures the client itself.
// [[spec/tickets/cli-js-leaves]]

import { whereIs } from "../../engine/tools.js";
import { files, it, known, root } from "../cli-doors.js";
import { probe } from "../probe.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) =>
  probe(root, words, it, whereIs(files, root, "claude", known));

await verbMain(import.meta.url, run);
