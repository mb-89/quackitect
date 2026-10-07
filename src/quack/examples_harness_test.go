// The harness running every example over a fixture tree in memory: the disk,
// git, the process and the clock all faked, and each call dispatched in process.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

// The tree every example copies, built once in TestMain, which no example writes to. [[spec/design_output/examples#one-runner-two-drivers]]
var exampleFixture map[string]string

// Builds the fixture tree. [[spec/design_output/examples#doors-fixtures-and-the-ratio]]
func buildsFixture() map[string]string { return map[string]string{} }

// Runs one example over its own copy of the fixture, and answers its miss, or nothing where every step holds. [[spec/design_output/examples#one-runner-two-drivers]]
func runsExample(path, text string) string { return "" }

// Writes each verdict to the runtime file under the root. [[spec/design_output/examples#one-runner-two-drivers]]
func writesVerdicts(root string, misses map[string]string) error { return nil }
