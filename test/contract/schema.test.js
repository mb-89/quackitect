// The real Vale over a parked draft: the write door's own linter over a name
// opening with an underscore. The schema checks stand in Go, under
// src/modules/check and src/quack/shipped_schemas_test.go.
// [[spec/design_output/schema#the-underscore-parks-a-draft]]

import assert from "node:assert/strict";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { at, rulesIn } from "./ruled.js";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const { ifVale, proves } = rulesIn(root);

const PAST =
  "---\nkind: [[guidance]]\n---\n\n# Nothing\n\nThe tree was installed here.\n";

// [[spec/design_output/schema#the-underscore-parks-a-draft]]
ifVale(
  "a draft parked under an underscore breaks no rule the styles hold",
  proves(
    {
      parked: at(PAST, "spec/guidance/_probe.md"),
      named: at(PAST, "spec/guidance/probe.md"),
    },
    (said) => {
      assert.deepEqual(said.rules("parked"), []);
      assert.ok(
        said.rules("named").length,
        "the same text, named without the underscore, meets the rules",
      );
    },
  ),
);
