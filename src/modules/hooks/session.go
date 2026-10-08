// The session file the door writes on a session's start: the id and the
// harness, which the hand reads off it.
// [[spec/tickets/level0-hooks-forward-to-go]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// Writes the session file off a session start under the root. A start naming no id writes nothing, and a failing write leaves the answer standing, as the marks do. [[spec/design_output/pull#the-hand-and-the-hold]]
func (d *Door) writesSession(post Post, root string) {
	if post.Event != startEvent || root == "" {
		return
	}
	id := strings.TrimSpace(sessionOf(post))
	if id == "" || id == noSession {
		return
	}
	harness := strings.TrimSpace(textOf(post.E, "harness", "client"))
	body, err := json.MarshalIndent(map[string]string{"id": id, "harness": harness}, "", markIndent)
	if err != nil {
		return
	}
	at := disk{root}.at(sessionFile)
	if os.MkdirAll(filepath.Dir(at), folderMode) == nil {
		_ = os.WriteFile(at, append(body, '\n'), fileMode)
	}
}
