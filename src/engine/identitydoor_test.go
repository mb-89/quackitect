package main

import (
	"bytes"
	"encoding/json"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// THE IDENTITY DOOR IS DRIVEN AS A DOOR, NOT AS A PATTERN.
//
// identityMaterial is tabled on its own, and nothing drove decidePreToolUse.
// The .se exemption is what that costs: it is not in identityMaterial at all.
// It rests on where the block sits in hook.go, inside the branch underPrivate
// guards. Move the block one brace out and .se writes start being refused,
// and every test in the tree stays green. So this asks the decision itself.
//
// THE ROWS ARE THE RULING'S OWN THREE CASES: a tracked file is refused, .se is
// taken, and a machine field keeps its stamp. Each row asserts what the door
// said about identity, and the .se row asserts the write went through whole.
func TestTheIdentityDoorDecidesWrites(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	const dated = "Measured on 2026-09-04, and six failed.\n"
	for _, one := range []struct {
		what     string
		path     string
		writes   string
		identity bool // refused, and the refusal is about identity material
		taken    bool // the door said nothing at all
	}{
		{
			what:     "an ISO date in prose, into a tracked file",
			path:     filepath.Join("doc", "work", "dated.md"),
			writes:   dated,
			identity: true,
		},
		{
			// THE SCRATCHPAD IS UNDER .se AND OUTSIDE THE TOKEN GATE, so this is
			// the one write of the three that can come out the far side whole.
			what:   "the same prose under .se",
			path:   filepath.Join(".se", "scratchpad", "dated.md"),
			writes: dated,
			taken:  true,
		},
		{
			what: "a write whose only stamp is a frontmatter field",
			path: filepath.Join("doc", "work", "stamped.md"),
			writes: "---\nclaimed_at: 2026-09-04T17:00:00Z\n---\n\n" +
				"The hold stands and the walker left it where it was.\n",
		},
	} {
		said := aWriteAtTheDoor(t, r, log, filepath.Join(r.Work, one.path), one.writes)
		denied := strings.Contains(said, `"permissionDecision":"deny"`)
		about := strings.Contains(said, "identity material")
		if about != one.identity {
			t.Errorf("%s: refused for identity is %v and should be %v. The door said: %s",
				one.what, about, one.identity, said)
		}
		if one.identity && !denied {
			t.Errorf("%s: the door spoke of identity and denied nothing: %s", one.what, said)
		}
		if one.identity && !strings.Contains(said, "2026-09-04") {
			t.Errorf("%s: the refusal does not name what it matched: %s", one.what, said)
		}
		if one.taken && said != "" {
			t.Errorf("%s: the write was not taken whole. The door said: %s", one.what, said)
		}
	}
}

// aWriteAtTheDoor drives one harness Write through the PreToolUse decision and
// answers what the guard wrote, which is nothing when the call is allowed.
func aWriteAtTheDoor(t *testing.T, r Roots, log *sessionlog.Log, path, content string) string {
	t.Helper()
	input, err := json.Marshal(map[string]string{"file_path": path, "content": content})
	if err != nil {
		t.Fatal(err)
	}
	var said bytes.Buffer
	in := hookIn{SessionID: "s-1", Event: "PreToolUse", ToolName: "Write", ToolInput: input}
	decidePreToolUse(&guard{out: &said}, r, LoadConfig(r), Emergency{}, log, in, "worker-door")
	return said.String()
}
