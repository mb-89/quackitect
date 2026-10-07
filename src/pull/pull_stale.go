// The stale read: a passed leaf keeps the hash of each input and of its own
// definition, and a pull marks the leaves whose hashes no longer match.
// [[spec/design_output/pull#an-input-marks-its-steps]]
package pull

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"unicode/utf16"

	"quackitect/src/front"
	"quackitect/src/modules/check"
	"quackitect/src/note"
	"quackitect/src/yaml"
)

// The inputs a leaf names past its siblings, and the end a linked note carries. [[spec/design_output/pull#an-input-marks-its-steps]]
const (
	askInput  = "ask"
	diffInput = "diff"
)

var (
	linkIn       = regexp.MustCompile(`\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]`)
	ticketFolder = regexp.MustCompile(`^(spec|\.se)/tickets/`)
)

// The text of a chapter and every chapter under it, the guidance comments aside. The bless reads it too. [[spec/design_output/pull#an-input-marks-its-steps]]
func chapterText(text, path string) string {
	sections := note.Read(text).Sections
	if path == askInput {
		path = "Ask"
	}
	at := note.SectionAt(sections, path)
	if at < 0 {
		return ""
	}
	level := sections[at].Level
	rows := []string{}
	for i := at; i < len(sections); i++ {
		if i > at && sections[i].Level <= level {
			break
		}
		if i > at {
			rows = append(rows, strings.Repeat("#", sections[i].Level)+" "+sections[i].Header)
		}
		for _, row := range sections[i].Own {
			if !commentRow.MatchString(row) {
				rows = append(rows, row)
			}
		}
	}
	return strings.TrimSpace(strings.Join(rows, "\n"))
}

// The units JavaScript counts in a text. [[spec/design_output/pull#an-input-marks-its-steps]]
func unitsOf(text string) []uint16 { return utf16.Encode([]rune(text)) }

// The path an input name stands for: ask, a path, or a sibling's name. [[spec/design_output/pull#an-input-marks-its-steps]]
func inputPath(front *yaml.Doc, leaf *Leaf, name string) string {
	if name == askInput {
		return askInput
	}
	parent := ""
	if at := strings.LastIndex(leaf.Path, "/"); at >= 0 {
		parent = leaf.Path[:at]
	}
	walk := map[string]bool{}
	for _, one := range WalkOf(front) {
		walk[one.Path] = true
	}
	candidates := []string{name, name}
	if parent != "" {
		candidates[1] = parent + "/" + name
	}
	for _, one := range candidates {
		if walk[one] {
			return one
		}
	}
	return ""
}

func inputNames(leaf *Leaf) []string {
	out := []string{}
	for _, one := range yaml.StringsOf(leaf.Said.Get("input")) {
		if one != "" && one != diffInput {
			out = append(out, one)
		}
	}
	return out
}

// The hash of one note, its size and the hash of its head at a size. [[spec/design_output/pull#an-input-marks-its-steps]]
type noteHash struct {
	hash, head string
	size       int
}

func notePath(link string) string {
	if strings.Contains(link, ".") {
		return link
	}
	return link + ".md"
}

// A linked ticket reads as its Ask, which no pass writes, so two tickets linking each other stale neither. Every other note reads whole off the disk. [[spec/design_output/pull#ticket-links-read-the-ask]]
func (it *It) noteHashes(asks map[string]int) map[string]noteHash {
	out := map[string]noteHash{}
	for path, size := range asks {
		text, ok := it.Disk.Read(path)
		if !ok {
			continue
		}
		if ticketFolder.MatchString(path) {
			text = chapterText(text, askInput)
		}
		units := unitsOf(text)
		said := noteHash{hash: HashText(text), size: len(units)}
		if size > 0 && size <= len(units) {
			said.head = HashText(string(utf16.Decode(units[:size])))
		}
		out[path] = said
	}
	return out
}

// Each input the leaf reads, and each note an input chapter links: its name, its hash, and the size the hash reads. [[spec/design_output/pull#an-input-marks-its-steps]]
func (it *It) inputsOf(text string, leaf *Leaf) []any {
	frontDoc := FrontOf(text)
	out := []any{}
	links := []string{}
	for _, name := range inputNames(leaf) {
		path := inputPath(frontDoc, leaf, name)
		if path == "" {
			continue
		}
		said := chapterText(text, path)
		out = append(out, front.Ordered{pair("name", path), pair("hash", HashText(said)), pair("size", len(unitsOf(said)))})
		for _, found := range linkIn.FindAllStringSubmatch(said, -1) {
			if link := strings.TrimSpace(found[1]); !contains(links, link) {
				links = append(links, link)
			}
		}
	}
	asks := map[string]int{}
	for _, link := range links {
		asks[notePath(link)] = 0
	}
	known := it.noteHashes(asks)
	for _, link := range links {
		if one, ok := known[notePath(link)]; ok {
			out = append(out, front.Ordered{pair("name", "[["+link+"]]"), pair("hash", one.hash), pair("size", one.size)})
		}
	}
	return out
}

// The hash of a leaf's own definition. [[spec/design_output/pull#an-input-marks-its-steps]]
func defOf(leaf *Leaf) string { return HashOf(leaf.Said) }

// The inputs whose text no longer opens with the text the hash read, so an append keeps a leaf whole. [[spec/design_output/pull#an-input-marks-its-steps]]
func (it *It) movedOf(text string, inputs any) []string {
	held := []*yaml.Doc{}
	asks := map[string]int{}
	for _, item := range yaml.Flat(inputs) {
		one := yaml.AsDoc(item)
		if one == nil || yaml.AsString(one.Get("name")) == "" {
			continue
		}
		held = append(held, one)
		if name := yaml.AsString(one.Get("name")); strings.HasPrefix(name, "[[") {
			asks[notePath(name[2:len(name)-2])] = yaml.AsInt(one.Get("size"))
		}
	}
	known := it.noteHashes(asks)
	out := []string{}
	for _, one := range held {
		name := yaml.AsString(one.Get("name"))
		hash := yaml.AsString(one.Get("hash"))
		size, _ := strconv.Atoi(yaml.AsString(one.Get("size")))
		if strings.HasPrefix(name, "[[") {
			if now, ok := known[notePath(name[2:len(name)-2])]; !ok || (now.hash != hash && now.head != hash) {
				out = append(out, name)
			}
			continue
		}
		units := unitsOf(chapterText(text, name))
		if len(units) < size || HashText(string(utf16.Decode(units[:size]))) != hash {
			out = append(out, name)
		}
	}
	return out
}

// The last entry a leaf wrote that no condition skipped. [[spec/design_output/pull#an-input-marks-its-steps]]
func lastOf(text, path string) *yaml.Doc {
	var out *yaml.Doc
	for _, entry := range entriesAt(text, path) {
		if !yaml.Truthy(entry.Get("skipped")) {
			out = entry
		}
	}
	return out
}

// A ticket whose process moved takes the new route, and a moved definition at or before the step takes the step. [[spec/design_output/pull#an-input-marks-its-steps]]
func (it *It) processRead(one *Held) {
	named := FieldOf(one.Text, "process")
	if named == "" {
		return
	}
	held, why := ProcessAt(it.methodDisk(), named)
	frontDoc := FrontOf(one.Text)
	if why != "" || yaml.AsString(frontDoc.Get("process_hash")) == held.Hash {
		return
	}
	fresh := EntriesIn(held.Route)
	stands := map[string]bool{}
	for _, each := range fresh {
		if each.Leaf {
			stands[each.Path] = true
		}
	}
	reached := []string{StepPathOf(frontDoc)}
	for _, entry := range recordIn(one.Text) {
		reached = append(reached, yaml.AsString(entry.Get("step")))
	}
	for _, path := range reached {
		if !stands[path] {
			return
		}
	}
	leaves := LeavesOf(frontDoc)
	now := 0
	for i, leaf := range leaves {
		if leaf.Path == StepPathOf(frontDoc) {
			now = i
			break
		}
	}
	var moved *Entry
	for i := range leaves[:min(now+1, len(leaves))] {
		last := lastOf(one.Text, leaves[i].Path)
		def := ""
		if last != nil {
			def = yaml.AsString(last.Get("def"))
		}
		if def == "" {
			continue
		}
		there := false
		for _, each := range fresh {
			if each.Path == leaves[i].Path && each.Leaf {
				there = HashOf(each.Said) == def
				break
			}
		}
		if !there {
			moved = &leaves[i]
			break
		}
	}
	route := held.Route
	if moved == nil {
		steps, why := UpdatedRoute(frontDoc, held.Route)
		if why != "" {
			return
		}
		route = steps
	}
	schema := it.ticketSchema()
	if schema == nil {
		return
	}
	text := check.ReRouted(one.Text, schema, route, held.Hash)
	if moved != nil {
		text = withField(text, "step", moved.Path)
	}
	if len(check.CheckNote(text, schema, one.Path)) > 0 {
		return
	}
	one.Text, one.Front = text, FrontOf(text)
	said := "takes " + held.Name + " again"
	if moved != nil {
		said += ", and goes back to " + moved.Path
	}
	it.landedAlone(one, []string{said})
}

// Every leaf before the step whose inputs moved takes a stale entry, and the first takes the step. [[spec/design_output/pull#an-input-marks-its-steps]]
func (it *It) inputRead(one *Held) {
	frontDoc := FrontOf(one.Text)
	leaves := LeavesOf(frontDoc)
	now := 0
	for i, leaf := range leaves {
		if leaf.Path == StepPathOf(frontDoc) {
			now = i
			break
		}
	}
	type staled struct {
		path  string
		moved []string
	}
	stale := []staled{}
	for _, leaf := range leaves[:now] {
		last := lastOf(one.Text, leaf.Path)
		if last == nil || yaml.AsString(last.Get("def")) == "" || yaml.AsString(last.Get("stale")) != "" {
			continue
		}
		if moved := it.movedOf(one.Text, last.Get("inputs")); len(moved) > 0 {
			stale = append(stale, staled{path: leaf.Path, moved: moved})
		}
	}
	if len(stale) == 0 {
		return
	}
	text := one.Text
	paths := []string{}
	for _, leaf := range stale {
		text = withEntry(text, pair("step", leaf.path), pair("hand", Engine), pair("stale", strings.Join(leaf.moved, ", ")))
		paths = append(paths, leaf.path)
	}
	one.Text = withField(text, "step", stale[0].path)
	one.Front = FrontOf(one.Text)
	it.landedAlone(one, []string{fmt.Sprintf("marks %s stale, and goes back to %s", strings.Join(paths, ", "), stale[0].path)})
}

// [[spec/design_output/pull#an-input-marks-its-steps]]
func (it *It) staleRead(one *Held) *Held {
	frontDoc := FrontOf(one.Text)
	if FieldOf(one.Text, "state") != Open || LeafOf(one.Front, StepPathOf(frontDoc)) == nil {
		return one
	}
	it.processRead(one)
	it.inputRead(one)
	return one
}

// The disk under the method root, where the processes and the guidance stand. [[spec/design_output/vehicle#the-work-root-inherits]]
func (it *It) methodDisk() Disk {
	if it.Method == "" || it.Method == it.Root {
		return it.Disk
	}
	return OSDisk{Root: it.Method}
}
