// The bless: a gate carrying `bless: true` waits after its verdict, and a
// bless binds to the hash of what it blesses, so an edit strips it.
// [[spec/design_output/pull#the-bless]]

// [[spec/design_output/pull#the-bless]]
export function blessKept(text) {
  return text;
}

// [[spec/design_output/pull#the-bless]]
export function blessHolds() {
  return true;
}

// [[spec/design_output/pull#the-bless]]
export function bless() {
  return 2;
}
