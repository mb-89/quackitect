// The dispatcher's plan: what stands ready, stuck, loose and waiting on a
// person, read off origin/main and the work branches. The dry run prints it
// and writes nothing.
// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]

// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
export function planOf(_it, _now = 0) {
  return { ready: [], held: [], waiting: [], stuck: [], bundles: [], questions: [] };
}

// [[spec/design_input/the-cloud-runs-itself#the-dispatcher]]
export function dispatch(_root, _argv, _doors) {
  return 0;
}
