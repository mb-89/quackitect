// The tree verbs: every verb cli.js answers outside a topic, each standing as
// an action of the verb topic through the node module.
// [[spec/tickets/agents-call-quack-directly]]
package verbs

import "quackitect/src/q"

// The topic the tree verbs stand under, which names no word of their own. [[spec/tickets/agents-call-quack-directly]]
const TreeTopic = "verb"

// Every verb cli.js answers outside a topic. [[spec/tickets/agents-call-quack-directly]]
var TreeVerbs = []Verb{}

// The module type of the tree verbs. [[spec/tickets/agents-call-quack-directly]]
func Tree(verbs []Verb) func(*q.Catalog) q.Writer {
	return Topic(TreeTopic, verbs)
}
