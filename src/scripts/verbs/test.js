// The test verb: the tests alone, or the test files and Go folders you name.
// [[spec/design_output/pull#the-test-verb]]

import { namedTests, test } from "../check-verb.js";
import { verbMain } from "../verb-run.js";

export const run = async (words) => (words.length ? namedTests(words) : test());

await verbMain(import.meta.url, run);
