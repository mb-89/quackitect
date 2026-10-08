// The door's answer to a spawn: the spawn's own event, its prompt under the
// layer its kind reads.
// [[spec/tickets/spawn-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"quackitect/src/modules/hooks/brief"
	"quackitect/src/q"
	"quackitect/src/yaml"
)

// The field a spawn the wrapper makes itself carries, which takes no tag. [[spec/design_output/pull#a-hand-of-its-own]]
const ownField = "own"

// The spawn's event with its prompt wrapped, the hand's line in front of it, or nothing where neither stands. [[spec/tickets/spawn-answers-off-the-door]] [[spec/design_output/pull#a-hand-of-its-own]]
func (d *Door) spawned(post Post, root string) (Effect, bool) {
	if post.Event != spawnEvent || root == "" {
		return Effect{}, false
	}
	prompt := textOf(post.E, "prompt")
	layer := brief.LayerFor(d.treeAt(root), os.Getenv, textOf(post.E, "kind"))
	tag := ""
	if !yaml.Truthy(post.E[ownField]) && !strings.HasPrefix(textOf(post.E, "prompt"), q.HandOfItsOwn) {
		tag = spawnTagOf(disk{root})
	}
	if layer == "" && tag == "" {
		return Effect{}, false
	}
	event := make(map[string]any, len(post.E))
	for key, value := range post.E {
		event[key] = value
	}
	if layer != "" {
		prompt = brief.ForHelper(layer, prompt)
	}
	if tag != "" {
		prompt = tag + "\n\n" + prompt
	}
	event["prompt"] = prompt
	return Effect{Kind: eventKind, Result: event}, true
}

// The line a helper reads as the hand of the session the session file names, or nothing where the file names none. [[spec/design_output/pull#a-hand-of-its-own]]
func spawnTagOf(tree disk) string {
	var held map[string]any
	_ = json.Unmarshal([]byte(tree.text(sessionFile)), &held)
	id := strings.TrimSpace(textOf(held, "id"))
	if id == "" {
		return ""
	}
	return "You are the hand of session " + id + " on this box, so you pull under no --as."
}

// The notes under the method root with the post's root over it. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Door) treeAt(root string) brief.Tree {
	if method := d.from.Root; method != "" && filepath.Clean(method) != filepath.Clean(root) {
		return brief.Layered(disk{method}, disk{root})
	}
	return disk{root}
}
