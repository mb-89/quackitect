// The views module: each base file under spec/views, a loaded projection of
// files/ under views/, and every base parsed in name order.
// [[spec/tickets/the-sidebar-reads-v1]]
package views

import "quackitect/src/q"

// [[spec/tickets/the-sidebar-reads-v1]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join()
}
