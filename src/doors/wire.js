// The wire: the one place the server listens on a port and starts itself
// again. The server holds the doors and the state, and reaches the socket
// and the process through this door alone.
// [[spec/design_output/level0#the-bridgehead-and-the-server]]

import { spawn } from "node:child_process";
import { createServer } from "node:http";

export function wire() {
  return {
    listen(port, onRequest, onUp) {
      const server = createServer(onRequest);
      server.listen(port, "127.0.0.1", onUp);
      return server;
    },
    respawn(argv) {
      const child = spawn(process.execPath, argv, {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      child.unref();
    },
  };
}
