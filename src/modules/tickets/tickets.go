// The tickets module: every ticket under the ticket folders, read off files/
// through the markdown codec, under the out-port all.
// [[spec/design_output/model#everything-on-disk-mirrors]]
package tickets

import "quackitect/src/q"

// The out-port every ticket stands under, by its local name. [[spec/tickets/tickets-becomes-a-module]]
const AllPort = "all"

// [[spec/tickets/tickets-becomes-a-module]]
type Ticket struct {
	Name     string `json:"name"`
	Group    string `json:"group"`
	Says     string `json:"says"`
	Standing string `json:"standing"`
}

// [[spec/tickets/tickets-becomes-a-module]]
func Registers(c *q.Catalog) q.Writer {
	return q.GivenIn(c, AllPort, []Ticket{}, q.Doc("every ticket, with its Ask and its standing"))
}
