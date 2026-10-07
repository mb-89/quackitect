// The hand a step stands in: the box, the session on it, and the agent inside
// it where the harness names one, and the hold that hand keeps on the box, as
// src/scripts/pull-hand-of.js and the hold reads answer them.
// [[spec/design_output/pull#the-hand-and-the-hold]]
package branches

import (
	"encoding/json"
	"regexp"
	"strings"

	"quackitect/src/pull"
)

// Where the box id, the session, the identity and the holds stand, and the length of a minted box id. [[spec/design_output/pull#the-hand-and-the-hold]]
const (
	boxFile     = runtimeFolder + "/box.json"
	sessionFile = runtimeFolder + "/session.json"
	identity    = runtimeFolder + "/identity.json"
	holdsFolder = runtimeFolder + "/hold"
	boxID       = 12
	stampLayout = "2006-01-02T15:04:05.000Z"
)

// The variables a harness sets, each with the name the hand carries, and the ones naming a cloud box. [[spec/design_output/pull#the-hand-rule]]
var (
	harness = [][2]string{
		{"CLAUDE_CODE_REMOTE", "claude-code-remote"},
		{"SE_CLOUD", "se-cloud"},
		{"CLAUDECODE", "claude-code"},
	}
	cloudVars = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}
)

var slugAt = regexp.MustCompile(`[^A-Za-z0-9]+`)

// The harness this box runs under, or nothing off a harness. [[spec/design_output/pull#the-hand-and-the-hold]]
func (d *Doors) agentName() string {
	for _, one := range harness {
		if strings.TrimSpace(d.env(one[0])) != "" {
			return one[1]
		}
	}
	return ""
}

// Whether a harness runs this box. [[spec/design_output/pull#the-hand-rule]]
func (d *Doors) agent() bool { return d.agentName() != "" }

// Whether this box runs on the cloud, where nobody sits beside it. [[spec/guidance/cloud/cloud]]
func (d *Doors) cloud() bool {
	for _, name := range cloudVars {
		said := strings.ToLower(strings.TrimSpace(d.env(name)))
		if said != "" && said != "0" && said != "false" {
			return true
		}
	}
	return false
}

// The hand this box works as: a person off a harness, else the box, the session and the harness. [[spec/design_output/pull#the-hand-and-the-hold]]
func (d *Doors) handOf() string {
	if !d.agent() {
		d.boxOf()
		if who, _ := d.Repo.Config("user.name"); strings.TrimSpace(who) != "" {
			who = strings.TrimSpace(who)
			return byPerson + " " + who
		}
		return byPerson
	}
	var session struct {
		ID      any    `json:"id"`
		Harness string `json:"harness"`
	}
	_ = json.Unmarshal([]byte(d.read(sessionFile)), &session)
	name := strings.TrimSpace(session.Harness)
	if name == "" {
		name = d.agentName()
	}
	parts := []string{"box " + d.boxOf()}
	if id := idOf(session.ID); id != "" {
		parts = append(parts, "session "+id)
	}
	if name != "" {
		parts = append(parts, name)
	}
	return strings.Join(parts, " · ")
}

// An id off JSON as text, a number or a word. [[spec/design_output/pull#the-hand-and-the-hold]]
func idOf(said any) string {
	switch one := said.(type) {
	case nil:
		return ""
	case string:
		return one
	case float64:
		if one == 0 {
			return ""
		}
		out, _ := json.Marshal(one)
		return string(out)
	case bool:
		if one {
			return "true"
		}
	}
	return ""
}

// The role a tracked file holds: person for any person's hand, the hand itself otherwise. [[spec/design_output/pull#the-hand-rule]]
func roleOf(hand string) string {
	said := strings.TrimSpace(hand)
	if said == byPerson || strings.HasPrefix(said, byPerson+" ") {
		return byPerson
	}
	return said
}

// The id this box carries, off the box file under the work root or the identity under the method root. [[spec/tickets/one-writer-holds-a-branch]]
func (d *Doors) boxIDHere() string {
	for _, text := range []string{d.read(boxFile), d.methodRead(identity)} {
		var said struct {
			ID any `json:"id"`
		}
		if json.Unmarshal([]byte(text), &said) == nil && idOf(said.ID) != "" {
			return idOf(said.ID)
		}
	}
	return ""
}

// The box's id, minted and written under the work root where it carries none. [[spec/design_output/vehicle#the-work-root-inherits]]
func (d *Doors) boxOf() string {
	if here := d.boxIDHere(); here != "" {
		return here
	}
	stamp := ""
	if d.Now != nil {
		stamp = d.Now().UTC().Format(stampLayout)
	}
	quoted, _ := json.Marshal(stamp + " " + d.Root)
	id := pull.HashText(string(quoted))[:boxID]
	line, _ := json.Marshal(map[string]string{"id": id})
	_ = d.write(boxFile, string(line)+"\n")
	return id
}

// A hand's hold: the ticket, its path and the step it works, with the notes the step reads. [[spec/design_output/pull#the-hand-and-the-hold]]
type holdFile struct {
	Ticket string `json:"ticket"`
	Path   string `json:"path"`
	Step   string `json:"step"`
	Hash   string `json:"hash"`
	Reads  []struct {
		Name string `json:"name"`
	} `json:"reads"`
}

// Where a hand's hold stands. [[spec/design_output/pull#the-hand-and-the-hold]]
func holdAt(hand string) string {
	return holdsFolder + "/" + slugAt.ReplaceAllString(hand, "-") + ".json"
}

// The hold of one hand while its ticket stands open, or nil. [[spec/design_output/pull#the-hand-and-the-hold]]
func (d *Doors) holdOf(hand string) *holdFile {
	at := holdAt(hand)
	if !d.exists(at) {
		return nil
	}
	var said holdFile
	if json.Unmarshal([]byte(d.read(at)), &said) != nil {
		return nil
	}
	if said.Path != "" && d.exists(said.Path) && fieldOf(d.read(said.Path), "state") == closedState {
		return nil
	}
	return &said
}

// Drops a hand's hold. [[spec/design_output/pull#the-hand-and-the-hold]]
func (d *Doors) dropHold(hand string) { d.remove(holdAt(hand)) }
