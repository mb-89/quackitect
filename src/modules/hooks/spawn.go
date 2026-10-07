// The door's answer to a spawn: the spawn's own event, its prompt under the
// layer its kind reads.
// [[spec/tickets/spawn-answers-off-the-door]]
package hooks

import (
	"os"
	"path/filepath"

	"quackitect/src/modules/hooks/brief"
)

// The spawn's event with its prompt wrapped, or nothing where no layer stands. [[spec/tickets/spawn-answers-off-the-door]]
func (d *Door) spawned(post Post, root string) (Effect, bool) {
	if post.Event != spawnEvent || root == "" {
		return Effect{}, false
	}
	layer := brief.LayerFor(d.treeAt(root), os.Getenv, textOf(post.E, "kind"))
	if layer == "" {
		return Effect{}, false
	}
	event := make(map[string]any, len(post.E))
	for key, value := range post.E {
		event[key] = value
	}
	event["prompt"] = brief.ForHelper(layer, textOf(post.E, "prompt"))
	return Effect{Kind: eventKind, Result: event}, true
}

// The notes under the method root with the post's root over it. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Door) treeAt(root string) brief.Tree {
	if method := d.from.Root; method != "" && filepath.Clean(method) != filepath.Clean(root) {
		return brief.Layered(disk{method}, disk{root})
	}
	return disk{root}
}
