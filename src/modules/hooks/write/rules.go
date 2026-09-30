// The edit door's rules past the schema and the voice, off onWrite in
// src/bridge/write.js: the bless file, the markers of a merge, the open
// ticket, the engine's fields, and the projection owning a path.
// [[spec/tickets/edit-door-rules-port]]
package write

import (
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The owner's word on who blesses, which src/scripts/pull-bless.js names, the folder the tickets on git stand in, and the chapter anybody writes. [[spec/design_output/pull#the-bless]]
const (
	BlessFile     = ".se/.runtime/bless.json"
	TicketsOnGit  = "spec/tickets/"
	noteEnd       = ".md"
	discussion    = "\n# Discussion\n"
	fence         = "---"
	pullVerb      = "./RUNME.sh ticket pull"
	stateKey      = "state"
	openState     = "open"
	ticketKind    = "[[ticket]]"
	kindKey       = "kind"
	carriageBreak = "\r\n"
)

// A top-level key of a front. [[spec/design_output/schema#the-verbs-own-their-fields]]
var topKey = regexp.MustCompile(`^([A-Za-z_][\w-]*):`)

// [[spec/design_output/pull#the-bless]]
func BlessRefusal() string {
	return BlessFile + " is the owner's word on who blesses, and the sidebar button alone writes it. An agent reads and writes it nowhere."
}

// The refusal of a write to a merging ticket still carrying markers. [[spec/design_output/pull#a-merge-opens-the-ticket]]
func MarkedRefusal(where string, lines []int) string {
	said := make([]string, 0, len(lines))
	for _, one := range lines {
		said = append(said, strconv.Itoa(one))
	}
	return where + " still carries conflict markers, at line(s) " + strings.Join(said, ", ") + ". Write it whole without them: keep the lines each side holds that the ticket needs, and drop every marker line."
}

// Whether a text reads as a ticket, and whether it stands open. [[spec/design_output/pull#the-fields-ride-the-payload]]
func ticketState(text string) (bool, string) {
	said := note.Read(text).Front
	if !said.Stands || yaml.AsString(said.Said.Get(kindKey)) != ticketKind {
		return false, ""
	}
	return true, yaml.AsString(said.Said.Get(stateKey))
}

// An open ticket on git takes its answers through the pull, and its Discussion from anybody. [[spec/design_output/pull#the-fields-ride-the-payload]]
func OpenTicketRefusal(where, was, whole string) string {
	if !strings.HasPrefix(where, TicketsOnGit) || !strings.HasSuffix(where, noteEnd) {
		return ""
	}
	if ticket, state := ticketState(was); !ticket || state != openState {
		return ""
	}
	if talkless(whole) == talkless(was) {
		return ""
	}
	return where + " stands open, and the engine writes it. Hand the answer back with " + pullVerb + " <ticket> --fields '{\"<field>\": \"...\"}', or write under # Discussion alone."
}

// [[spec/design_output/pull#the-fields-ride-the-payload]]
func talkless(text string) string {
	said, _, _ := strings.Cut(strings.ReplaceAll(text, carriageBreak, "\n"), discussion)
	return said
}

// A ticket's engine fields back as the disk holds them, and the keys put back. [[spec/design_output/schema#the-verbs-own-their-fields]]
func RestoredFields(was, now string, keys []string) (string, []string) {
	if ticket, _ := ticketState(now); !ticket {
		return now, nil
	}
	old := frontBlocks(strings.Split(was, "\n"))
	rows := strings.Split(now, "\n")
	then := frontBlocks(rows)
	if old.close < 0 || then.close < 0 {
		return now, nil
	}
	var put []string
	for _, key := range keys {
		if strings.Join(old.blocks[key], "\n") == strings.Join(then.blocks[key], "\n") {
			continue
		}
		put = append(put, key)
		rows = withBlock(rows, key, old.blocks[key])
	}
	return strings.Join(rows, "\n"), put
}

// The refusal of a write changing the engine's fields and nothing else. [[spec/design_output/schema#the-verbs-own-their-fields]]
func EngineAloneRefusal(where string, keys []string) string {
	return "This edit changes " + strings.Join(keys, ", ") + " alone, and the engine holds those in " + where + ", so nothing of it lands. A verb writes them: " + pullVerb + " moves step and state."
}

// What a write landing with its fields put back says. [[spec/design_output/schema#the-verbs-own-their-fields]]
func PutBack(where string, keys []string) string {
	return strings.Join(keys, ", ") + " stand as the engine holds them in " + where + ", and the rest of the write lands. A verb writes these fields: " + pullVerb + " moves step and state."
}

// Each top-level key of a front with its rows, and the rows it stands at. [[spec/design_output/schema#the-verbs-own-their-fields]]
type blocked struct {
	blocks map[string][]string
	at     map[string]int
	close  int
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func frontBlocks(rows []string) blocked {
	out := blocked{blocks: map[string][]string{}, at: map[string]int{}, close: -1}
	if len(rows) == 0 || strings.TrimRight(rows[0], " \t\r") != fence {
		return out
	}
	for i := 1; i < len(rows); i++ {
		if strings.TrimRight(rows[i], " \t\r") == fence {
			out.close = i
			break
		}
	}
	key := ""
	for i := 1; i < out.close; i++ {
		if found := topKey.FindStringSubmatch(rows[i]); found != nil {
			key = found[1]
			out.blocks[key], out.at[key] = nil, i
		}
		if key != "" {
			out.blocks[key] = append(out.blocks[key], rows[i])
		}
	}
	return out
}

// The rows with one key's block swapped for the disk's, taken out where the disk holds none, and put back before the fence where the write took it out. [[spec/design_output/schema#the-verbs-own-their-fields]]
func withBlock(rows []string, key string, block []string) []string {
	now := frontBlocks(rows)
	if now.close < 0 {
		return rows
	}
	from, to := now.close, now.close
	if at, held := now.at[key]; held {
		from, to = at, at+len(now.blocks[key])
	}
	out := append([]string{}, rows[:from]...)
	out = append(out, block...)
	return append(out, rows[to:]...)
}

// One projection a person writes nothing under: its name, its folder, the files it writes, and its source. [[spec/design_output/projection#the-write-door-refuses-one]]
type Projection struct {
	Name   string   `json:"name"`
	Target string   `json:"target"`
	Writes []string `json:"writes"`
	From   string   `json:"from"`
}

// The projection owning a path: an entry naming the file first, then its neighbour naming none, the deepest folder winning. [[spec/design_output/projection#the-write-door-refuses-one]]
func OwnerOf(entries []Projection, where string) (Projection, bool) {
	said := strings.TrimPrefix(strings.ReplaceAll(where, "\\", "/"), "./")
	if said == "" {
		return Projection{}, false
	}
	var named, bare []Projection
	for _, one := range entries {
		if !under(said, folderOf(one.Target)) {
			continue
		}
		if writesIt(one, said) {
			named = append(named, one)
		} else if len(one.Writes) == 0 {
			bare = append(bare, one)
		}
	}
	if len(named) == 0 {
		named = bare
	}
	var found Projection
	for i, one := range named {
		if i == 0 || len(folderOf(one.Target)) > len(folderOf(found.Target)) {
			found = one
		}
	}
	return found, len(named) > 0
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
func RefusedWrite(entry Projection, where string) string {
	name, from := entry.Name, entry.From
	if name == "" {
		name = entry.Target
	}
	if from == "" {
		from = entry.Target
	}
	return strings.Join([]string{
		where + " is projected, so nothing may write it by hand.", "",
		"  projection: " + name,
		"  source:     " + from, "",
		"Edit " + from + " instead. Level zero projects at every",
		"session start, and `./RUNME.sh check` refuses a target standing stale.",
	}, "\n")
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
func under(said, target string) bool {
	return target != "" && (said == target || strings.HasPrefix(said, target+"/") || strings.Contains(said, "/"+target+"/"))
}

// [[spec/design_output/projection#the-write-door-refuses-one]]
func folderOf(target string) string {
	return strings.TrimRight(strings.TrimPrefix(strings.ReplaceAll(target, "\\", "/"), "./"), "/")
}

// Whether an entry's globs name the file, a star standing for any run of letters. [[spec/design_output/projection#the-write-door-refuses-one]]
func writesIt(entry Projection, said string) bool {
	name := said[strings.LastIndex(said, "/")+1:]
	for _, glob := range entry.Writes {
		parts := strings.Split(glob, "*")
		for i, one := range parts {
			parts[i] = regexp.QuoteMeta(one)
		}
		if glob != "" && regexp.MustCompile("^"+strings.Join(parts, ".*")+"$").MatchString(name) {
			return true
		}
	}
	return false
}
