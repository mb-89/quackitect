// The entries spec/config/projections.json names, and which one owns a path.
// A target file stands for the entry owning it, so a file the owner keeps
// beside the targets stays.
// [[spec/tickets/config-verbs-port-to-go]]
package projection

import (
	"regexp"
	"sort"
	"strings"
)

// The file naming every projection. [[spec/design_output/projection#what-goes-where-is-data]]
const Projections = "spec/config/projections.json"

// One projection: the fields its entry writes, read as node reads them. [[spec/design_output/projection#what-goes-where-is-data]]
type Entry struct {
	raw *Object
}

// The entries a projections text names, each an object carrying a target. [[spec/design_output/projection#what-goes-where-is-data]]
func EntriesIn(text string) []Entry {
	out := []Entry{}
	for _, one := range listOf(dig(parsed(text), "projections")) {
		if said := asObject(one); said != nil && holdsTrue(said.Get("target")) {
			out = append(out, Entry{raw: said})
		}
	}
	return out
}

// A field as a text, or nothing where it holds another kind, as a compare with a shape name reads it. [[spec/tickets/config-verbs-port-to-go]]
func (one Entry) text(key string) string {
	said, _ := one.raw.Get(key).(string)
	return said
}

// A field as a template writes it. [[spec/tickets/config-verbs-port-to-go]]
func (one Entry) shown(key string) string { return jsString(one.raw.Get(key)) }

// The folder a target names. [[spec/design_output/projection#the-write-door-refuses-one]]
func (one Entry) folder() string { return folderOf(joinString(one.raw.Get("target"))) }

// The paths an entry reads, its source and its shape. [[spec/design_output/projection#projecting-in-memory]]
func (one Entry) reads() []string {
	out := []string{}
	for _, key := range []string{"from", "schema"} {
		if said := one.raw.Get(key); holdsTrue(said) {
			out = append(out, jsString(said))
		}
	}
	return out
}

// The index of the entry owning a path, or -1 where none does. [[spec/design_output/projection#the-write-door-refuses-one]]
func ownerOf(entries []Entry, path string) int {
	said := shown(path)
	if said == "" {
		return -1
	}
	var here, named, free []int
	for i, entry := range entries {
		if under(said, entry.folder()) {
			here = append(here, i)
		}
	}
	for _, i := range here {
		if writesIt(entries[i], said) {
			named = append(named, i)
		}
		if !holdsTrue(entries[i].raw.Get("writes")) {
			free = append(free, i)
		}
	}
	rows := free
	if len(named) > 0 {
		rows = named
	}
	if len(rows) == 0 {
		return -1
	}
	sort.SliceStable(rows, func(a, b int) bool {
		return len(entries[rows[a]].folder()) > len(entries[rows[b]].folder())
	})
	return rows[0]
}

// Whether a path stands under a target folder. [[spec/design_output/projection#the-write-door-refuses-one]]
func under(said, target string) bool {
	if target == "" {
		return false
	}
	return said == target || strings.HasPrefix(said, target+"/") || strings.Contains(said, "/"+target+"/")
}

// A target with its trailing slashes cut. [[spec/design_output/projection#the-write-door-refuses-one]]
func folderOf(target string) string { return strings.TrimRight(shown(target), "/") }

// A path with forward slashes, and no leading ./ . [[spec/design_output/projection#the-write-door-refuses-one]]
func shown(path string) string {
	return strings.TrimPrefix(strings.ReplaceAll(path, "\\", "/"), "./")
}

// Whether an entry's writes globs name a path's file. [[spec/design_output/projection#the-write-door-refuses-one]]
func writesIt(entry Entry, said string) bool {
	said = said[strings.LastIndex(said, "/")+1:]
	for _, glob := range globsOf(entry.raw.Get("writes")) {
		if globOf(glob).MatchString(said) {
			return true
		}
	}
	return false
}

// The globs a writes field holds, as `[writes ?? []].flat().filter(Boolean)` reads them. [[spec/design_output/projection#the-write-door-refuses-one]]
func globsOf(said any) []string {
	items := []any{said}
	if list, held := said.([]any); held {
		items = list
	}
	out := []string{}
	for _, one := range items {
		if holdsTrue(one) {
			out = append(out, jsString(one))
		}
	}
	return out
}

// A glob as the anchored pattern it reads as: a star takes any run. [[spec/design_output/projection#the-write-door-refuses-one]]
func globOf(glob string) *regexp.Regexp {
	parts := strings.Split(glob, "*")
	for i, one := range parts {
		parts[i] = regexp.QuoteMeta(one)
	}
	return regexp.MustCompile("^" + strings.Join(parts, ".*") + "$")
}
