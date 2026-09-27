// The stale read: a passed leaf keeps the hash of each input and of its own
// definition, and a pull marks the leaves whose hashes no longer match.
// [[spec/design_output/pull#an-input-marks-its-steps]]

// [[spec/design_output/pull#an-input-marks-its-steps]]
export function inputsOf() {
  return [];
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
export function defOf() {
  return "";
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
export function staleRead(_it, one) {
  return one;
}
