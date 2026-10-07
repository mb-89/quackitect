// The door's answer to a spawn: the spawn's own event, its prompt under the
// layer its kind reads, as onAgentSpawn in src/bridge/guidance.js answers.
// [[spec/tickets/spawn-answers-off-the-door]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"

	"quackitect/src/modules/hooks/brief"
)

// The spawn's event with its prompt wrapped, or nothing where no layer stands. [[spec/tickets/spawn-answers-off-the-door]]
func (d *Door) spawned(post Post, root string) (Effect, bool) {
	if post.Event != spawnEvent || root == "" {
		return Effect{}, false
	}
	prompt := textOf(post.E, "prompt")
	layer := brief.LayerFor(d.treeAt(root), os.Getenv, textOf(post.E, "kind"))
	if layer != "" {
		prompt = brief.ForHelper(layer, prompt)
	}
	if post.E["own"] != true {
		if tag := spawnTagIn(disk{root}); tag != "" {
			prompt = tag + "\n\n" + prompt
		}
	}
	if prompt == textOf(post.E, "prompt") {
		return Effect{}, false
	}
	event := make(map[string]any, len(post.E))
	for key, value := range post.E {
		event[key] = value
	}
	event["prompt"] = prompt
	return Effect{Kind: eventKind, Result: event}, true
}

// The tag of the hand of the session the session file names, or nothing where it names none. [[spec/design_output/pull#a-hand-of-its-own]]
func spawnTagIn(tree disk) string {
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
