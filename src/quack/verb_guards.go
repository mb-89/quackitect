// The guards verb: each guard over the tracked tree, against its baseline.
// [[spec/design_output/model#the-guards-hold-a-baseline]]
package main

import "quackitect/src/imports"

// The lines the guards print, and the code they answer, over the tracked files and a reader of the tree. [[spec/design_output/model#the-guards-hold-a-baseline]]
func guardsSaid(guards []imports.Guard, tracked []string, read func(path string) string) ([]string, int) {
	return nil, 0
}
