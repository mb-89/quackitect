// The find verb. The index walks no log, so a search of the log reads the
// file through the log verb, and every other search asks the index.
// [[spec/design_output/log#one-verb-reads-the-log]]
package main

import (
	"io"
	"slices"
	"strings"
)

// The flag that turns a find onto the session log. [[spec/design_output/log#one-verb-reads-the-log]]
const findLog = "--log"

func init() { register("find", findVerb(askIndex, logVerb(logHere))) }

// find off the ask, or off the log verb under --log, which reads the other words as the words a row carries. [[spec/tickets/read-verbs-port-to-go]]
func findVerb(ask asker, log twin) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		if !slices.Contains(argv, findLog) {
			return indexSays(ask, argv, out, errs)
		}
		words := slices.DeleteFunc(slices.Clone(argv[1:]), func(one string) bool { return one == findLog })
		return log([]string{"log", logWords, strings.Join(words, " ")}, dry, out, errs)
	}
}
