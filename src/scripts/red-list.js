// The tests a process lists as red: every ticket past tests-red and short of
// tests-green names the files it expects to fail, and the check runs them
// apart until tests-green closes.
// [[spec/design_output/pull#the-gate]]

// [[spec/design_output/pull#the-gate]]
export function expectedRed(_tickets) {
  return [];
}
