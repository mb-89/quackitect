// The window's own door. The window listens here so a second launch reaches the
// first, hands it a tab and ends. The bridge holds PORT_BASE, and the window
// stands one above it, so each door keeps a port of its own.
// [[spec/design_output/tui#a-second-launch-hands-over]]

import { PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";

export const PORT = PORT_BASE + 1;
