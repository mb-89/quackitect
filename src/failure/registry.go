// The registry: every failure node, keyed by its id.
// [[spec/design_output/failures#the-registry-reads-the-nodes]]
package failure

import "strings"

// Every node by its id. [[spec/design_output/failures#the-registry-reads-the-nodes]]
type Registry map[string]Node

// The node an id names, and whether one stands. [[spec/design_output/failures#the-registry-reads-the-nodes]]
func (one Registry) Node(id string) (Node, bool) {
	node, ok := one[id]
	return node, ok
}

// A registry off the nodes a case hands in. [[spec/design_output/failures#the-registry-reads-the-nodes]]
func Fake(nodes ...Node) Registry {
	out := Registry{}
	for _, node := range nodes {
		out[node.ID] = node
	}
	return out
}

// Every node the folder holds, read through the door, keeping each node NodeOf finds no fault in; the check names the faulted ones. [[spec/design_output/failures#the-registry-reads-the-nodes]]
func Load(from Reader) Registry {
	out := Registry{}
	for _, name := range from.Files(Folder) {
		id, ok := strings.CutSuffix(name, noteEnd)
		if !ok {
			continue
		}
		text, ok := from.Read(Folder + "/" + name)
		if !ok {
			continue
		}
		if node, faults := NodeOf(id, text); len(faults) == 0 {
			out[id] = node
		}
	}
	return out
}
