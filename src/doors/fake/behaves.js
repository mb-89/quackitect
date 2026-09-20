// The guard every fake takes. A call the fake lacks throws, so a test driving
// a door through a fake passes on something.
// [[spec/design_output/doors#a-fake-behaves]]

export function behaves(fake, _name) {
  return fake;
}
