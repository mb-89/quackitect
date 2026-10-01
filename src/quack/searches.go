// The index a Grep or a Glob asks through the hooks door: the params in the
// wire shape se-index reads, decoded into the index's ask, and the answer
// encoded back into the shape it prints.
// [[spec/tickets/grep-glob-answer-off-index]]
package main

import "quackitect/src/index"

// A stub until tests-green. [[spec/tickets/grep-glob-answer-off-index]]
func indexAsk(reads index.Reads) func(method string, params map[string]any) (map[string]any, error) {
	return func(string, map[string]any) (map[string]any, error) { return nil, nil }
}
