// The placements: one process a list of instances the key names, and one a
// process for each instance in no list. The IO instances stay with the IO
// process.
// [[spec/design_output/processes#the-placements]]
package main

import (
	"quackitect/src/index"
	"quackitect/src/q"
)

// The verb a module process runs under. [[spec/design_output/processes#one-binary-many-processes]]
const moduleVerb = "module"

// [[spec/design_output/processes#the-placements]]
func placementsOf(w q.Wiring, hands map[string]q.Writer, lists [][]string, self string) []index.Placed {
	return nil
}

// Runs the instances a module process holds over the bus, and answers its stop. [[spec/design_output/processes#one-binary-many-processes]]
func runsModule(url, token string, store *q.Store, instances []string) (func(), error) {
	return func() {}, nil
}
