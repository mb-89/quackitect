// The editor loads what its own list names, and a linked folder stands off
// that list. So the link into ~/.vscode/extensions goes beside an entry in
// that folder's extensions.json, which holds every extension a person has:
// one unreadable element and the editor drops the lot, so a write keeps every
// element it reads. [[spec/design_output/extension#a-file-another-program-owns]]
package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// The editor's list, and the copy of it a write leaves beside it. [[spec/design_output/extension#a-file-another-program-owns]]
const (
	editorList = "extensions.json"
	editorKept = "extensions.json.before-quackitect"
)

// What the list reads as: the entries it names, and what the read dropped or unwrapped. [[spec/design_output/extension#a-file-another-program-owns]]
type editorEntries struct {
	entries            []*ordered
	unreadable         bool
	dropped, unwrapped int
}

// The entries a list's text names, an element no id identifies dropped and a wrapper's value read through. [[spec/design_output/extension#a-file-another-program-owns]]
func editorEntriesOf(text string) editorEntries {
	value, err := orderedOf(text)
	if err != nil {
		return editorEntries{unreadable: true}
	}
	var out editorEntries
	collectEntries(value, &out)
	return out
}

func collectEntries(node any, out *editorEntries) {
	switch one := node.(type) {
	case []any:
		for _, item := range one {
			collectEntries(item, out)
		}
		return
	case *ordered:
		if entryID(one) != "" {
			out.entries = append(out.entries, one)
			return
		}
		if inner, ok := one.values["value"].([]any); ok {
			out.unwrapped++
			collectEntries(inner, out)
			return
		}
	}
	out.dropped++
}

// The id an entry carries under its identifier, or nothing. [[spec/design_output/extension#a-file-another-program-owns]]
func entryID(entry *ordered) string {
	identifier, ok := entry.values["identifier"].(*ordered)
	if !ok {
		return ""
	}
	id, _ := identifier.values["id"].(string)
	return id
}

// Builds an object off its keys and values in the order they stand. [[spec/design_output/extension#a-file-another-program-owns]]
func orderedFrom(pairs ...any) *ordered {
	out := &ordered{values: map[string]any{}}
	for at := 0; at+1 < len(pairs); at += 2 {
		out.set(pairs[at].(string), pairs[at+1])
	}
	return out
}

// The entry naming this tree's extension at its folder. [[spec/design_output/extension#a-file-another-program-owns]]
func editorEntry(id, version, dest string, at int64) *ordered {
	return orderedFrom(
		"identifier", orderedFrom("id", id),
		"version", version,
		"location", orderedFrom("$mid", json.Number("1"), "path", dest, "scheme", "file"),
		"relativeLocation", filepath.Base(dest),
		"metadata", orderedFrom("installedTimestamp", json.Number(strconv.FormatInt(at, 10)), "source", "vsix"),
	)
}

// What an upsert answers: the entries to write, the ids the write would lose, and whether ours stood already. [[spec/design_output/extension#a-lost-id-stands-refused]]
type editorUpserted struct {
	entries  []*ordered
	lost     []string
	replaced bool
}

// Ours in place of any entry carrying its id, every other entry kept as it stands. [[spec/design_output/extension#a-lost-id-stands-refused]]
func editorUpsert(said editorEntries, mine *ordered) editorUpserted {
	id := entryID(mine)
	var out editorUpserted
	holds := map[string]bool{id: true}
	for _, one := range said.entries {
		if entryID(one) == id {
			out.replaced = true
			continue
		}
		out.entries = append(out.entries, one)
		holds[entryID(one)] = true
	}
	out.entries = append(out.entries, mine)
	for _, one := range said.entries {
		if was := entryID(one); !holds[was] {
			out.lost = append(out.lost, was)
		}
	}
	return out
}

// The entries as JSON.stringify writes an array, on one line. [[spec/design_output/extension#a-file-another-program-owns]]
func editorListText(entries []*ordered) string {
	values := make([]any, len(entries))
	for at, one := range entries {
		values[at] = one
	}
	var said bytes.Buffer
	if err := json.Compact(&said, []byte(orderedText(values))); err != nil {
		return orderedText(values)
	}
	return said.String()
}

// Writes ours into the folder's list, and answers whether it wrote and why. A list reading as no JSON, or a write losing an id, stands as it is. [[spec/design_output/extension#a-file-another-program-owns]]
func editorRegister(folder string, mine *ordered) (bool, string) {
	where := filepath.Join(folder, editorList)
	text, standing := readText(where)
	if !standing {
		text = "[]"
	}
	said := editorEntriesOf(text)
	if said.unreadable {
		return false, "the list reads as no JSON at all, so it stands as it is"
	}
	found := editorUpsert(said, mine)
	if len(found.lost) > 0 {
		return false, "writing would lose " + strings.Join(found.lost, ", ") + ", so nothing went in"
	}
	if err := os.MkdirAll(folder, 0o755); err != nil {
		return false, err.Error()
	}
	if standing {
		if err := os.WriteFile(filepath.Join(folder, editorKept), []byte(text), 0o644); err != nil {
			return false, err.Error()
		}
	}
	if err := os.WriteFile(where, []byte(editorListText(found.entries)+"\n"), 0o644); err != nil {
		return false, err.Error()
	}
	if found.replaced {
		return true, "the entry stood already, and it stands again"
	}
	return true, "the entry went in"
}

// Whether the folder's list names the id. [[spec/design_output/extension#a-file-another-program-owns]]
func editorRegistered(folder, id string) bool {
	text, ok := readText(filepath.Join(folder, editorList))
	if !ok {
		return false
	}
	for _, one := range editorEntriesOf(text).entries {
		if entryID(one) == id {
			return true
		}
	}
	return false
}

// Whether a path stands as a link, a Windows junction counting as one. [[spec/design_output/extension#the-link-stands]]
func isLink(path string) bool {
	_, err := os.Readlink(path)
	return err == nil
}

// The path a link resolves to, its own target where the resolve falls. [[spec/design_output/extension#the-link-stands]]
func realOf(path string) string {
	if real, err := filepath.EvalSymlinks(path); err == nil {
		return real
	}
	if target, err := os.Readlink(path); err == nil {
		return target
	}
	return path
}

func slashed(path string) string { return strings.ReplaceAll(path, "\\", "/") }

func samePath(one, two string) bool {
	return strings.EqualFold(slashed(one), slashed(two))
}

// Whether the destination stands as a link reaching the source. [[spec/design_output/extension#the-link-stands]]
func editorLinkedAt(dest, source string) bool {
	if !isLink(dest) || !stands(dest) {
		return false
	}
	return samePath(realOf(dest), realOf(source))
}

// Links the source in at the destination, inside the editor's folder alone, and answers whether the link stands and why. [[spec/design_output/extension#the-link-stands]]
func editorLinkAt(dest, source string, makeLink func(source, dest string) error) (bool, string) {
	if !strings.Contains(slashed(dest), "/.vscode/extensions/") {
		return false, dest + " stands outside the editor's folder, so nothing goes there"
	}
	if editorLinkedAt(dest, source) {
		return true, "the link stands already"
	}
	// [[spec/design_output/extension#a-link-pointing-nowhere]]
	nowhere := isLink(dest) && !stands(dest)
	var err error
	switch {
	case isLink(dest):
		err = os.Remove(dest)
	case stands(dest):
		err = os.RemoveAll(dest)
	}
	if err == nil {
		err = os.MkdirAll(filepath.Dir(dest), 0o755)
	}
	if err == nil {
		err = makeLink(source, dest)
	}
	if err != nil {
		return false, err.Error()
	}
	if nowhere {
		return true, "a link pointing nowhere went, and the link went in"
	}
	return true, "the link went in"
}

// The link a box makes: a junction through cmd on Windows, which needs no right a symlink needs, and a symlink elsewhere. [[spec/design_output/extension#the-link-stands]]
func boxLink(d boxDoors) func(source, dest string) error {
	return func(source, dest string) error {
		if !d.windows() {
			return os.Symlink(source, dest)
		}
		if ran := d.run([]string{"cmd", "/c", "mklink", "/J", dest, source}, runOpts{}); ran.code != 0 {
			return errors.New("mklink answers " + strconv.Itoa(ran.code) + " " + strings.TrimSpace(ran.stdout+ran.stderr))
		}
		return nil
	}
}

// The manifest fields the link reads. [[spec/design_output/extension#the-link-stands]]
type extensionManifest struct {
	Publisher string `json:"publisher"`
	Name      string `json:"name"`
	Version   string `json:"version"`
}

// Asks whether this tree's sidebar stands linked and listed, or links and lists it where loud, saying each step. [[spec/design_output/extension#the-link-stands]]
func editorLink(d boxDoors, loud bool) bool {
	home := homeOf(d.env)
	if home == "" {
		if loud {
			fmt.Fprintln(d.errs, "This box names no home folder, so the editor's list has none.")
		}
		return false
	}
	source := filepath.Join(d.root, "src", "extension")
	text, _ := readText(filepath.Join(source, "package.json"))
	var said extensionManifest
	if err := json.Unmarshal([]byte(text), &said); err != nil {
		if loud {
			fmt.Fprintf(d.errs, "The extension's manifest reads as no manifest: %v\n", err)
		}
		return false
	}
	id := said.Publisher + "." + said.Name
	folder := filepath.Join(home, ".vscode", "extensions")
	dest := filepath.Join(folder, id+"-"+said.Version)
	if !loud {
		return editorLinkedAt(dest, source) && editorRegistered(folder, id)
	}
	linked, why := editorLinkAt(dest, source, boxLink(d))
	fmt.Fprintf(d.out, "%s: %s.\n", id, why)
	if !linked {
		return false
	}
	wrote, why := editorRegister(folder, editorEntry(id, said.Version, dest, d.now().UnixMilli()))
	fmt.Fprintf(d.out, "%s: %s.\n", id, why)
	return wrote
}
