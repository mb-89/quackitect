// The check module: the sweep the LSP's rules answer over the files the index
// mirrors.
// [[spec/tickets/lsp-rules-move-to-check]]
package check

import "quackitect/src/q"

// The prefix every name of this module carries once the wiring loads it as the check instance, which names each port `<instance>/<port>`. [[spec/tickets/check-module-joins-the-wiring]]
const Prefix = "check/"

// The module type the wiring loads as check: the sweep the LSP's rules answer. [[spec/tickets/lsp-rules-move-to-check]]
func Registers(c *q.Catalog) q.Writer {
	q.DerivedIn(c, SweepPort, []Finding{}, sweepOf, q.Doc("every finding the LSP's rules answer over the files the index mirrors"))
	return q.Join()
}
