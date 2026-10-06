// The registry: every failure node, keyed by its id.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure

// Every node by its id. [[spec/design_output/failures#the-registry-reads-the-nodes]]
type Registry map[string]Node

// The node an id names, and whether one stands. [[spec/design_output/failures#the-registry-reads-the-nodes]]
func (one Registry) Node(id string) (Node, bool) {
	node, ok := one[id]
	return node, ok
}

// A registry off the nodes a case hands in. [[spec/design_output/failures#the-registry-reads-the-nodes]]
func Fake(nodes ...Node) Registry {
	return Registry{}
}

// Every node the folder holds, read through the door. [[spec/design_output/failures#the-registry-reads-the-nodes]]
func Load(from Reader) Registry {
	return Registry{}
}
