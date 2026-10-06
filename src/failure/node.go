// A failure node: the id, the level, the remedies, and the reaction and the
// watch a node may name, read off one note's front.
// [[spec/design_output/failures#a-failure-is-a-node]]
package failure

// The folder every node stands in, and the ending each node's file takes. [[spec/design_output/failures#a-failure-is-a-node]]
const (
	Folder  = "spec/failures"
	noteEnd = ".md"
)

// One failure, as its node names it. [[spec/design_output/failures#a-failure-is-a-node]]
type Node struct {
	ID       string
	Level    string
	Remedies []string
	Reaction string
	Watch    *Watch
}

// The event a sentinel fires a failure on. [[spec/design_output/failures#the-sentinel-fires-a-watch]]
type Watch struct {
	Event string
	Match string
	Quiet int
}

// The node one note's text names, under the id its file name carries. [[spec/design_output/failures#a-failure-is-a-node]]
func NodeOf(id, text string) Node {
	return Node{ID: id}
}
