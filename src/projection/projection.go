// Projection: one source, several targets, and a program keeping that relation
// alive. ReadAll reads every entry's sources, writes its targets in memory,
// and names the targets standing, so the verb writes the difference.
// A port of projection.js. [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"sort"
	"strings"
)

// The shapes an entry names. [[spec/design_output/projection#the-first-target]]
const (
	Commands  = "config commands"
	Retro     = "retro command"
	Paragraph = "paragraph rules"
	Style     = "output style"
)

// The ending a shape's targets hold, and the one every other shape holds. [[spec/design_output/projection#a-shape-says-its-ending]]
var holds = map[string]string{Commands: ".md", Paragraph: rulesEnding, Style: ".md"}

const (
	noteEnding  = ".md"
	rulesEnding = ".yml"
	// The width a body line of a command wraps at. [[spec/design_output/projection#each-file-says-so]]
	bodyWidth = 84
	// The wrap that writes a frontmatter over a target. [[spec/design_output/projection#how-a-command-sets-it]]
	frontmatterWrap = "frontmatter"
)

// What a reading answers: the targets wanted, the targets standing, and the faults a source carries. [[spec/design_output/projection#projecting-in-memory]]
type Result struct {
	Wanted   map[string]string
	Standing map[string]string
	Faults   []string
}

// Reads every entry's sources through sources, and the standing targets through targets. [[spec/design_output/projection#projecting-in-memory]]
func ReadAll(entries []Entry, sources, targets Tree) Result {
	out := Result{Wanted: map[string]string{}, Standing: map[string]string{}, Faults: []string{}}
	for i, entry := range entries {
		texts := map[string]string{}
		take := func(path string) {
			if sources.Exists(path) {
				texts[path] = sources.Read(path)
			}
		}
		for _, path := range readsIn(entry, sources) {
			take(path)
		}
		for _, path := range alsoReads(entry, texts) {
			take(path)
		}
		for path, text := range writesOf(entry, texts) {
			out.Wanted[path] = text
		}
		out.Faults = append(out.Faults, faultsIn(entry, texts)...)

		folder := entry.folder()
		end, held := holds[entry.text("shape")]
		if !held {
			end = noteEnding
		}
		if !targets.Exists(folder) {
			continue
		}
		for _, one := range targets.List(folder) {
			if one.Dir || !strings.HasSuffix(one.Name, end) {
				continue
			}
			path := folder + "/" + one.Name
			if ownerOf(entries, path) != i {
				continue
			}
			out.Standing[path] = targets.Read(path)
		}
	}
	return out
}

// The paths an entry reads: a style reads its folder's notes, every other its source and shape. [[spec/design_output/projection#the-third-target]]
func readsIn(entry Entry, sources Tree) []string {
	if entry.text("shape") != Style {
		return entry.reads()
	}
	folder := folderOf(joinString(entry.raw.Get("from")))
	if !sources.Exists(folder) {
		return []string{}
	}
	out := []string{}
	for _, one := range sources.List(folder) {
		if !one.Dir && strings.HasSuffix(one.Name, noteEnding) {
			out = append(out, folder+"/"+one.Name)
		}
	}
	return sorted(out)
}

// The word lists a paragraph schema names, which the reader takes in a second pass. [[spec/design_output/vocabulary#the-rule-matches-a-stem]]
func alsoReads(entry Entry, texts map[string]string) []string {
	if entry.text("shape") != Paragraph {
		return nil
	}
	source, held := texts[entry.shown("from")]
	if !held {
		return nil
	}
	out := []string{}
	for _, path := range pathsOf(readYaml(source)).all() {
		if _, read := texts[path]; path != "" && !read {
			out = append(out, path)
		}
	}
	return out
}

// The targets an entry writes from the texts it read. [[spec/design_output/projection#projecting-in-memory]]
func writesOf(entry Entry, texts map[string]string) map[string]string {
	switch entry.text("shape") {
	case Paragraph:
		return schemaInto(entry, texts)
	case Style:
		return styleFrom(entry, texts)
	case Retro:
		return retroFrom(entry)
	case Commands:
		return commandsFrom(entry, texts)
	}
	return map[string]string{}
}

// The paragraph rules a schema writes, under the entry's target. [[spec/design_output/projection#the-second-target]]
func schemaInto(entry Entry, texts map[string]string) map[string]string {
	out := map[string]string{}
	source, held := texts[entry.shown("from")]
	if !held {
		return out
	}
	said := readYaml(source)
	files := rulesFrom(said, saysGenerated(entry.shown("from")), listsOf(said, texts))
	for _, one := range files {
		out[entry.folder()+"/"+one.name] = one.text
	}
	return out
}

// The faults a paragraph source carries against the shape beside it. [[spec/design_output/projection#a-missing-layer-fails]]
func faultsIn(entry Entry, texts map[string]string) []string {
	if entry.text("shape") != Paragraph {
		return nil
	}
	source, held := texts[entry.shown("from")]
	shape, also := texts[entry.shown("schema")]
	if !held || !also {
		return nil
	}
	out := []string{}
	for _, said := range faultsOf(readYaml(source), parsed(shape)) {
		out = append(out, entry.shown("from")+": "+said)
	}
	return out
}

// The line every target carries, naming its source. [[spec/design_output/projection#each-file-says-so]]
func saysGenerated(from string) string {
	return strings.Join([]string{
		"GENERATED. Edit the source named below, not this file. It is written again",
		"every time the tree is projected, so an edit here is lost.",
		"Source: " + from,
	}, " ")
}

// A text wrapped at a width, a word at a time. [[spec/design_output/projection#each-file-says-so]]
func wrapped(said string, at int) string { return strings.Join(grouped(jsFields(said), at), "\n") }

// Words gathered into rows no longer than a width, as snippets.js grouped does. [[spec/design_output/projection#the-second-target]]
func grouped(said []string, at int) []string {
	out := []string{}
	row := ""
	for _, one := range said {
		if row != "" && jsLength(row+" "+one) > at {
			out = append(out, row)
			row = one
			continue
		}
		if row == "" {
			row = one
			continue
		}
		row += " " + one
	}
	if row != "" {
		out = append(out, row)
	}
	return out
}

// The paths of a map in sorted order, so a caller writes them the same way each time. [[spec/tickets/config-verbs-port-to-go]]
func Paths(said map[string]string) []string {
	out := make([]string, 0, len(said))
	for path := range said {
		out = append(out, path)
	}
	sort.Strings(out)
	return out
}
