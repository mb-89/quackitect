// The hold a hand works a step in, the hand's name, and the guidance it holds
// with the step.
// [[spec/design_output/pull#the-hand-and-the-hold]]
package pull

import (
	"encoding/json"
	"regexp"
	"sort"
	"strings"
)

// The folders and files the hand and the hold stand in. [[spec/design_output/pull#the-hand-and-the-hold]]
const (
	// The runtime half and the retro half of the private folder, which src/modules/check/folders.go owns. [[spec/design_output/pull#the-hand-and-the-hold]]
	runtimeFolder = ".se/.runtime"
	retroFolder   = ".se/.retro" // folders.go owns this name too
	Holds         = runtimeFolder + "/hold"
	boxFile       = runtimeFolder + "/box.json"
	sessionFile   = runtimeFolder + "/session.json"
	identity      = runtimeFolder + "/identity.json"
	planFile      = runtimeFolder + "/plan.json"
	Guidance      = "spec/guidance"
	boxID         = 12
	Person        = "person"
	// What a hand reads where the owner sends it into a person's step. [[spec/design_output/pull#the-hand-and-the-hold]]
	Says = "the owner says so"
)

// The harness variables and the name each gives the agent, first match first. [[spec/design_output/pull#the-hand-rule]]
var harness = [][2]string{{"CLAUDE_CODE_REMOTE", "claude-code-remote"}, {"SE_CLOUD", "se-cloud"}, {"CLAUDECODE", "claude-code"}}

// The variables that say a box runs on the cloud. [[spec/guidance/cloud/cloud]]
var cloudVars = []string{"CLAUDE_CODE_REMOTE", "SE_CLOUD"}

var slugGap = regexp.MustCompile(`[^A-Za-z0-9]+`)

// One note a hold remembers, by its name and hash. [[spec/design_output/pull#the-hand-and-the-hold]]
type Read struct {
	Name string `json:"name"`
	Hash string `json:"hash"`
}

// The hold one hand works a step in. [[spec/design_output/pull#the-hand-and-the-hold]]
type Hold struct {
	Ticket    string `json:"ticket"`
	Path      string `json:"path"`
	Step      string `json:"step"`
	Ephemeral bool   `json:"ephemeral,omitempty"`
	By        string `json:"by,omitempty"`
	Group     string `json:"group,omitempty"`
	Hand      string `json:"hand"`
	Hash      string `json:"hash,omitempty"`
	Taken     string `json:"taken"`
	Refused   int    `json:"refused"`
	Reads     []Read `json:"reads"`
	Payload   string `json:"payload,omitempty"`
	Rest      string `json:"rest,omitempty"`
}

// Whether a value of the environment reads as set. [[spec/guidance/cloud/cloud]]
func truthy(said string) bool {
	said = strings.ToLower(strings.TrimSpace(said))
	return said != "" && said != "0" && said != "false"
}

// The agent a harness names, or nothing off a harness. [[spec/design_output/pull#the-hand-and-the-hold]]
func AgentOf(env map[string]string) string {
	for _, one := range harness {
		if strings.TrimSpace(env[one[0]]) != "" {
			return one[1]
		}
	}
	return ""
}

// Whether the environment says this box runs on the cloud. [[spec/guidance/cloud/cloud]]
func InCloud(env map[string]string) bool {
	for _, name := range cloudVars {
		if truthy(env[name]) {
			return true
		}
	}
	return false
}

// The hand a step stands in: the box, the session on it, and the agent inside it where the harness names one. Off a harness the hand reads person, and git carries who that is. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) HandOf() string {
	if !it.Agent && AgentOf(it.Env) == "" {
		it.boxOf()
		who, _ := it.Git.Config("user.name")
		who = strings.TrimSpace(who)
		if who == "" {
			return Person
		}
		return Person + " " + who
	}
	var held struct {
		Harness string `json:"harness"`
		ID      string `json:"id"`
	}
	if text, ok := it.Disk.Read(sessionFile); ok {
		_ = json.Unmarshal([]byte(text), &held)
	}
	agent := strings.TrimSpace(held.Harness)
	if agent == "" {
		agent = AgentOf(it.Env)
	}
	parts := []string{"box " + it.boxOf()}
	if held.ID != "" {
		parts = append(parts, "session "+held.ID)
	}
	if agent != "" {
		parts = append(parts, agent)
	}
	return strings.Join(parts, " · ")
}

// The id this box carries, off the box file under the work root, then the identity under the method root. [[spec/tickets/one-writer-holds-a-branch]]
func (it *It) BoxIDHere() string {
	for _, path := range []string{boxFile, identity} {
		text, ok := it.Disk.Read(path)
		if path == identity && it.Method != "" && it.Method != it.Root {
			text, ok = OSDisk{Root: it.Method}.Read(path)
		}
		var held struct {
			ID any `json:"id"`
		}
		if ok && json.Unmarshal([]byte(text), &held) == nil && held.ID != nil && held.ID != "" {
			return jsString(held.ID)
		}
	}
	return ""
}

// The box id, written where none stands. [[spec/design_output/vehicle#the-work-root-inherits]]
func (it *It) boxOf() string {
	if here := it.BoxIDHere(); here != "" {
		return here
	}
	id := HashOf(it.Stamp() + " " + it.Root)[:boxID]
	_ = it.Disk.Write(boxFile, `{"id":`+jsQuote(id)+"}\n")
	return id
}

// A tracked file holds no person's name, so the record takes the role off the hand. [[spec/design_output/pull#the-hand-rule]]
func RoleOf(hand string) string {
	said := strings.TrimSpace(hand)
	if said == Person || strings.HasPrefix(said, Person+" ") {
		return Person
	}
	return said
}

// A person's hand takes any ticket, and the owner's word sends a hand the same way. [[spec/design_output/config#the-engine-controls]]
func (it *It) byPerson(hand string) bool { return RoleOf(hand) == Person || it.OwnerSays }

// The file a hand's hold stands in. [[spec/design_output/pull#the-hand-and-the-hold]]
func holdAt(hand string) string { return Holds + "/" + slugGap.ReplaceAllString(hand, "-") + ".json" }

// The hold of one hand, where its ticket stands. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) HoldOf(hand string) *Hold {
	text, ok := it.Disk.Read(holdAt(hand))
	if !ok {
		return nil
	}
	var held Hold
	if json.Unmarshal([]byte(text), &held) != nil || !it.ticketStands(held.Path) {
		return nil
	}
	return &held
}

// A hold stands while its ticket does: a hold naming no path stands, and so does one whose ticket stands on another branch alone. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) ticketStands(path string) bool {
	path = strings.TrimSpace(path)
	if path == "" {
		return true
	}
	text, ok := it.Disk.Read(path)
	return !ok || FieldOf(text, "state") != Closed
}

// Every hold file on the box, each with its path. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) holdFiles() map[string]Hold {
	out := map[string]Hold{}
	for _, name := range it.Disk.Files(Holds) {
		if !strings.HasSuffix(name, ".json") {
			continue
		}
		var held Hold
		if text, ok := it.Disk.Read(Holds + "/" + name); ok && json.Unmarshal([]byte(text), &held) == nil {
			out[Holds+"/"+name] = held
		}
	}
	return out
}

// Every hold on the box whose ticket stands, in the order the folder lists them. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) EveryHold() []Hold {
	files := it.holdFiles()
	paths := make([]string, 0, len(files))
	for path := range files {
		paths = append(paths, path)
	}
	sort.Strings(paths)
	out := []Hold{}
	for _, path := range paths {
		if held := files[path]; it.ticketStands(held.Path) {
			out = append(out, held)
		}
	}
	return out
}

// The pull alone removes a hold file, and only one whose ticket reads closed. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) dropsClosedHolds() {
	for path, held := range it.holdFiles() {
		if !it.ticketStands(held.Path) {
			it.remove(path)
		}
	}
}

// Removes a file under the root. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) remove(path string) { _ = it.Disk.Remove(path) }

func (it *It) writeHold(hand string, held Hold) {
	if held.Reads == nil {
		held.Reads = []Read{}
	}
	text, _ := json.MarshalIndent(held, "", "  ")
	_ = it.Disk.Write(holdAt(hand), string(text)+"\n")
}

func (it *It) dropHold(hand string) { it.remove(holdAt(hand)) }

// The working todo the plan names. [[spec/tickets/the-todo-joins-the-queue]]
func (it *It) workingTodo() string {
	var plan struct {
		Working string `json:"working"`
	}
	if text, ok := it.Disk.Read(planFile); ok {
		_ = json.Unmarshal([]byte(text), &plan)
	}
	// The clear's tickets stand in the hold, so a plan naming one holds no pull back. [[spec/tickets/the-clear-hands-back-the-leaf]]
	if working := strings.TrimSpace(plan.Working); !ephemeralName(working) {
		return working
	}
	return ""
}

// The as a hold was taken under, read back off the hand it names. [[spec/design_output/pull#the-hand-and-the-hold]]
func (it *It) asOf(held Hold) string {
	mine := it.HandOf() + " · "
	if strings.HasPrefix(held.Hand, mine) {
		return held.Hand[len(mine):]
	}
	return ""
}

// A note the work root names again replaces the method's. [[spec/design_output/vehicle#the-work-root-inherits]]
func (it *It) guidanceText(path string) string {
	if text, ok := it.Disk.Read(path + ".md"); ok {
		return text
	}
	if it.Method != "" && it.Method != it.Root {
		if text, ok := (OSDisk{Root: it.Method}).Read(path + ".md"); ok {
			return text
		}
	}
	return ""
}

// Each note by its name and the hash of its text. [[spec/design_output/pull#what-a-hand-out-reads]]
func (it *It) readsOf(paths []string) []Read {
	out := []Read{}
	for _, path := range paths {
		out = append(out, Read{Name: path, Hash: HashOf(it.guidanceText(path))})
	}
	return out
}

// [[spec/design_output/log#which-kind-says-what]]
func (it *It) noteRows(step string, reads []Read) {
	if it.Log == nil {
		return
	}
	for _, one := range reads {
		it.Log("info", "work", "guidance "+one.Name+" rides "+step, map[string]any{"note": one.Name, "hash": one.Hash, "step": step})
	}
}

// A refusal, a compaction and a moved hash each hand the notes again, and nothing else does. [[spec/design_output/pull#the-hand-and-the-hold]]
func handsAgain(held Hold, now []Read) string {
	if len(now) == 0 {
		return ""
	}
	if held.Refused > 0 {
		return "refused"
	}
	if len(held.Reads) == 0 {
		return "compacted"
	}
	was := map[string]string{}
	for _, one := range held.Reads {
		was[one.Name] = one.Hash
	}
	for _, one := range now {
		if hash, ok := was[one.Name]; !ok || hash != one.Hash {
			return "moved"
		}
	}
	return ""
}

// Each note stands as a section: a heading naming it, its rules numbered as the note numbers them, then its Examples table. [[spec/design_input/level-two#guidance]]
func (it *It) notesSaid(paths []string) []string {
	rows := []string{}
	for _, path := range paths {
		if it.Rules == nil {
			continue
		}
		rules := it.Rules(it.guidanceText(path))
		if len(rules) == 0 {
			continue
		}
		rows = append(append(rows, "", "# Reads "+path, ""), rules...)
	}
	return rows
}

// The notes a leaf reads, off the guidance topic. [[spec/tickets/the-guidance-topic-lands]]
func (it *It) notesOf(text string, leaf *Leaf) []string {
	if it.Notes == nil {
		return []string{}
	}
	return it.Notes(processNameOf(text) + ":" + leaf.Path)
}

// The name of the process a ticket names, as the guidance module keys its leaves. [[spec/tickets/the-guidance-topic-lands]]
func processNameOf(text string) string {
	said := FieldOf(text, "process")
	return said[strings.LastIndex(said, "/")+1:]
}

// A value off JSON as String writes it. [[spec/design_output/pull#the-hand-and-the-hold]]
func jsString(said any) string {
	switch one := said.(type) {
	case string:
		return one
	case float64:
		text, _ := json.Marshal(one)
		return string(text)
	}
	text, _ := json.Marshal(said)
	return string(text)
}
