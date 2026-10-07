// ticket bless: the verdict a gate asking one holds, blessed and the step moved
// on, or --desk=<true|false> the desk's own word, through the pull over the
// doors this box holds.
// [[spec/design_output/pull#the-bless]]
package main

import (
	"io"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/git"
	"quackitect/src/pull"
)

func init() { register("ticket bless", ticketBless(index.Root, registeredRepo)) }

// [[spec/design_output/pull#the-bless]]
func ticketBless(rootOf func() (string, error), repoAt func(root string) git.Repo) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		it, code := pullHere(rootOf, repoAt, out, errs)
		if it == nil {
			return code
		}
		if word, desk := strings.CutPrefix(wordAt(said, 0), pull.Desk); desk {
			return it.BlessDesk(word)
		}
		at, found := ticketNamed(it.Disk, said)
		if !found {
			at = ""
		}
		return it.Bless(at, wordAt(said, 0))
	}
}
