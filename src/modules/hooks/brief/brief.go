// The brief a session reads: the canary counts off the top guidance notes, the
// canary and debt wording, the tools block and the handover block, off
// guidance.js in the level0 lib and in src/bridge. It reads a tree it is handed.
// [[spec/tickets/brief-answers-off-the-door]]
package brief

import (
	"encoding/json"
	"regexp"
	"strconv"
	"strings"
)

// The folder the notes stand in, the files the blocks read, and the names each block rides under. [[spec/tickets/brief-answers-off-the-door]]
const (
	Guidance = "spec/guidance"
	// .claude/skills/level0/lib/folders.js owns the runtime folder, and the package spells it again. [[spec/tickets/brief-answers-off-the-door]]
	ToolsFile = ".se/.runtime/tools.json"
	// .claude/skills/level0/lib/folders.js owns the handover's folder, and the package spells it again. [[spec/tickets/brief-answers-off-the-door]]
	HandoverFile  = ".se/HANDOVER.md"
	ToolsBlock    = "level0-tools"
	CanaryBlock   = "level0-canary"
	HandoverBlock = "level0-handover"
	toolsHeading  = "# What this box has"
	noteSuffix    = ".md"
	draftMark     = "_"
	setIn         = "    "
)

// What CanaryIn finds on an answer's first line, off HEARD in the level0 lib. [[spec/tickets/brief-answers-off-the-door]]
const (
	Same  = "same"
	Other = "other"
	None  = "none"
)

// The tools the survey names, in the order the block lists them, off WANTED in .claude/skills/level0/lib/tools.js. [[spec/tickets/brief-answers-off-the-door]]
var wanted = [][2]string{
	{"node", "a helper script"},
	{"biome", "formatting and linting the JavaScript"},
	{"go", "building the index and the viewer"},
	{"git", "history and diffs"},
	{"claude", "a session of its own, and the probe"},
	{"sh", "a shell script"},
	{"python", "a helper script"},
}

// The tiers, lightest first, each with the work it takes. The config names the model of each. [[spec/design_output/level0#a-spawn-names-its-tier]]
var Tiers = [][2]string{
	{"find", "find, list, read and report: work you check by looking"},
	{"change", "a scoped change in one to three files with its test, or a review against a list"},
	{"decide", "a design, a cause nobody knows, a change across modules, or a verdict the owner reads"},
}

// The patterns the level0 lib reads a note and a canary line with. [[spec/tickets/brief-answers-off-the-door]]
var (
	canaryAt  = regexp.MustCompile(`level0 holds this session: \d+ rules?, \d+ notes?, the stop hook (?:on|off)\.`)
	frontAt   = regexp.MustCompile(`^---\r?\n((?s:.*?))\r?\n---`)
	bodyAt    = regexp.MustCompile(`^---\r?\n(?s:.*?)\r?\n---\r?\n`)
	headingAt = regexp.MustCompile(`^#\s+(.+?)\s*$`)
	itemAt    = regexp.MustCompile(`^\s*(?:\d+[.)]|[-*+])\s+(.*)$`)
	listAt    = regexp.MustCompile(`^\s*-\s+(.*)$`)
	pairAt    = regexp.MustCompile(`^([a-z_]+):\s*(.*)$`)
	markAt    = regexp.MustCompile("\\s*`?\\*`?$")
	kindAt    = regexp.MustCompile(`^([a-z][a-z0-9-]*):\s`)
	quotedAt  = regexp.MustCompile(`"([^"]*)"|'([^']*)'`)
	bareHead  = regexp.MustCompile(`^["'\[]+`)
	bareTail  = regexp.MustCompile(`["'\],]+$`)
	lines     = regexp.MustCompile(`\r?\n`)
)

// A tree the brief reads: a file's text, and the names a folder holds. [[spec/tickets/brief-answers-off-the-door]]
type Tree interface {
	Read(path string) (string, bool)
	List(folder string) []string
}

// The rules and the notes carrying them. [[spec/tickets/brief-answers-off-the-door]]
type Counts struct {
	Rules int `json:"rules"`
	Notes int `json:"notes"`
}

// One block the session reads, by its name. [[spec/tickets/brief-answers-off-the-door]]
type Block struct {
	Name string
	Text string
}

// The work root's file over the method root's, and the names of both folders, as inherits in the level0 lib reads them. [[spec/design_output/vehicle#the-work-root-inherits]]
func Layered(method, work Tree) Tree { return layered{method, work} }

type layered struct{ under, over Tree }

func (one layered) Read(path string) (string, bool) {
	if text, ok := one.over.Read(path); ok {
		return text, true
	}
	return one.under.Read(path)
}

func (one layered) List(folder string) []string {
	out := one.under.List(folder)
	seen := map[string]bool{}
	for _, name := range out {
		seen[name] = true
	}
	for _, name := range one.over.List(folder) {
		if !seen[name] {
			out = append(out, name)
		}
	}
	return out
}

// The counts off the notes at the top of the guidance folder that bind here and name no kind. [[spec/design_output/level0#the-style-carries-the-top]]
func CountsOf(tree Tree, env func(string) string) Counts {
	var out Counts
	for _, name := range tree.List(Guidance) {
		if !strings.HasSuffix(name, noteSuffix) || strings.HasPrefix(name, draftMark) {
			continue
		}
		text, ok := tree.Read(Guidance + "/" + name)
		if !ok || !bindsHere(text, env) || len(kindsOf(text)) > 0 {
			continue
		}
		if rules := len(actionables(text)); rules > 0 {
			out.Notes++
			out.Rules += rules
		}
	}
	return out
}

// [[spec/design_output/level0#the-canary]]
func Canary(counts Counts, stop bool) string {
	tooth := "on"
	if !stop {
		tooth = "off"
	}
	return "level0 holds this session: " + strconv.Itoa(counts.Rules) + " rules, " + strconv.Itoa(counts.Notes) + " notes, the stop hook " + tooth + "."
}

// The block the session reads with the canary in it. [[spec/design_output/level0#the-canary]]
func CanaryText(sentence string) string {
	return around("Open your FIRST answer with this line, first and alone, word for word:", sentence,
		"It says out loud that level zero holds this session, and the numbers come from what it loaded. Write this line once and never again. The line opens an answer and ends no turn: a turn ends on the stop line, last and alone, and the two stand at opposite ends of the same answer.")
}

// The line an open debt rides a call with, off OWES.warns in the level0 lib. [[spec/design_output/level0#the-canary-owes-a-debt]]
func Owes(sentence string) string {
	return around("This session owes the canary. Open your answer with this line, first and alone, word for word:", sentence,
		"The numbers come from what level zero loaded. Level zero refuses the next tool call until that line opens an answer. The line ends no turn, so say what you do next under it and carry on.")
}

func around(before, sentence, after string) string {
	return before + "\n\n" + setIn + sentence + "\n\n" + after
}

// Whether the answer's first line carries the canary, and the same one. [[spec/design_output/level0#the-canary-opens-an-answer]]
func CanaryIn(answer, sentence string) string {
	first, _, _ := strings.Cut(strings.TrimSpace(answer), "\n")
	found := canaryAt.FindString(strings.TrimSpace(first))
	switch {
	case found == "":
		return None
	case found == sentence:
		return Same
	}
	return Other
}

// The tier line the tools block carries and the Agent door repeats, or nothing where the config names no model. [[spec/design_output/level0#a-spawn-names-its-tier]]
func TiersLine(helpers map[string]string) string {
	var rows []string
	for _, one := range Tiers {
		if model := strings.TrimSpace(helpers[one[0]]); model != "" {
			rows = append(rows, one[0]+" takes `"+model+"`: "+one[1]+".")
		}
	}
	if len(rows) == 0 {
		return ""
	}
	said := append([]string{"Every `Agent` call names `model` by the tier of the work it hands."}, rows...)
	return strings.Join(append(said, "Where you doubt, take the next tier up."), " ")
}

// The tools block off the survey's text, with the tier line under it, or nothing where the survey names no tool. [[spec/design_output/tools#the-session-reads-the-survey]]
func ToolsText(survey, tiers string) string {
	var found map[string]struct {
		Version string `json:"version"`
	}
	_ = json.Unmarshal([]byte(survey), &found)
	var rows []string
	for _, one := range wanted {
		tool, ok := found[one[0]]
		if !ok {
			continue
		}
		version := ""
		if tool.Version != "" {
			version = " " + tool.Version
		}
		rows = append(rows, "- `"+one[0]+"`"+version+", for "+one[1])
	}
	if len(rows) == 0 {
		return ""
	}
	out := append([]string{toolsHeading, ""}, rows...)
	if tiers != "" {
		out = append(out, "", tiers)
	}
	return strings.Join(out, "\n")
}

// The block the handover rides in. [[spec/design_output/work#one-handover-stands]]
func HandoverText(text string) string {
	return strings.Join([]string{
		"# The handover the last session left", "", text, "",
		"Level zero deleted " + HandoverFile + " as it read it. Write a new one before you finish.",
	}, "\n")
}

// The blocks a read of the context hands over, in the bridge's order: the tools, the canary where a note carries rules, then the handover. [[spec/design_output/level0#rules-ride-the-first-answer]]
func BlocksOf(tools string, counts Counts, sentence, handover string) []Block {
	var out []Block
	if tools != "" {
		out = append(out, Block{ToolsBlock, tools})
	}
	if counts.Notes > 0 {
		out = append(out, Block{CanaryBlock, CanaryText(sentence)})
	}
	if handover != "" {
		out = append(out, Block{HandoverBlock, HandoverText(handover)})
	}
	return out
}

// The note's rules: the items of its Actionables chapter, each without its star. [[spec/design_output/level0#the-standing-layer]]
func actionables(text string) []string {
	var out []string
	for _, one := range itemsIn(chapterOf(text, "Actionables")) {
		if rule := strings.TrimSpace(markAt.ReplaceAllString(one, "")); rule != "" {
			out = append(out, rule)
		}
	}
	return out
}

func chapterOf(text, heading string) string {
	body := bodyAt.ReplaceAllString(text, "")
	chapters := map[string][]string{}
	at := ""
	for _, line := range lines.Split(body, -1) {
		if found := headingAt.FindStringSubmatch(line); found != nil {
			at = found[1]
			chapters[at] = nil
			continue
		}
		if at != "" {
			chapters[at] = append(chapters[at], line)
		}
	}
	return strings.TrimSpace(strings.Join(chapters[heading], "\n"))
}

func itemsIn(chapter string) []string {
	var out []string
	held, holding := "", false
	for _, line := range lines.Split(chapter, -1) {
		if found := itemAt.FindStringSubmatch(line); found != nil {
			if holding {
				out = append(out, held)
			}
			held, holding = strings.TrimSpace(found[1]), true
			continue
		}
		if holding && strings.TrimSpace(line) != "" {
			held += " " + strings.TrimSpace(line)
		} else if holding {
			out = append(out, held)
			held, holding = "", false
		}
	}
	if holding {
		out = append(out, held)
	}
	return out
}

// The frontmatter by key: a pair's text, or a block list's items. [[spec/design_input/level-two#guidance]]
func frontOf(text string) map[string][]string {
	out := map[string][]string{}
	found := frontAt.FindStringSubmatch(text)
	if found == nil {
		return out
	}
	list := ""
	for _, line := range lines.Split(found[1], -1) {
		if item := listAt.FindStringSubmatch(line); item != nil && list != "" {
			out[list] = append(out[list], strings.TrimSpace(item[1]))
			continue
		}
		pair := pairAt.FindStringSubmatch(line)
		if pair == nil {
			continue
		}
		list = ""
		if strings.TrimSpace(pair[2]) != "" {
			out[pair[1]] = []string{pair[2]}
			continue
		}
		out[pair[1]] = []string{}
		list = pair[1]
	}
	return out
}

// The kinds a note's scope binds, off kindsOf in the level0 lib. [[spec/tickets/the-spawn-reaches-its-guidance]]
func kindsOf(text string) []string {
	var out []string
	for _, one := range scopesIn(text) {
		if found := kindAt.FindStringSubmatch(one); found != nil {
			out = append(out, found[1])
		}
	}
	return out
}

func scopesIn(text string) []string {
	said, ok := frontOf(text)["scope"]
	if !ok {
		return nil
	}
	if len(said) != 1 || !isInlineKey(text, "scope") {
		return kept(said)
	}
	var quoted []string
	for _, found := range quotedAt.FindAllStringSubmatch(said[0], -1) {
		quoted = append(quoted, found[1]+found[2])
	}
	if len(quoted) > 0 {
		return nonEmpty(quoted)
	}
	return kept(said)
}

func kept(said []string) []string {
	out := make([]string, 0, len(said))
	for _, one := range said {
		out = append(out, bare(one))
	}
	return nonEmpty(out)
}

func nonEmpty(said []string) []string {
	var out []string
	for _, one := range said {
		if one != "" {
			out = append(out, one)
		}
	}
	return out
}

func bare(said string) string {
	return strings.TrimSpace(bareTail.ReplaceAllString(bareHead.ReplaceAllString(strings.TrimSpace(said), ""), ""))
}

// A note binding variables stands where one of them reads true, off bindsHere in the level0 lib. [[spec/design_output/level0#guidance-a-variable-switches-on]]
func bindsHere(text string, env func(string) string) bool {
	said := frontOf(text)["env"]
	var wants []string
	if len(said) == 1 && isInlineKey(text, "env") {
		said = strings.Split(strings.TrimSuffix(strings.TrimPrefix(strings.TrimSpace(said[0]), "["), "]"), ",")
	}
	for _, one := range said {
		if name := strings.TrimSpace(one); name != "" {
			wants = append(wants, name)
		}
	}
	if len(wants) == 0 {
		return true
	}
	for _, name := range wants {
		if value := strings.ToLower(strings.TrimSpace(env(name))); value != "" && value != "0" && value != "false" {
			return true
		}
	}
	return false
}

// Whether the key stands in the frontmatter as a pair carrying its text inline, which the lib reads as text. [[spec/tickets/brief-answers-off-the-door]]
func isInlineKey(text, key string) bool {
	found := frontAt.FindStringSubmatch(text)
	if found == nil {
		return false
	}
	for _, line := range lines.Split(found[1], -1) {
		if pair := pairAt.FindStringSubmatch(line); pair != nil && pair[1] == key {
			return strings.TrimSpace(pair[2]) != ""
		}
	}
	return false
}
