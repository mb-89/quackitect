// quack verb: the road ./RUNME.sh hands every verb down. The verbs slice's
// mode picks cli.js, a Go twin, or both with a shadow row where they differ.
// [[spec/tickets/runme-hands-verbs-to-quack]]
package main

import "io"

// Where a verb goes: to cli.js, to quack, or to both with the old answer standing. [[spec/tickets/runme-hands-verbs-to-quack]]
type road int

const (
	toNode road = iota
	toQuack
	toBoth
)

// A Go answer to a verb cli.js answers too, which writes nothing where dry holds. [[spec/tickets/runme-hands-verbs-to-quack]]
type twin func(argv []string, dry bool, out, errs io.Writer) int

// What the road reaches: the mode, cli.js teeing its standard output into out, the twins, the session log and the caller's streams. [[spec/tickets/runme-hands-verbs-to-quack]]
type verbDoors struct {
	mode       string
	old        func(out io.Writer) int
	twins      map[string]twin
	log        func(row map[string]any) error
	out, errs  io.Writer
}

// The road a verb takes under the mode. [[spec/tickets/runme-hands-verbs-to-quack]]
func roadOf(mode string, argv []string, twins map[string]twin) road {
	return toNode
}

// Runs the verb on its road, and answers the exit code the caller reads. [[spec/tickets/runme-hands-verbs-to-quack]]
func verbs(d verbDoors, argv []string) int {
	return d.old(d.out)
}
