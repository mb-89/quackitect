// The handover marks the door writes off the stops fold's answer, off marksDue,
// dropsDue and dropsClear in src/bridge/handover.js, and the hand a retro hold
// meets, off HandOf in src/pull/pull_holds.go.
// [[spec/tickets/cage-stop-marks-port]]
package hooks

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
)

// The runtime files the handover reads, which the package spells again. [[spec/tickets/cage-stop-marks-port]]
const (
	// .claude/skills/level0/lib/folders.js owns the due mark's folder, and the package spells it again. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
	dueFile = ".se/.runtime/due.json"
	// .claude/skills/level0/lib/folders.js owns the box file's folder, and the package spells it again. [[spec/design_output/pull#the-hand-and-the-hold]]
	boxFile = ".se/.runtime/box.json"
	// .claude/skills/level0/lib/folders.js owns the session file's folder, and the package spells it again. [[spec/design_output/pull#the-hand-and-the-hold]]
	sessionFile = ".se/.runtime/session.json"
)

// The joint of a hand's parts, and the shape the due mark lands in. [[spec/tickets/cage-stop-marks-port]]
const (
	handJoin   = " · "
	markIndent = "  "
	folderMode = 0o755
	fileMode   = 0o644
)

// The variables naming the harness, and the name each gives, off harness in src/pull/pull_holds.go. [[spec/design_output/pull#the-hand-rule]]
var harnesses = [][2]string{
	{"CLAUDE_CODE_REMOTE", "claude-code-remote"},
	{"SE_CLOUD", "se-cloud"},
	{"CLAUDECODE", "claude-code"},
}

// What an event writes and drops: the due mark, the due mark's drop, the clear held where the queue no longer clears, and the read put in the clear's place. [[spec/tickets/cage-stop-marks-port]] [[spec/tickets/the-clear-hands-back-the-leaf]]
type Marks struct {
	Due       *DueMark `json:"due,omitempty"`
	DropDue   bool     `json:"dropDue,omitempty"`
	DropClear bool     `json:"dropClear,omitempty"`
	ReadNext  bool     `json:"readNext,omitempty"`
}

// The due mark as marksDue writes it: the fill, and the key it passed. [[spec/design_input/the-clear-hands-ephemeral-tickets#the-ticket-ends-first]]
type DueMark struct {
	Tokens float64 `json:"tokens"`
	At     int     `json:"at"`
}

func (state *Stops) marks() *Marks {
	if state.Said.Marks == nil {
		state.Said.Marks = &Marks{}
	}
	return state.Said.Marks
}

// Writes the marks the stops fold names at the event's own place. A post standing in no tree writes nothing, and a failing write leaves the answer standing, as the drops do. [[spec/tickets/cage-stop-marks-port]]
func (d *Door) marks(session, root string) {
	if root == "" {
		return
	}
	state, ok := d.from.Store.Snapshot().Read(d.stopsOf(session)).(Stops)
	d.mu.Lock()
	seq := d.seqs[session]
	d.mu.Unlock()
	if !ok || state.Said.Seq != seq || state.Said.Marks == nil {
		return
	}
	tree, marks := disk{root}, state.Said.Marks
	if marks.DropClear {
		for _, name := range tree.List(holdsFolder) {
			var held heldFile
			text, found := tree.Read(holdsFolder + "/" + name)
			if found && json.Unmarshal([]byte(text), &held) == nil && held.Ephemeral && heldText(held.Ticket) == clearTicket {
				_ = os.Remove(tree.at(holdsFolder + "/" + name))
			}
		}
	}
	if marks.ReadNext {
		readsNext(tree)
	}
	if marks.DropClear || marks.DropDue || marks.ReadNext {
		_ = os.Remove(tree.at(dueFile))
	}
	if marks.Due != nil {
		_ = writeMark(tree.at(dueFile), marks.Due)
	}
}

// Each clear held turns into the read, keeping every other field, as readsNext in src/bridge/handover.js wrote it. [[spec/tickets/the-clear-hands-back-the-leaf]]
func readsNext(tree disk) {
	for _, name := range tree.List(holdsFolder) {
		at := holdsFolder + "/" + name
		text, found := tree.Read(at)
		var held map[string]any
		if !found || json.Unmarshal([]byte(text), &held) != nil || held["ephemeral"] != true || heldText(held["ticket"]) != clearTicket {
			continue
		}
		held["ticket"], held["step"] = readTicket, readTicket
		if body, err := json.MarshalIndent(held, "", markIndent); err == nil {
			_ = os.WriteFile(tree.at(at), append(body, '\n'), fileMode)
		}
	}
}

func writeMark(at string, due *DueMark) error {
	body, err := json.MarshalIndent(due, "", markIndent)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(at), folderMode); err != nil {
		return err
	}
	return os.WriteFile(at, append(body, '\n'), fileMode)
}

// The hand this session stands in: the box, the session on it, and the harness. Off a harness, or on a box naming no id, the hand reads empty. [[spec/design_output/pull#the-hand-and-the-hold]]
func handIn(tree disk) string {
	agent := ""
	for _, pair := range harnesses {
		if strings.TrimSpace(os.Getenv(pair[0])) != "" {
			agent = pair[1]
			break
		}
	}
	var held map[string]any
	_ = json.Unmarshal([]byte(tree.text(sessionFile)), &held)
	id := boxIDIn(tree)
	if agent == "" || id == "" {
		return ""
	}
	if said := strings.TrimSpace(textOf(held, "harness")); said != "" {
		agent = said
	}
	parts := []string{"box " + id}
	if session := textOf(held, "id"); session != "" {
		parts = append(parts, "session "+session)
	}
	return strings.Join(append(parts, agent), handJoin)
}

// The id the box file under the tree names, or nothing. [[spec/tickets/git-hooks-run-in-go]]
func boxIDIn(tree disk) string {
	var box map[string]any
	_ = json.Unmarshal([]byte(tree.text(boxFile)), &box)
	return textOf(box, "id")
}

// A hold stands in the session's own hand where its hand matches, and every hold does where the session's hand reads empty. [[spec/tickets/the-retro-reads-its-hand]]
func ownsHold(hand string, held heldFile) bool {
	return hand == "" || heldText(held.Hand) == hand
}
