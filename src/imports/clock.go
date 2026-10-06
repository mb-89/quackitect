// The calls a test makes that wait on the box: a sleep on the wall clock, or a
// spawned process, which a door test alone makes.
// [[spec/guidance/code/testing]]
package imports

import "go/ast"

// Every call in the file that waits on the box, as package.Func. [[spec/tickets/the-testing-rules-name-the-doors]]
func RealWaits(file *ast.File) []string {
	return nil
}
