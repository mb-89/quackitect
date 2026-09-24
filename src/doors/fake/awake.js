// The awake door in memory: it records each hold and each release, so a test
// reads whether the server held the box and let it go.
// [[spec/design_output/doors#a-fake-behaves]]

import { behaves } from "./behaves.js";

export function fakeAwake(platform = "win32") {
  const holds = [];
  return behaves(
    {
      holds,
      hold() {
        const one = { held: platform !== "other", released: false };
        holds.push(one);
        return {
          held: one.held,
          why: one.held ? "" : `no hold stands for ${platform}`,
          release() {
            one.released = true;
            return Promise.resolve();
          },
        };
      },
    },
    "awake",
  );
}
