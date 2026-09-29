// The verbs module: one action a verb of a topic, each handing its words to
// the node module, which runs the verb through cli.js until its port lands.
// [[spec/tickets/ticket-verbs-become-actions]]
package verbs

import "quackitect/src/q"

// The IO module an action of a verb lists its request to, and the verb it asks. [[spec/tickets/ticket-verbs-become-actions]]
const (
	NodeModule = "node"
	NodeRun    = "run"
)

// One verb of a topic: its name and what it does. [[spec/tickets/ticket-verbs-become-actions]]
type Verb struct {
	Name string
	Doc  string
}

// The input of a verb's action: the words past the verb, as a person types them. [[spec/tickets/ticket-verbs-become-actions]]
type Words struct {
	Args []string `json:"args" doc:"the words past the verb, as a person types them"`
}

// The module type of a topic, registering one action a verb. [[spec/tickets/ticket-verbs-become-actions]]
func Topic(topic string, verbs []Verb) func(*q.Catalog) q.Writer {
	return func(*q.Catalog) q.Writer { return q.Writer{} }
}
