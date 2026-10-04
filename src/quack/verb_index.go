// The index verb: the index itself, asked in place of the program the verb
// ran under node. links, notes and find print through the same ask.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"encoding/json"
	"fmt"
	"io"

	"quackitect/src/index"
)

// An ask of the index standing over the root, which starts one where none answers. index.Ask answers it, and a case hands in its own. [[spec/tickets/read-verbs-port-to-go]]
type asker func(argv ...string) (any, error)

// The method the index verb asks where it reads no words, and the method whose answer prints as its text. [[spec/tickets/read-verbs-port-to-go]] [[spec/design_output/model#quack-why]]
const (
	standingAsk = "standing"
	whyAsk      = "why"
)

func init() { register("index", indexVerb(index.Ask)) }

// index off the ask: the words as the index reads them, and standing where none come. [[spec/tickets/read-verbs-port-to-go]]
func indexVerb(ask asker) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		words := argv[1:]
		if len(words) == 0 {
			words = []string{standingAsk}
		}
		if words[0] == whyAsk {
			return whySays(ask, words, out, errs)
		}
		return indexSays(ask, words, out, errs)
	}
}

// Prints the text of a why answer, the tree the design input draws, as se-index prints it. [[spec/design_output/model#quack-why]]
func whySays(ask asker, words []string, out, errs io.Writer) int {
	said, err := ask(words...)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if found, ok := said.(map[string]any); ok {
		fmt.Fprintln(out, found["text"])
		return 0
	}
	return indexSays(func(...string) (any, error) { return said, nil }, words, out, errs)
}

// Prints the index's answer to the words indented two spaces, as se-index prints it, and its fault on the error stream. [[spec/tickets/read-verbs-port-to-go]]
func indexSays(ask asker, words []string, out, errs io.Writer) int {
	said, err := ask(words...)
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	text, err := json.MarshalIndent(said, "", "  ")
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	fmt.Fprintln(out, string(text))
	return 0
}
