// The binding a stop refusal names: its value, the file that sets it, and the
// moment the server first read it after a change.
// [[spec/design_output/stop#a-refusal-names-the-binding]]

import { BINDING } from "../../.claude/skills/level0/lib/config.js";
import { whereFrom } from "./config.js";

// The box keeps the binding it last read, so a change moves the moment and writes a line. [[spec/design_output/stop#a-refusal-names-the-binding]]
export function bindingLine(box) {
  const { value, layer } = whereFrom(box, BINDING);
  const last = box.bindingRead;
  if (!last || last.value !== value || last.layer !== layer) {
    box.bindingRead = { value, layer, at: box.clock.now().toISOString() };
    box.log.say("info", "binding", `the binding reads ${value ?? "nothing"}`, {
      detail: layer || "no file",
    });
  }
  const at = box.bindingRead.at;
  if (!layer) return `No file sets ${BINDING} for this session, read so at ${at}.`;
  return `This session binds to ${value}, set in ${layer}, read so at ${at}.`;
}
