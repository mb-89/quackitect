// The verbs module: one action a verb of a topic, each handing its words to
// the node module, which runs the verb through cli.js until its port lands.
// [[spec/tickets/ticket-verbs-become-actions]]
package verbs

import (
	"fmt"
	"strings"

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
	return actions(verbs, func(verb string) []string { return []string{topic, verb} })
}

// The actions of a list of verbs, each handing the words before it and the caller's words to the node module. [[spec/tickets/agents-call-quack-directly]]
func actions(verbs []Verb, before func(verb string) []string) func(*q.Catalog) q.Writer {
	return func(c *q.Catalog) q.Writer {
		hands := make([]q.Writer, 0, len(verbs))
		for _, one := range verbs {
			head := before(one.Name)
			hands = append(hands, q.ActionIn(c, one.Name, func(in Words) []q.Request {
				args := append(append([]string{}, head...), in.Args...)
				return []q.Request{{Module: NodeModule, Verb: NodeRun, Args: args, NoUndo: fmt.Sprintf("%s runs through cli.js, which keeps no undo", strings.Join(head, " "))}}
			}, q.Doc(one.Doc), q.Writes()))
		}
		return q.Join(hands...)
	}
}

// The one request a verb lists: the node module runs the topic, the verb and its words through cli.js. [[spec/tickets/ticket-verbs-become-actions]]
func nodeRun(topic, verb string, words ...string) []q.Request {
	args := append([]string{topic, verb}, words...)
	return []q.Request{{Module: NodeModule, Verb: NodeRun, Args: args, NoUndo: fmt.Sprintf("%s %s runs through cli.js, which keeps no undo", topic, verb)}}
}
