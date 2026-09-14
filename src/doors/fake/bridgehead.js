// The bridgehead, faked. The real one stands under .claude/skills/level0/hooks,
// because the client loads it from there, and posts every event over the wire.
// This one raises an event straight into decide, so a test drives the server
// with no client, no wire and no port.
// [[spec/design_output/doors#the-bridgehead-stands-under-hooks]]

import { decide } from "../../bridge/server.js";

export function fakeBridgehead(box) {
  const raised = [];
  return {
    raised,
    // What the bridgehead does with the answer, in the order the real one reads it.
    async raise(event, e, origin = { kind: "test" }) {
      const said = { event, e, origin };
      const answer = await decide(said, box);
      await box.log.event(said, answer);
      raised.push({ said, answer });
      if (answer.result !== undefined) return { result: answer.result };
      if (answer.event !== undefined) return { next: answer.event };
      if (answer.after !== undefined) return { next: e, after: answer.after };
      return { next: e, register: answer.register };
    },
  };
}
