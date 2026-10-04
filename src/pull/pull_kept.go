// The kept red leaf. A rewind meets a leaf that proved its tests red, and a
// later leaf passed since. Where every test its pass commit lands still stands
// at HEAD, the leaf stands kept and the walk goes on, off pull-kept.js and
// red-list.js.
// [[spec/design_output/pull#kept-red-leaves]]
package pull

import (
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The word a red pass expects, the folder its tests stand in, a deletion, and the short hash a kept entry names. [[spec/design_output/pull#kept-red-leaves]]
const (
	red      = "assertion"
	testsDir = "test/"
	gone     = "D"
	shortRed = 9
	redField = "red"
)

// [[spec/design_output/pull#kept-red-leaves]]
func (it *It) keptRed(text string, leaf *Leaf, name string) []front.Pair {
	if leaf == nil || !isRed(leaf) {
		return nil
	}
	record := recordIn(text)
	redAt := -1
	for i, entry := range record {
		if yaml.AsString(entry.Get("step")) == leaf.Path && isPass(entry) {
			redAt = i
		}
	}
	if redAt < 0 {
		return nil
	}
	after := yaml.AsString(record[redAt].Get("hash_after"))
	if after == "" {
		return nil
	}
	order := []string{}
	for _, one := range WalkOf(FrontOf(text)) {
		if one.Leaf {
			order = append(order, one.Path)
		}
	}
	indexOf := func(path string) int {
		for i, one := range order {
			if one == path {
				return i
			}
		}
		return -1
	}
	later := false
	for _, entry := range record[redAt+1:] {
		later = later || (isPass(entry) && indexOf(yaml.AsString(entry.Get("step"))) > indexOf(leaf.Path))
	}
	if !later {
		return nil
	}
	commit := it.redCommit(after, leaf.Path, name)
	if commit == "" {
		return nil
	}
	tests := redListOf(text, leaf.Path)
	if len(tests) == 0 {
		tests = it.landedTests(commit)
	}
	if len(tests) == 0 {
		return nil
	}
	goneSince, ok := it.goneSince(commit)
	if !ok {
		return nil
	}
	for _, path := range tests {
		if goneSince[path] {
			return nil
		}
	}
	return []front.Pair{pair("step", leaf.Path), pair("skipped", true), pair("kept", commit),
		pair("why", "its red tests stand as "+commit[:min(shortRed, len(commit))]+" landed them, and a later leaf passed since")}
}

func isRed(leaf *Leaf) bool {
	for _, one := range yaml.Flat(leaf.Said.Get("evidence")) {
		if field := yaml.AsDoc(one); field != nil && fieldWord(field, "form") == "command" && fieldWord(field, "expects") == red {
			return true
		}
	}
	return false
}

func isPass(entry *yaml.Doc) bool {
	return yaml.AsString(entry.Get("def")) != "" && !truthy(yaml.AsString(entry.Get("stale"))) && !truthy(yaml.AsString(entry.Get("skipped"))) && !entry.Has("returns")
}

// [[spec/design_output/pull#kept-red-leaves]]
func (it *It) redCommit(after, path, name string) string {
	said := it.Git.Run("log", "--reverse", "--ancestry-path", "--format=%H%x09%s", after+"..HEAD")
	if !said.OK {
		return ""
	}
	for _, row := range strings.Split(said.Out, "\n") {
		hash, subject, _ := strings.Cut(row, "\t")
		cut := strings.Index(subject, ": ")
		if cut < 0 || (name != "" && subject[:cut] != name) {
			continue
		}
		for _, change := range strings.Split(strings.TrimSuffix(subject[cut+2:], "."), ", ") {
			if change == "passes "+path {
				return strings.TrimSpace(hash)
			}
		}
	}
	return ""
}

// The rows of a name-status answer: each row's status letter and its paths. [[spec/design_output/pull#kept-red-leaves]]
func statusRows(out string) [][]string {
	rows := [][]string{}
	for _, row := range strings.Split(out, "\n") {
		if strings.TrimSpace(row) == "" {
			continue
		}
		parts := strings.Split(row, "\t")
		if len(parts) < 2 {
			continue
		}
		parts[0] = parts[0][:min(1, len(parts[0]))]
		rows = append(rows, parts)
	}
	return rows
}

func (it *It) landedTests(commit string) []string {
	said := it.Git.Run("show", "--name-status", "--format=", commit)
	if !said.OK {
		return nil
	}
	out := []string{}
	for _, row := range statusRows(said.Out) {
		if path := row[len(row)-1]; row[0] != gone && strings.HasPrefix(path, testsDir) {
			out = append(out, path)
		}
	}
	return out
}

func (it *It) goneSince(commit string) (map[string]bool, bool) {
	said := it.Git.Run("diff", "-M", "--name-status", commit, "HEAD")
	if !said.OK {
		return nil, false
	}
	out := map[string]bool{}
	for _, row := range statusRows(said.Out) {
		if row[0] == gone {
			out[row[1]] = true
		}
	}
	return out, true
}

// The files one red leaf names under its red field. A row a list payload wrote before formatted took arrays holds its paths joined by commas. [[spec/design_output/pull#kept-red-leaves]]
func redListOf(text, path string) []string {
	out := []string{}
	for _, row := range ChapterOf(text, path).Fields[redField] {
		for _, one := range strings.Split(bullet.ReplaceAllString(row, ""), ",") {
			if one = strings.TrimSpace(strings.ReplaceAll(one, "`", "")); one != "" {
				out = append(out, one)
			}
		}
	}
	return out
}
