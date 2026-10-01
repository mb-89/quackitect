// The search module: the find tool off the rows the index ranks, and a
// function's body off the disk, off src/bridge/search.js. It stands off the
// wiring until the flip. A stub until tests-green.
// [[spec/tickets/find-and-wait-in-go]]
package search

import (
	"regexp"

	"quackitect/src/q"
)

// The module a find action lists its request to. [[spec/tickets/find-and-wait-in-go]]
const Module = "search"

// A find: the words to look for, or a function name whose body it reads. [[spec/tickets/find-and-wait-in-go]]
type Find struct {
	Words    string `json:"words,omitempty" doc:"the words to look for"`
	Function string `json:"function,omitempty" doc:"a function name, whose body the find answers"`
}

// One row the index ranks: the path, the line and its text. [[spec/tickets/find-and-wait-in-go]]
type Row struct {
	Path string
	Line int
	Text string
}

// What the module reads: the tree, and the rows the index ranks for the words. [[spec/tickets/find-and-wait-in-go]]
type Outside struct {
	Root string
	Find func(words string) ([]Row, error)
}

// [[spec/tickets/find-and-wait-in-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join()
}

// The IO side of the module: it answers each request a find action lists. [[spec/tickets/find-and-wait-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(q.Request) (any, error) { return nil, nil }
}

// [[spec/design_output/index#find-reads-a-body]]
func definitionOf(name string) *regexp.Regexp {
	return regexp.MustCompile(`[^\s\S]`)
}

// [[spec/design_output/index#find-reads-a-body]]
func bodyFrom(lines []string, from int) []string {
	return nil
}
