// A group, read off its ticket, as src/engine/group.js reads it: the front,
// the record, the step and the ask, and the writes through the Go front
// writer. Everything here reads or writes that one note.
// [[spec/design_output/work#a-group-is-a-ticket]]
package branches

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The folders, the branch prefix, the fields and the states the engine reads. [[spec/design_output/level0#a-write-names-its-ticket]]
const (
	ticketsFolder = "spec/tickets"
	// .claude/skills/level0/lib/folders.js owns the private tickets' folder, and the package spells it again. [[spec/design_output/pull#the-private-queue]]
	notesFolder  = ".se/tickets"
	noteEnd      = ".md"
	workBranch   = "work/"
	groupField   = "group"
	openState    = "open"
	closedState  = "closed"
	draftState   = "draft"
	urgentField  = "urgent"
	groupRoute   = "group"
	trivialRoute = "trivial"
	frontFence   = "---"
	// The span a claim goes stale past where work.staleAfter says nothing. [[spec/design_output/work#a-stale-group-is-yours]]
	staleSpan = "12h"
	// The branch every work branch leaves and lands on. [[spec/design_output/work#trunk-comes-in-first]]
	trunk = "main"
)

// The seconds a span's unit carries. [[spec/design_output/work#a-stale-group-is-yours]]
const (
	minute = 60
	hour   = 3600
	day    = 86400
)

var spanAt = regexp.MustCompile(`^(\d+)\s*([mhd])$`)

var heading = regexp.MustCompile(`^(#{1,6})\s+(.+?)\s*$`)

var fenceAt = regexp.MustCompile("^\\s*(```|~~~)")

// The ticket a path names: its last name less the extension. [[spec/design_output/work#a-group-is-a-ticket]]
func ticketNamed(path string) string {
	bare := strings.TrimSuffix(path, noteEnd)
	return bare[strings.LastIndex(bare, "/")+1:]
}

// Where a ticket by its name stands. [[spec/design_output/work#a-group-is-a-ticket]]
func ticketAt(name string) string { return ticketsFolder + "/" + name + noteEnd }

// The front a note carries, parsed, and an empty one where it carries none. [[spec/design_output/work#a-group-is-a-ticket]]
func frontOf(text string) *yaml.Doc {
	doc, _ := frontRows(text)
	return doc
}

// The front parsed, and whether a front stands at all. [[spec/design_output/schema#what-a-note-reads-as]]
func frontRows(text string) (*yaml.Doc, bool) {
	rows := splitRows(text)
	if strings.TrimSpace(rows[0]) != frontFence {
		return yaml.New(), false
	}
	for at := 1; at < len(rows); at++ {
		if strings.TrimSpace(rows[at]) != frontFence {
			continue
		}
		doc := yaml.AsDoc(yaml.Read(strings.Join(rows[1:at], "\n")))
		if doc == nil {
			doc = yaml.New()
		}
		return doc, true
	}
	return yaml.New(), false
}

// A note's rows, either line end read as one. [[spec/design_output/schema#what-a-note-reads-as]]
func splitRows(text string) []string {
	return strings.Split(strings.ReplaceAll(text, "\r\n", "\n"), "\n")
}

// A field of the front as text, bare of its link brackets, and nothing where it stands unset. [[spec/design_output/work#a-group-is-a-ticket]]
func fieldOf(text, key string) string { return frontField(frontOf(text), key) }

// A field of a parsed front as text, bare of its link brackets. [[spec/design_output/work#a-group-is-a-ticket]]
func frontField(doc *yaml.Doc, key string) string {
	if doc == nil {
		return ""
	}
	return bare(yaml.AsString(doc.Get(key)))
}

// A word trimmed and bare of its link brackets. [[spec/design_output/work#a-group-is-a-ticket]]
func bare(said string) string {
	said = strings.TrimSpace(said)
	said = strings.TrimPrefix(said, "[[")
	said = strings.TrimSuffix(said, "]]")
	return strings.TrimSpace(said)
}

// Whether the ticket carries the one mark. [[spec/design_output/work#the-mark-and-what-waits]]
func urgent(text string) bool { return fieldOf(text, urgentField) == "true" }

// The todo a front carries: nothing, first where it stands as a bare tag, or the row it stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
func todoOf(doc *yaml.Doc) string {
	if doc == nil || !doc.Has("todo") {
		return ""
	}
	said := doc.Get("todo")
	switch said {
	case nil, false:
		return ""
	case true:
		return "first"
	}
	text := strings.TrimSpace(yaml.AsString(said))
	switch text {
	case "false", "":
		return ""
	case "true":
		return "first"
	}
	return text
}

// The tickets one waits for, a list or one line, each bare of brackets and quotes. [[spec/design_output/work#the-mark-and-what-waits]]
func dependsOn(doc *yaml.Doc) []string {
	var out []string
	if doc == nil {
		return out
	}
	for _, line := range yaml.StringsOf(doc.Get("depends_on")) {
		for _, part := range strings.Split(line, ",") {
			one := strings.TrimSpace(part)
			one = strings.TrimSuffix(strings.TrimPrefix(one, "["), "]")
			one = strings.TrimSpace(trimQuote(one))
			if one != "" {
				out = append(out, one)
			}
		}
	}
	return out
}

// One quote off each end, where one stands there. [[spec/design_output/work#the-mark-and-what-waits]]
func trimQuote(said string) string {
	if strings.HasPrefix(said, `"`) || strings.HasPrefix(said, "'") {
		said = said[1:]
	}
	if strings.HasSuffix(said, `"`) || strings.HasSuffix(said, "'") {
		said = said[:len(said)-1]
	}
	return said
}

// The route's own name, off the process link. [[spec/design_output/work#a-group-is-a-ticket]]
func routeOf(text string) string {
	said := fieldOf(text, "process")
	return said[strings.LastIndex(said, "/")+1:]
}

// A draft on the trivial route takes no person: the pull opens it. [[spec/design_output/pull#a-draft-opens]]
func agentOpens(text string) bool {
	return text != "" && fieldOf(text, "state") == draftState && routeOf(text) == trivialRoute
}

// Whether the ticket carries the group route. [[spec/design_output/work#a-group-is-a-ticket]]
func isGroup(text string) bool { return text != "" && routeOf(text) == groupRoute }

// A ticket's text by its name. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
type named struct {
	Name string
	Text string
}

// The group tickets over this one, nearest first, walked up group through the texts by name. A loop stops the walk. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func ancestorsOf(text string, texts map[string]string) []named {
	var out []named
	seen := map[string]bool{}
	name := fieldOf(text, groupField)
	for name != "" && !seen[name] && isGroup(texts[name]) {
		seen[name] = true
		out = append(out, named{name, texts[name]})
		name = fieldOf(texts[name], groupField)
	}
	return out
}

// The groups some group names under group, which reach no worker. [[spec/design_input/the-cloud-runs-itself#groups-hold-groups]]
func parentsIn(texts []string) map[string]bool {
	out := map[string]bool{}
	for _, text := range texts {
		if isGroup(text) && fieldOf(text, groupField) != "" {
			out[fieldOf(text, groupField)] = true
		}
	}
	return out
}

// The record's items, each a map, the rest dropped. [[spec/design_output/work#the-take-writes-the-record]]
func recordIn(text string) []*yaml.Doc { return entriesOf(frontOf(text)) }

// The record's items of a parsed front. [[spec/design_output/work#the-take-writes-the-record]]
func entriesOf(doc *yaml.Doc) []*yaml.Doc {
	var out []*yaml.Doc
	if doc == nil {
		return out
	}
	for _, one := range yaml.AsList(doc.Get("record")) {
		if entry := yaml.AsDoc(one); entry != nil {
			out = append(out, entry)
		}
	}
	return out
}

// A record item's field as text. [[spec/design_output/work#the-take-writes-the-record]]
func entryField(entry *yaml.Doc, key string) string {
	return strings.TrimSpace(yaml.AsString(entry.Get(key)))
}

// Whether a record item's field holds a value JavaScript reads as true. [[spec/design_output/work#held-derives-from-the-record]]
func truthy(said any) bool {
	switch one := said.(type) {
	case nil:
		return false
	case bool:
		return one
	case int:
		return one != 0
	case string:
		return one != ""
	}
	return true
}

// The take standing open: the last record item with hash_before and no hash_after. [[spec/design_output/work#held-derives-from-the-record]]
type hold struct {
	Step, Hand, HashBefore string
}

// The open take, or nil where every take stands closed. [[spec/design_output/work#held-derives-from-the-record]]
func heldIn(text string) *hold {
	var held *yaml.Doc
	for _, one := range recordIn(text) {
		if truthy(one.Get("hash_before")) && !truthy(one.Get("hash_after")) {
			held = one
		}
	}
	if held == nil {
		return nil
	}
	return &hold{
		Step:       bare(yaml.AsString(held.Get("step"))),
		Hand:       bare(yaml.AsString(held.Get("hand"))),
		HashBefore: bare(yaml.AsString(held.Get("hash_before"))),
	}
}

// The first leaf of a route, its path joined by slashes. [[spec/design_output/work#a-group-is-a-ticket]]
func firstLeaf(steps any, path string) string {
	list := yaml.AsList(steps)
	if len(list) == 0 {
		return path
	}
	one := yaml.AsDoc(list[0])
	if one == nil || yaml.AsString(one.Get("name")) == "" {
		return path
	}
	deeper := yaml.AsString(one.Get("name"))
	if path != "" {
		deeper = path + "/" + deeper
	}
	if one.Has("steps") && one.Get("steps") != nil {
		return firstLeaf(one.Get("steps"), deeper)
	}
	return deeper
}

// The step a ticket stands at, or the first leaf of its route. [[spec/design_output/work#the-take-writes-the-record]]
func stepOf(text string) string {
	doc := frontOf(text)
	if said := bare(yaml.AsString(doc.Get("step"))); said != "" {
		return said
	}
	return firstLeaf(doc.Get("steps"), "")
}

// A heading of a note and the rows it owns up to the next heading. [[spec/design_output/schema#what-a-note-reads-as]]
type section struct {
	Header string
	Level  int
	Own    []string
}

// The sections a note holds, a fenced block read past. [[spec/design_output/schema#what-a-note-reads-as]]
func sectionsOf(text string) []section {
	var out []section
	fenced := false
	for _, row := range splitRows(text) {
		if fenceAt.MatchString(row) {
			fenced = !fenced
			continue
		}
		if fenced {
			continue
		}
		if found := heading.FindStringSubmatch(row); found != nil {
			out = append(out, section{Header: found[2], Level: len(found[1])})
			continue
		}
		if len(out) > 0 {
			out[len(out)-1].Own = append(out[len(out)-1].Own, row)
		}
	}
	return out
}

// The rows under the Ask heading, trimmed. [[spec/design_output/work#a-group-is-a-ticket]]
func askOf(text string) string {
	for _, one := range sectionsOf(text) {
		if strings.ToLower(one.Header) == "ask" {
			return strings.TrimSpace(strings.Join(one.Own, "\n"))
		}
	}
	return ""
}

// One item at the end of the record, through the Go front writer. [[spec/tickets/go-writes-the-frontmatter]]
func withEntry(text string, item front.Ordered) string {
	said, err := front.Entry(text, item)
	if err != nil {
		return text
	}
	return said
}

// hash_after on the open take. [[spec/design_output/work#held-derives-from-the-record]]
func withHashAfter(text, after string) string {
	said, err := front.After(text, after)
	if err != nil {
		return text
	}
	return said
}

// Every open take closed, so the group reads free. [[spec/design_output/work#held-derives-from-the-record]]
func withEveryTakeClosed(text, after string) string {
	said := text
	for heldIn(said) != nil {
		next := withHashAfter(said, after)
		if next == said {
			break
		}
		said = next
	}
	return said
}

// One top-level field set. [[spec/design_output/work#a-box-leaves]]
func withField(text, key, value string) string {
	said, err := front.Set(text, key, value)
	if err != nil {
		return text
	}
	return said
}

// One top-level field dropped. [[spec/design_output/work#the-merge-frees-the-tickets]]
func withoutField(text, key string) string {
	said, err := front.Drop(text, key)
	if err != nil {
		return text
	}
	return said
}

// A whole number as the front writer writes one, unquoted. [[spec/tickets/go-writes-the-frontmatter]]
func number(said int) json.Number { return json.Number(strconv.Itoa(said)) }

// The seconds a span names, or zero where it names none. [[spec/design_output/work#a-stale-group-is-yours]]
func spanOf(said string) int {
	found := spanAt.FindStringSubmatch(strings.TrimSpace(said))
	if found == nil {
		return 0
	}
	count, _ := strconv.Atoi(found[1])
	return count * map[string]int{"m": minute, "h": hour, "d": day}[found[2]]
}

// An age in its largest whole unit. [[spec/design_output/work#a-stale-group-is-yours]]
func aged(seconds int64) string {
	held := max(seconds, 0)
	switch {
	case held >= day:
		return fmt.Sprintf("%dd", held/day)
	case held >= hour:
		return fmt.Sprintf("%dh", held/hour)
	}
	return fmt.Sprintf("%dm", held/minute)
}
