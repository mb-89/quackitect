// The state a note's front names, for a reader past the package: the rename
// verb leaves a closed ticket's text alone.
// [[spec/tickets/landing-verbs-port-to-go]]
package command

// The state a note's front names, its link brackets off. [[spec/tickets/landing-verbs-port-to-go]]
func StateOf(text string) string { return stateOf(text) }
