// What a retro's collect copies from outside the tree: the transcripts and the
// memory the harness keeps under home, and the scratchpads under temp.
// [[spec/guidance/retro/collect]]
package main

import (
	"io/fs"
	"path/filepath"
	"slices"
	"strings"
	"time"
)

// The memory folder, and a transcript's extension. [[spec/guidance/retro/collect]]
const (
	retroOutsideMemory = "memory"
	retroOutsideLines  = ".jsonl"
)

// A repository's own store and a package folder carry no record of the work, and git keeps its objects read-only. [[spec/guidance/retro/collect]]
var retroOutsideStores = []string{".git", "node_modules"}

// A source the harness keeps, under home or under temp. [[spec/guidance/retro/collect]]
type retroOutsideSource struct {
	kind, base string
	under      []string
}

// Where the harness keeps each source. [[spec/guidance/retro/collect]]
var retroOutsideSources = []retroOutsideSource{
	{kind: "transcripts", base: "home", under: []string{".claude", "projects"}},
	{kind: "scratch", base: "temp", under: []string{"claude"}},
}

// The harness names a folder off a path by turning every mark past a letter or a digit into a dash, one a UTF-16 unit. [[spec/guidance/retro/collect]]
func retroSlugOf(root string) string {
	var out strings.Builder
	for _, one := range root {
		switch {
		case one >= 'a' && one <= 'z', one >= 'A' && one <= 'Z', one >= '0' && one <= '9':
			out.WriteRune(one)
		case one > 0xFFFF:
			out.WriteString("--")
		default:
			out.WriteByte('-')
		}
	}
	return out.String()
}

// A folder belongs to this tree where it carries the tree's own name, a folder inside it, or a scratch folder named off it. A sibling tree names a folder the tree holds nowhere, so it stays out. [[spec/guidance/retro/collect]]
func retroBelongs(name, slug string, inside []string) bool {
	said := strings.ToLower(name)
	own := strings.ToLower(slug)
	if own == "" {
		return false
	}
	for at := strings.Index(said, own); at >= 0; at = retroOutsideIndexFrom(said, own, at+1) {
		if at > 0 && said[at-1] != '-' {
			continue
		}
		rest := said[at+len(own):]
		if rest == "" || strings.HasPrefix(rest, "--") {
			return true
		}
		if !strings.HasPrefix(rest, "-") {
			continue
		}
		if at > 0 {
			return true
		}
		next := rest[1:]
		if slices.ContainsFunc(inside, func(one string) bool { return next == one || strings.HasPrefix(next, one+"-") }) {
			return true
		}
	}
	return false
}

// The place of a text inside another from a start, or -1. [[spec/guidance/retro/collect]]
func retroOutsideIndexFrom(said, sub string, from int) int {
	if from > len(said) {
		return -1
	}
	if at := strings.Index(said[from:], sub); at >= 0 {
		return from + at
	}
	return -1
}

// The folders standing at the tree's top, named the way the harness names them. [[spec/guidance/retro/collect]]
func retroOutsideInside(disk diskDoors, root string) []string {
	out := []string{}
	for _, one := range disk.listed(root) {
		if one.IsDir() {
			out = append(out, strings.ToLower(retroSlugOf(one.Name())))
		}
	}
	return out
}

// Copies every source into the input folder, and answers the folders it reads. A file changed past since copies, and a transcript keeps its lines stamped past the window. [[spec/guidance/retro/collect]]
func retroOutsideInto(it retroCollectDoors, into string, since, window time.Time, refused *[]retroCollectRow) []string {
	disk := it.disk
	folders := []string{}
	slug := retroSlugOf(it.root)
	inside := retroOutsideInside(disk, it.root)
	bases := map[string]string{"home": it.home, "temp": it.temp}
	for _, source := range retroOutsideSources {
		base := bases[source.base]
		if base == "" {
			continue
		}
		at := filepath.Join(append([]string{base}, source.under...)...)
		for _, one := range disk.listed(at) {
			if !one.IsDir() || !retroBelongs(one.Name(), slug, inside) {
				continue
			}
			folders = append(folders, source.kind+"/"+one.Name())
			from := filepath.Join(at, one.Name())
			if source.kind != "transcripts" {
				retroOutsideCopyTree(disk, from, filepath.Join(into, source.kind, one.Name()), since, nil, time.Time{}, refused)
				continue
			}
			retroOutsideCopyTree(disk, from, filepath.Join(into, "transcripts", one.Name()), since, []string{retroOutsideMemory}, window, refused)
			retroOutsideCopyTree(disk, filepath.Join(from, retroOutsideMemory), filepath.Join(into, retroOutsideMemory, one.Name()), time.Time{}, nil, time.Time{}, refused)
		}
	}
	return folders
}

// Copies a folder, past the stores and the skips, and keeps a transcript's lines inside the window where one stands. [[spec/guidance/retro/collect]]
func retroOutsideCopyTree(disk diskDoors, from, to string, since time.Time, skips []string, window time.Time, refused *[]retroCollectRow) {
	for _, one := range disk.listed(from) {
		if slices.Contains(skips, one.Name()) || slices.Contains(retroOutsideStores, one.Name()) {
			continue
		}
		was := filepath.Join(from, one.Name())
		now := filepath.Join(to, one.Name())
		if one.IsDir() {
			retroOutsideCopyTree(disk, was, now, since, nil, window, refused)
			continue
		}
		if err := retroOutsideCopyOne(disk, was, to, now, since, window); err != nil {
			*refused = append(*refused, retroCollectRow{Path: was, Refused: retroCollectReasonOf(err)})
		}
	}
}

// Copies one file, past one older than since, and cuts a transcript to the window. [[spec/guidance/retro/collect]]
func retroOutsideCopyOne(disk diskDoors, was, to, now string, since, window time.Time) error {
	if !since.IsZero() {
		said, err := disk.stat(was)
		if err != nil {
			return err
		}
		if said.ModTime().Before(since) {
			return nil
		}
	}
	if err := disk.makeAll(to, 0o777); err != nil {
		return err
	}
	text, err := disk.read(was)
	if err != nil {
		return err
	}
	if !window.IsZero() && strings.HasSuffix(was, retroOutsideLines) {
		return disk.write(now, []byte(retroOutsideWithinWindow(string(text), window)), 0o666)
	}
	mode := fs.FileMode(0o666)
	if said, err := disk.stat(was); err == nil {
		mode = said.Mode().Perm()
	}
	return disk.write(now, text, mode)
}

// The lines stamped at or past the window. A line with no stamp takes the stamp before it, and one before any stamp stays. [[spec/tickets/the-retro-finishes-its-asks]]
func retroOutsideWithinWindow(text string, window time.Time) string {
	field := retroTimed[0].field
	for _, source := range retroTimed {
		if source.top == "transcripts" {
			field = source.field
		}
	}
	var last time.Time
	stamped := false
	kept := []string{}
	for _, line := range strings.Split(text, "\n") {
		if found := field.FindStringSubmatch(line); found != nil {
			if when, ok := retroCollectDate(found[1]); ok {
				last, stamped = when, true
			}
		}
		if !stamped || !last.Before(window) {
			kept = append(kept, line)
		}
	}
	return strings.Join(kept, "\n")
}
