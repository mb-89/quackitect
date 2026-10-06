// The failure door off nodes a case hands in, over a fake log. It keeps every
// id a case raises.
// [[spec/design_output/failures#one-door-raises-a-failure]]

import { raiser } from "../failure.js";
import { behaves } from "./behaves.js";
import { fakeLog } from "./log.js";

export function fakeFailure(nodes = [], log = fakeLog()) {
  const held = new Map(nodes.map((one) => [one.id, one]));
  const ids = [];
  const raise = raiser((id) => held.get(id), log);
  return behaves(
    {
      raise: (id, ...said) => {
        ids.push(id);
        return raise(id, ...said);
      },
      raised: () => [...ids],
      log,
    },
    "failure",
  );
}
