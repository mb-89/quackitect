// The Go topics a reader asks: `quack <topic>` under the method root, and the
// slice's mode a caller reads off its doors. The stub answers nothing, so the
// readers stand on the old path until the change lands.
// [[spec/tickets/readers-take-the-go-topics]]

// The parsed JSON `quack` prints for the topic, or null where the binary stands missing, exits non-zero or prints what no reader takes.
export function topicOf(_it, _argv, _stdin) {
  return null;
}

// Whether the slice reads new on the caller's doors.
export function readsNew(_it, _slice) {
  return false;
}

// The rows the config verb prints, off the map `quack config` answers.
export function configRowsOf(_answered) {
  return null;
}
