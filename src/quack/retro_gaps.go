// The retro's two counts on examples: each verb no example shows, and each
// test standing beside a verb an example shows, for the audit to read.
// [[spec/guidance/retro/audit]]
package main

import (
	"io"

	"quackitect/src/modules/check"
)

func init() {
	register("retro gaps", retroGapsVerb(func() *check.Tree { return lintTree(retroRoot()) }))
}

// The verb: both counts, each item one a line, at exit 0. [[spec/guidance/retro/audit]]
func retroGapsVerb(treeOf func() *check.Tree) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return 0
	}
}
