// The failure door off nodes a case hands in, over a fake log. It keeps every
// id a case raises.
// [[spec/design_output/failures#one-door-raises-a-failure]]

import { behaves } from "./behaves.js";
import { fakeLog } from "./log.js";

export function fakeFailure(nodes = [], log = fakeLog()) {
  return behaves({ raise: async () => [], raised: () => [], log }, "failure");
}
