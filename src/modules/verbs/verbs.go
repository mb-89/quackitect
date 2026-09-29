// The verbs module: one action a verb of a topic, each handing its words to
// the node module, which runs the verb through cli.js until its port lands.
// [[spec/tickets/ticket-verbs-become-actions]]
package verbs

import (
	"fmt"

	"quackitect/src/q"
)

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
// Each action writes, since cli.js writes the tree, and declares no deadline, since the caller's wait keeps it free however long the verb runs. [[spec/design_output/model#a-caller-sets-its-wait]]
func Topic(topic string, verbs []Verb) func(*q.Catalog) q.Writer {
	return func(c *q.Catalog) q.Writer {
		hands := make([]q.Writer, 0, len(verbs))
		for _, one := range verbs {
			verb := one.Name
			hands = append(hands, q.ActionIn(c, verb, func(in Words) []q.Request {
				args := append([]string{topic, verb}, in.Args...)
				return []q.Request{{Module: NodeModule, Verb: NodeRun, Args: args, NoUndo: fmt.Sprintf("%s %s runs through cli.js, which keeps no undo", topic, verb)}}
			}, q.Doc(one.Doc), q.Writes()))
		}
		return q.Join(hands...)
	}
}
