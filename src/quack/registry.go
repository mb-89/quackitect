// The verb registry: each Go verb registers itself from its own file, so a
// port adds one file and edits no shared line.
// [[spec/tickets/quack-registers-each-verb]]
package main

// The Go verbs, keyed by the verb's words. [[spec/tickets/quack-registers-each-verb]]
var registry = map[string]twin{}

// Registers a verb's Go answer under its words, which the stub leaves undone. [[spec/tickets/quack-registers-each-verb]]
func register(words string, one twin) {}
