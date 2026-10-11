// The frozen red files: a red leaf's pass keeps the hash of each file its red
// list names, and a later pass at a green leaf or a final gate meets a moved
// one refused, unless a reopen on the record names it with its why.
// [[spec/design_output/pull#red-tests-freeze]]
package pull

import (
	"fmt"
	"maps"
	"slices"
	"strings"

	"quackitect/src/front"
	"quackitect/src/yaml"
)

// The record fields a freeze and a reopen write, the hash a missing file reads as, the flag a hand-back reopens with, and the cut between a reopen's path and its why. [[spec/design_output/pull#red-tests-freeze]]
const (
	frozenField = "frozen"
	reopenField = "reopen"
	goneHash    = "gone"
	reopenFlag  = "--reopen"
	reopenCut   = ": "
)

// One file a reopen names, and why. [[spec/design_output/pull#red-tests-freeze]]
type reopen struct{ path, why string }

// The rows a red leaf's pass freezes, one path and its hash a file of its red list, or nil off a red leaf. [[spec/design_output/pull#red-tests-freeze]]
func (it *It) frozenOf(text string, leaf *Leaf) []any {
	if !isRed(leaf) {
		return nil
	}
	var out []any
	for _, row := range redListOf(text, leaf.Path) {
		if words := strings.Fields(row); len(words) > 0 {
			out = append(out, front.Ordered{pair("path", words[0]), pair("hash", it.fileHash(words[0]))})
		}
	}
	return out
}

// The hash of a file's text, or gone where it stands nowhere. [[spec/design_output/pull#red-tests-freeze]]
func (it *It) fileHash(path string) string {
	text, ok := it.Disk.Read(path)
	if !ok {
		return goneHash
	}
	return HashText(text)
}

// Whether a leaf holds the frozen files: a final gate, or a leaf whose command expects green. [[spec/design_output/pull#red-tests-freeze]]
func freezes(leaf *Leaf) bool {
	if leaf.Final {
		return true
	}
	for _, one := range yaml.Flat(leaf.Said.Get("evidence")) {
		if field := yaml.AsDoc(one); field != nil && fieldWord(field, "form") == "command" && fieldWord(field, "expects") == greenWord {
			return true
		}
	}
	return false
}

// The reopens a hand-back carries, each --reopen "<path>: <why>". [[spec/design_output/pull#red-tests-freeze]]
func reopensIn(argv []string) []reopen {
	var out []reopen
	for i, one := range argv {
		if one != reopenFlag || i+1 >= len(argv) {
			continue
		}
		path, why, _ := strings.Cut(argv[i+1], reopenCut)
		out = append(out, reopen{strings.TrimSpace(path), strings.TrimSpace(why)})
	}
	return out
}

// The rows a pass entry keeps of the reopens it carries, or nil where it carries none. [[spec/design_output/pull#red-tests-freeze]]
func reopenRows(said []reopen) []any {
	var out []any
	for _, one := range said {
		out = append(out, front.Ordered{pair("path", one.path), pair("why", one.why)})
	}
	return out
}

// Each path's latest frozen hash, and every reopen after that freeze with its why and the leaf it rode. [[spec/design_output/pull#red-tests-freeze]]
func frozenIn(text string) (map[string]string, map[string][]string) {
	hashes, at := map[string]string{}, map[string]int{}
	record := recordIn(text)
	for i, entry := range record {
		for _, row := range rowsUnder(entry, frozenField) {
			hashes[row["path"]], at[row["path"]] = row["hash"], i
		}
	}
	reopened := map[string][]string{}
	for i, entry := range record {
		for _, row := range rowsUnder(entry, reopenField) {
			if start, ok := at[row["path"]]; ok && i > start && row["why"] != "" {
				reopened[row["path"]] = append(reopened[row["path"]], row["why"]+", at "+yaml.AsString(entry.Get("step")))
			}
		}
	}
	return hashes, reopened
}

// The mappings a record entry holds under a field, each read as its words. [[spec/design_output/pull#red-tests-freeze]]
func rowsUnder(entry *yaml.Doc, field string) []map[string]string {
	var out []map[string]string
	for _, one := range yaml.Flat(entry.Get(field)) {
		if row := yaml.AsDoc(one); row != nil {
			out = append(out, map[string]string{"path": yaml.AsString(row.Get("path")), "hash": yaml.AsString(row.Get("hash")), "why": yaml.AsString(row.Get("why"))})
		}
	}
	return out
}

// The findings a pass at a freezing leaf meets: each frozen file whose hash moved, which no reopen names. [[spec/design_output/pull#red-tests-freeze]]
func (it *It) frozenFaults(one *Held, leaf *Leaf, carried []reopen) []string {
	if !freezes(leaf) {
		return nil
	}
	hashes, reopened := frozenIn(one.Text)
	for _, said := range carried {
		if said.why != "" {
			reopened[said.path] = append(reopened[said.path], said.why)
		}
	}
	var out []string
	for _, path := range slices.Sorted(maps.Keys(hashes)) {
		if it.fileHash(path) == hashes[path] || len(reopened[path]) > 0 {
			continue
		}
		out = append(out, fmt.Sprintf("%s moves since its red pass froze it. Put it back, or hand back with %s \"%s%s<why>\".", path, reopenFlag, path, reopenCut))
	}
	return out
}

// The rows a gate's hand-out shows of the reopened red files, or none. [[spec/design_output/pull#red-tests-freeze]]
func reopenedRows(text string) []string {
	_, reopened := frozenIn(text)
	if len(reopened) == 0 {
		return nil
	}
	out := []string{"", "Reopened red files:"}
	for _, path := range slices.Sorted(maps.Keys(reopened)) {
		for _, why := range reopened[path] {
			out = append(out, "  - "+path+": "+why)
		}
	}
	return out
}
