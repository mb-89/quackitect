// The home folder a box names, whichever variable it carries.
// [[spec/design_output/extension#a-box-names-its-home]]

import assert from "node:assert/strict";
import { test } from "node:test";
import { homeIn } from "../../src/scripts/editor.js";

test("the home folder comes from either name a box uses", () => {
  assert.equal(homeIn({ HOME: "/home/user" }), "/home/user");
  assert.equal(homeIn({ USERPROFILE: "C:\\Users\\one" }), "C:\\Users\\one");
  assert.equal(homeIn({ HOME: "", USERPROFILE: "C:\\Users\\one" }), "C:\\Users\\one");
  assert.equal(
    homeIn({ HOME: "/c/Users/one", USERPROFILE: "C:\\Users\\one" }),
    "C:\\Users\\one",
  );
  assert.equal(homeIn({}), "");
});
