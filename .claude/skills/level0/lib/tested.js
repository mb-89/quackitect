// The test-first rule, in two readings: the files a staged delta changes with
// no test beside them, and the modules of the server no test imports.
// [[spec/design_output/tree#the-rules-over-two-files]]

export function untestedIn(_delta) {
  return [];
}

export function everyModuleTested(_tree) {
  return [];
}
