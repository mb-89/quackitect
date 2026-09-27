// The window's own door. The window listens here so a second launch reaches the
// first, hands it a tab and ends. The bridge holds PORT_BASE and the register
// hands out the ports above it, so the window stands one below, where no
// vehicle lands. `WindowPort` in src/tui/frame/door.go listens on the same port.
// [[spec/design_output/tui#a-second-launch-hands-over]]

import { PORT_BASE } from "../../.claude/skills/level0/lib/vehicle.js";

export const PORT = PORT_BASE - 1;
