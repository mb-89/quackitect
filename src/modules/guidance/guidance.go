// The guidance module: the notes each leaf of each process reads, resolved
// off the files the watch mirrors.
// [[spec/tickets/the-guidance-topic-lands]]
package guidance

import (
	"regexp"
	"sort"
	"strings"

	"quackitect/src/q"
	"quackitect/src/yaml"
)

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	FilesPort = "files/<path...>"
	StepsPort = "steps"
)

// The folders the notes and the processes stand in. [[spec/design_input/level-two#guidance]]
const (
	Guidance  = "spec/guidance"
	Processes = "spec/processes"
)

// One note a leaf reads, and the envs it binds, where it binds any. [[spec/tickets/the-guidance-topic-lands]]
type Read struct {
	Note string   `json:"note"`
	Env  []string `json:"env,omitempty"`
}

type filesIn struct {
	Files map[string]q.Content `q:"files/<path...>"`
}

// The frontmatter block, a list item and a pair, the way the frontmatter reader in the level0 lib reads them. [[spec/design_input/level-two#guidance]]
var (
	frontAt = regexp.MustCompile(`^---\r?\n((?s:.*?))\r?\n---`)
	itemAt  = regexp.MustCompile(`^\s*-\s+(.*)$`)
	pairAt  = regexp.MustCompile(`^([a-z_]+):\s*(.*)$`)
)

// The module type the wiring loads as guidance. [[spec/tickets/the-guidance-topic-lands]]
func Registers(c *q.Catalog) q.Writer {
	return q.DerivedIn(c, StepsPort, map[string][]Read{}, StepsOf, q.Doc("every leaf of every process, keyed process:path, with the notes it reads"))
}

// Every leaf of every process over the one root the watch mirrors, and the notes it reads in the order the old reader hands them. [[spec/tickets/the-guidance-topic-lands]]
func StepsOf(in filesIn) map[string][]Read {
	return Resolve(Layered(in.Files, nil))
}

// The text of every file standing, the work root's over the method root's of the same path, as inherits in the level0 lib reads them. [[spec/design_output/vehicle#the-work-root-inherits]]
func Layered(method, work map[string]q.Content) map[string]string {
	out := map[string]string{}
	for _, layer := range []map[string]q.Content{method, work} {
		for at, file := range layer {
			if file.Hash != "" {
				out[at] = file.Text
			}
		}
	}
	return out
}

// Every leaf of every process under the texts, keyed process:path, and its reads: the notes its tags resolve, then its own reads less those. [[spec/design_input/level-two#guidance]]
func Resolve(texts map[string]string) map[string][]Read {
	notes := notesIn(texts)
	out := map[string][]Read{}
	for at, text := range texts {
		name, ok := processName(at)
		if !ok {
			continue
		}
		for _, one := range leavesOf(yaml.AsDoc(yaml.Read(text)).Get("steps"), "", nil, nil) {
			out[name+":"+one.path] = readsOf(notes, one)
		}
	}
	return out
}

// The notes one leaf reads under an env: a note binding no env always, and one binding envs where one of them reads true. A read the leaf names itself stands once. [[spec/tickets/the-guidance-topic-lands]]
func Notes(reads []Read, env map[string]string) []string {
	out := []string{}
	bound := map[string]bool{}
	for _, one := range reads {
		if len(one.Env) == 0 {
			if !bound[one.Note] {
				out = append(out, one.Note)
			}
			continue
		}
		if bindsHere(one.Env, env) {
			out = append(out, one.Note)
			bound[one.Note] = true
		}
	}
	return out
}

// One note under a subfolder: its name, the tags it carries, and the envs it binds. [[spec/design_input/level-two#guidance]]
type note struct {
	name string
	tags []string
	env  []string
}

// One leaf of a route: its path, the tags its chain sums, and the reads it names. [[spec/design_input/the-agent-pulls-tickets#the-route]]
type leaf struct {
	path  string
	tags  []string
	reads []string
}

// A leaf's reads: every note binding an env, and every note whose tags all stand among the leaf's, in name order, then its own reads less the notes binding no env. [[spec/tickets/cloud-note-reaches-every-step]]
func readsOf(notes []note, one leaf) []Read {
	has := map[string]bool{}
	for _, tag := range one.tags {
		has[tag] = true
	}
	out := []Read{}
	always := map[string]bool{}
	for _, each := range notes {
		if len(each.env) > 0 {
			out = append(out, Read{Note: each.name, Env: each.env})
			continue
		}
		if allIn(each.tags, has) {
			out = append(out, Read{Note: each.name})
			always[each.name] = true
		}
	}
	for _, own := range one.reads {
		if !always[own] {
			out = append(out, Read{Note: own})
		}
	}
	return out
}

func allIn(tags []string, has map[string]bool) bool {
	for _, tag := range tags {
		if !has[tag] {
			return false
		}
	}
	return true
}

// Every note under a subfolder of the guidance folder, in name order. A note at the top rides the output style, and a name opening with an underscore stands as a draft. [[spec/design_input/level-two#guidance]]
func notesIn(texts map[string]string) []note {
	out := []note{}
	for at, text := range texts {
		rest, under := strings.CutPrefix(at, Guidance+"/")
		if !under || !strings.HasSuffix(rest, ".md") {
			continue
		}
		parts := strings.Split(strings.TrimSuffix(rest, ".md"), "/")
		if len(parts) < 2 || strings.HasPrefix(parts[len(parts)-1], "_") {
			continue
		}
		front := frontOf(text)
		out = append(out, note{
			name: Guidance + "/" + strings.Join(parts, "/"),
			tags: uniq(append(parts[:len(parts)-1:len(parts)-1], front["tags"]...)),
			env:  front["env"],
		})
	}
	sort.Slice(out, func(i, j int) bool { return out[i].name < out[j].name })
	return out
}

// The frontmatter's lists by key: an inline list splits on its commas, and a block list reads one item a line. [[spec/design_input/level-two#guidance]]
func frontOf(text string) map[string][]string {
	out := map[string][]string{}
	found := frontAt.FindStringSubmatch(text)
	if found == nil {
		return out
	}
	list := ""
	for _, line := range yaml.SplitLines(found[1]) {
		if item := itemAt.FindStringSubmatch(line); item != nil && list != "" {
			out[list] = append(out[list], words(item[1])...)
			continue
		}
		pair := pairAt.FindStringSubmatch(line)
		if pair == nil {
			continue
		}
		list = ""
		if said := strings.TrimSpace(pair[2]); said != "" {
			out[pair[1]] = words(strings.TrimSuffix(strings.TrimPrefix(said, "["), "]"))
			continue
		}
		out[pair[1]] = []string{}
		list = pair[1]
	}
	return out
}

// The items of a comma list, trimmed and unquoted, the empty ones dropped. [[spec/design_input/level-two#guidance]]
func words(said string) []string {
	out := []string{}
	for _, part := range strings.Split(said, ",") {
		one := strings.Trim(strings.TrimSpace(part), `"'`)
		if one != "" {
			out = append(out, one)
		}
	}
	return out
}

// Whether one of the envs a note names reads true here: set, and neither 0 nor false. [[spec/tickets/cloud-note-reaches-every-step]]
func bindsHere(wants []string, env map[string]string) bool {
	for _, name := range wants {
		said := strings.ToLower(strings.TrimSpace(env[name]))
		if said != "" && said != "0" && said != "false" {
			return true
		}
	}
	return false
}

// The name of a process file standing directly in the processes folder. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func processName(at string) (string, bool) {
	rest, under := strings.CutPrefix(at, Processes+"/")
	if !under || strings.Contains(rest, "/") || !strings.HasSuffix(rest, ".yaml") {
		return "", false
	}
	return strings.TrimSuffix(rest, ".yaml"), true
}

// Every leaf under steps, its tags and reads summed down its chain, the way LeafOf in src/pull/pull_route.go sums them. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func leavesOf(steps any, parent string, tags, reads []string) []leaf {
	out := []leaf{}
	for _, each := range yaml.AsList(steps) {
		step := yaml.AsDoc(each)
		if step == nil {
			continue
		}
		path := yaml.AsString(step.Get("name"))
		if parent != "" {
			path = parent + "/" + path
		}
		mine := append(append([]string{}, tags...), summed(step.Get("tags"))...)
		own := append(append([]string{}, reads...), summed(step.Get("reads"))...)
		if under := stepsUnder(step.Get("steps")); under != nil {
			out = append(out, leavesOf(under, path, mine, own)...)
			continue
		}
		bare := make([]string, 0, len(own))
		for _, one := range own {
			bare = append(bare, strings.TrimSpace(strings.TrimSuffix(strings.TrimPrefix(one, "[["), "]]")))
		}
		out = append(out, leaf{path: path, tags: uniq(mine), reads: bare})
	}
	return out
}

// The steps a step holds, or nil where it holds none and stands as a leaf. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func stepsUnder(said any) []any {
	var out []any
	for _, one := range yaml.AsList(said) {
		if yaml.AsDoc(one) != nil {
			out = append(out, one)
		}
	}
	return out
}

// A field's values, trimmed, the empty ones dropped. [[spec/design_input/the-agent-pulls-tickets#the-route]]
func summed(said any) []string {
	out := []string{}
	for _, one := range yaml.StringsOf(said) {
		if one = strings.TrimSpace(one); one != "" {
			out = append(out, one)
		}
	}
	return out
}

// The values in first-seen order, each once. [[spec/design_input/level-two#guidance]]
func uniq(said []string) []string {
	out := []string{}
	seen := map[string]bool{}
	for _, one := range said {
		if !seen[one] {
			seen[one] = true
			out = append(out, one)
		}
	}
	return out
}
