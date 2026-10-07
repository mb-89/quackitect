// The rename verb: one name moves, and every reach the tree writes moves with
// it, an import, a path, a note link and a word in prose.
// [[spec/design_output/index#a-rename-reaches-a-name]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"slices"
	"sort"
	"strings"

	"quackitect/src/modules/edits"
	"quackitect/src/modules/hooks/command"
)

// The word a rename's journal entry names its hand by, the folder the undo reads, how far into a file the reader looks for a zero byte, the flag renaming a name standing as no path, the folder of the tickets, and the closed state. [[spec/design_output/index#a-rename-reaches-a-name]]
const (
	renameBy    = "rename"
	undoFolder  = edits.Journal
	sniffBytes  = 4096
	textFlag    = "--text"
	ticketsAt   = "spec/tickets/"
	renameUsage = "se rename <from> <to>: say the name that moves and the one it takes."
)

// The folders a walk leaves alone, as the findings reader leaves them. [[spec/design_output/index#a-rename-reaches-a-name]]
var renameSkips = map[string]bool{".git": true, "node_modules": true, ".se": true, ".claude-plugin": true, "bin": true}

func init() {
	register("rename", func(argv []string, dry bool, out, errs io.Writer) int {
		return renameVerb(landingHere())(argv, dry, out, errs)
	})
}

// A rename's journal entry: the undo's entry, and the move it carries, so the commit verb lands the old path where git reads no rename. [[spec/tickets/journal-the-rename-verb]] [[spec/tickets/rename-detection-misses-rewrites]]
type renameEntry struct {
	edits.Entry
	Moved journaledMove `json:"moved"`
}

// What a rename answers: the files it rewrote, the ones its reader left out, and why it stops. [[spec/design_output/index#a-rename-reaches-a-name]]
type renamed struct {
	wrote   []string
	skipped []string
	why     string
}

// One file a move journals: its path, both texts, and whether it is born or gone. [[spec/tickets/journal-the-rename-verb]]
type journaled struct {
	file, was, made string
	born, gone      bool
}

// The rename verb over the doors. A dry run reads the words and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
func renameVerb(d landingDoors) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		var named []string
		for _, one := range argv[min(1, len(argv)):] {
			if !strings.HasPrefix(one, "-") {
				named = append(named, one)
			}
		}
		if len(named) < 2 {
			fmt.Fprintln(errs, renameUsage)
			return exitUsage
		}
		from, to := named[0], named[1]
		if dry {
			return 0
		}
		// A module's name stands as no path, so the text flag rewrites it and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
		said := d.renaming(from, to)
		if slices.Contains(argv, textFlag) {
			said = d.renamingText(from, to)
		}
		if said.why != "" {
			fmt.Fprintln(errs, said.why)
			return exitFailed
		}
		fmt.Fprintf(out, "%s stands at %s.\n", from, to)
		for _, one := range said.wrote {
			fmt.Fprintf(out, "  %s\n", one)
		}
		// A rule that skips says what it skips, so a hand reads what the run left out. [[spec/design_output/index#a-rename-reaches-a-name]]
		for _, one := range said.skipped {
			fmt.Fprintf(out, "  the reader reads %s as a picture, so the rewrite leaves it alone\n", one)
		}
		fmt.Fprintln(out, "Run ./RUNME.sh links, then ./RUNME.sh check.")
		return 0
	}
}

// Whether a byte joins a word, so a name standing beside it is no reach. [[spec/design_output/index#a-rename-reaches-a-name]]
func wordByte(c byte) bool {
	return c == '_' || c == '-' || ('0' <= c && c <= '9') || ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z')
}

// The first of the names standing edged at the place, the longest first. [[spec/design_output/index#a-rename-reaches-a-name]]
func edgedAt(text string, at int, names []string) (string, bool) {
	if at > 0 && wordByte(text[at-1]) {
		return "", false
	}
	for _, name := range names {
		end := at + len(name)
		if name != "" && strings.HasPrefix(text[at:], name) && (end == len(text) || !wordByte(text[end])) {
			return name, true
		}
	}
	return "", false
}

// Every form of a name rewrites in one pass, the longest first, so no rewrite meets the text an earlier form wrote. [[spec/tickets/rename-rewrites-each-link-once]]
func renamedForms(text string, forms [][2]string) string {
	to := map[string]string{}
	var names []string
	for _, one := range forms {
		if _, ok := to[one[0]]; !ok {
			names = append(names, one[0])
		}
		to[one[0]] = one[1]
	}
	sort.SliceStable(names, func(i, j int) bool { return len(names[i]) > len(names[j]) })
	var out strings.Builder
	for at := 0; at < len(text); {
		if name, ok := edgedAt(text, at, names); ok {
			out.WriteString(to[name])
			at += len(name)
			continue
		}
		out.WriteByte(text[at])
		at++
	}
	return out.String()
}

// A note reaches a reader two ways, as a path and as a link without its ending. [[spec/design_output/index#a-rename-reaches-a-name]]
func formsOf(from, to string) [][2]string {
	out := [][2]string{{from, to}}
	if bare, ok := strings.CutSuffix(from, ".md"); ok {
		out = append(out, [2]string{bare, strings.TrimSuffix(to, ".md")})
	}
	return out
}

// Every file under a folder, whatever its ending, as a path under the root. A folder of the skips stays out. [[spec/design_output/index#a-rename-reaches-a-name]]
func (d landingDoors) filesUnder(where string) []string {
	var out []string
	var into func(at string)
	into = func(at string) {
		found, err := d.box.disk.list(filepath.Join(d.root, filepath.FromSlash(at)))
		if err != nil {
			return
		}
		for _, one := range found {
			if renameSkips[one.Name()] {
				continue
			}
			next := strings.TrimPrefix(at+"/"+one.Name(), "./")
			if one.IsDir() {
				into(next)
			} else {
				out = append(out, next)
			}
		}
	}
	into(where)
	sort.Strings(out)
	return out
}

// A text file holds no zero byte, so the reader looks for one and leaves the ending alone. [[spec/design_output/index#a-rename-reaches-a-name]]
func readsAsText(said []byte) bool {
	return !slices.Contains(said[:min(len(said), sniffBytes)], 0)
}

// The files a rewrite reads, each with its text, beside the ones its reader leaves out. [[spec/design_output/index#a-rename-reaches-a-name]]
func (d landingDoors) writtenFiles() ([]string, map[string]string, []string) {
	var read, skipped []string
	texts := map[string]string{}
	for _, one := range d.filesUnder(".") {
		said, err := d.box.disk.read(d.at(one))
		if err != nil {
			continue
		}
		if !readsAsText(said) {
			skipped = append(skipped, one)
			continue
		}
		read = append(read, one)
		texts[one] = string(said)
	}
	return read, texts, skipped
}

func (d landingDoors) at(path string) string { return filepath.Join(d.root, filepath.FromSlash(path)) }

// The modes a rewritten file and a made folder take. [[spec/design_output/index#a-rename-reaches-a-name]]
const (
	renamedMode       = 0o644
	renamedFolderMode = 0o755
)

// A closed ticket keeps its text, because the ticket door refuses its fields to every hand. [[spec/tickets/rename-rewrites-each-link-once]]
func keepsItsText(path, text string) bool {
	return strings.HasPrefix(path, ticketsAt) && command.StateOf(text) == closedRow
}

// A name standing as no path, such as a module's, which rewrites and moves nothing. [[spec/design_output/index#a-rename-reaches-a-name]]
func (d landingDoors) renamingText(from, to string) renamed {
	var wrote []string
	read, texts, skipped := d.writtenFiles()
	for _, file := range read {
		text := texts[file]
		if keepsItsText(file, text) {
			continue
		}
		if said := renamedForms(text, [][2]string{{from, to}}); said != text {
			if err := d.box.disk.write(d.at(file), []byte(said), renamedMode); err != nil {
				return renamed{why: err.Error()}
			}
			wrote = append(wrote, file)
		}
	}
	return renamed{wrote: wrote, skipped: skipped}
}

// The move: the folder carries whole, then every reach rewrites, and the journal holds both halves. [[spec/design_output/index#a-rename-reaches-a-name]]
func (d landingDoors) renaming(from, to string) renamed {
	source, target := d.at(from), d.at(to)
	if !standsUnder(d.box.disk, "", source) {
		return renamed{why: from + " stands nowhere under this tree."}
	}
	if standsUnder(d.box.disk, "", target) {
		return renamed{why: to + " stands already, so the move stops."}
	}
	held := d.filesUnder(from)
	if len(held) == 0 {
		held = []string{from}
	}
	order, journal := d.movesOf(held, from, to)
	// The folder moves whole, so a folder the walk skips and a picture's bytes move with it. [[spec/design_output/index#a-rename-reaches-a-name]]
	if err := d.box.disk.makeAll(filepath.Dir(target), renamedFolderMode); err != nil {
		return renamed{why: err.Error()}
	}
	if err := d.box.disk.rename(source, target); err != nil {
		return renamed{why: err.Error()}
	}
	// Every reader of the tree asks git for its file list, so the move reaches git too. [[spec/design_output/index#a-rename-reaches-a-name]]
	_ = d.git.Add([]string{from, to})
	var wrote []string
	read, texts, skipped := d.writtenFiles()
	for _, file := range read {
		text := texts[file]
		if keepsItsText(file, text) {
			continue
		}
		said := renamedForms(text, formsOf(from, to))
		if said == text {
			continue
		}
		if err := d.box.disk.write(d.at(file), []byte(said), renamedMode); err != nil {
			return renamed{why: err.Error()}
		}
		wrote = append(wrote, file)
		if born, ok := journal[file]; ok {
			born.made = said
		} else {
			order = append(order, file)
			journal[file] = &journaled{file: file, was: text, made: said}
		}
	}
	if err := d.journals(from, to, order, journal); err != nil {
		return renamed{why: err.Error()}
	}
	return renamed{wrote: wrote, skipped: skipped}
}

// Each text file the move carries, as its old path gone and its new path born. A picture's bytes stay out, because the journal holds text. [[spec/tickets/journal-the-rename-verb]]
func (d landingDoors) movesOf(files []string, from, to string) ([]string, map[string]*journaled) {
	var order []string
	out := map[string]*journaled{}
	for _, file := range files {
		said, err := d.box.disk.read(d.at(file))
		if err != nil || !readsAsText(said) {
			continue
		}
		under := strings.TrimPrefix(file, from)
		was, now := from+under, to+under
		out[was] = &journaled{file: was, was: string(said), gone: true}
		out[now] = &journaled{file: now, made: string(said), born: true}
		order = append(order, was, now)
	}
	return order, out
}

// The entry names the ticket the box's one hold carries, so the pass commit of that ticket stages the move. [[spec/design_output/pull#the-refused-commit]]
func (d landingDoors) journals(from, to string, order []string, journal map[string]*journaled) error {
	if d.now == nil || len(order) == 0 {
		return nil
	}
	stamp := d.now().UTC().Format(logStamp)
	entry := renameEntry{Entry: edits.Entry{On: renameBy + ":" + stamp, By: renameBy, At: stamp, Ticket: heldTicket(d.root), Files: []edits.EntryFile{}}, Moved: journaledMove{From: from, To: to}}
	for _, file := range order {
		one := journal[file]
		was, made := one.was, one.made
		if one.born {
			was = ""
		}
		if one.gone {
			made = ""
		}
		entry.Files = append(entry.Files, edits.EntryFile{File: one.file, Was: was, Made: made, DidNotExist: one.born, DidNotStay: one.gone})
	}
	text, err := json.MarshalIndent(entry, "", "  ")
	if err != nil {
		return err
	}
	folder := d.at(undoFolder)
	if err := d.box.disk.makeAll(folder, renamedFolderMode); err != nil {
		return err
	}
	return d.box.disk.write(filepath.Join(folder, edits.NameOf(stamp)), append(text, '\n'), renamedMode)
}

// Several holds name several tickets, and a move belongs to none of them alone. [[spec/tickets/journal-the-rename-verb]]
func heldTicket(root string) string {
	if held := command.InHand(rootDisk{root}).Tickets; len(held) == 1 {
		return held[0]
	}
	return ""
}
