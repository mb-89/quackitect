// The dispatch verb: the dispatcher's plan, printed or fired.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]

import { it } from "../cli-doors.js";
import { dispatch } from "../dispatch.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => dispatch(it.work, words, it);

await verbMain(import.meta.url, run);
