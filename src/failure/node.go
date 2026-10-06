// A failure node: the id, the level, the remedies, and the reaction and the
// watch a node may name, read off one note's front.
// [[spec/design_output/failures#a-failure-is-a-node]]
package failure

import (
	"fmt"
	"regexp"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

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

// The node one note's text names, under the id its file name carries, and a fault a line for each field whose shape the node misses, since the schema reads no nested field. [[spec/design_output/failures#a-failure-is-a-node]] [[spec/tickets/failure-watch-shape]]
func NodeOf(id, text string) (Node, []string) {
	said := note.Read(text).Front.Said
	node := Node{ID: id, Level: yaml.AsString(said.Get("level")), Reaction: yaml.AsString(said.Get("reaction"))}
	faults := []string{}
	for _, one := range yaml.AsList(said.Get("remedies")) {
		remedy, ok := one.(string)
		if !ok || strings.TrimSpace(remedy) == "" {
			faults = append(faults, fmt.Sprintf("%s names a remedy that reads as no line of text", id))
			continue
		}
		node.Remedies = append(node.Remedies, remedy)
	}
	if len(node.Remedies) == 0 {
		faults = append(faults, fmt.Sprintf("%s names no remedy", id))
	}
	if said.Has("watch") {
		watch, faulted := watchOf(id, said.Get("watch"))
		node.Watch = watch
		faults = append(faults, faulted...)
	}
	return node, faults
}

// The watch a node names: an event, a pattern, and a quiet span a whole count of minutes. [[spec/design_output/failures#the-sentinel-fires-a-watch]] [[spec/tickets/failure-watch-shape]]
func watchOf(id string, value any) (*Watch, []string) {
	doc, ok := value.(*yaml.Doc)
	if !ok {
		return nil, []string{fmt.Sprintf("%s names a watch that reads as no map", id)}
	}
	faults := []string{}
	watch := &Watch{}
	for _, key := range doc.Keys() {
		switch value := doc.Get(key); key {
		case "event", "match":
			text, ok := value.(string)
			if !ok {
				faults = append(faults, fmt.Sprintf("%s names a watch %s that reads as no text", id, key))
			}
			if key == "event" {
				watch.Event = text
			} else {
				watch.Match = text
				if _, err := regexp.Compile(text); ok && err != nil {
					faults = append(faults, fmt.Sprintf("%s names a watch match that reads as no pattern", id))
				}
			}
		case "quiet":
			minutes, ok := value.(int)
			if !ok || minutes < 0 {
				faults = append(faults, fmt.Sprintf("%s names a quiet span that reads as no count of minutes", id))
			}
			watch.Quiet = minutes
		default:
			faults = append(faults, fmt.Sprintf("%s names a watch field %s, and a watch takes event, match and quiet", id, key))
		}
	}
	if watch.Event == "" {
		faults = append(faults, fmt.Sprintf("%s names a watch with no event", id))
	}
	return watch, faults
}
