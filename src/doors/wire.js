// The wire: the one place the server listens on a port. The server holds the
// doors and the state, and reaches the socket through this door alone. The
// process door starts it again.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { createServer } from "node:http";

// The span a kept socket stands idle, past any gap the hook leaves between two events. Node holds five seconds of its own, and a pooled socket dies inside a turn. [[spec/design_output/level0#the-bridgehead-and-the-server]]
export const IDLE = 300_000;
// The span HEADERS stands above IDLE, because node wants the two apart. [[spec/design_output/level0#the-bridgehead-and-the-server]]
const SPARE = 10_000;
// Node wants this one past IDLE, so a kept socket reads its next request. [[spec/design_output/level0#the-bridgehead-and-the-server]]
export const HEADERS = IDLE + SPARE;

export function wire() {
  return {
    listen(port, onRequest, onUp) {
      const server = createServer(onRequest);
      server.keepAliveTimeout = IDLE;
      server.headersTimeout = HEADERS;
      server.listen(port, "127.0.0.1", onUp);
      return server;
    },
  };
}
