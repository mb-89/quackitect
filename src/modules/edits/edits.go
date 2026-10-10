// The edits module: patch, replace, undo and mint, each landing through the
// write door with a journal an undo reads back. It
// stands off the wiring until the door's missing rules port.
// [[spec/tickets/edit-tools-answer-in-go]]
package edits

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"quackitect/src/q"
)

// The module an edit action lists its request to, and the verb of each action. [[spec/tickets/edit-tools-answer-in-go]]
const (
	Module      = "edits"
	patchVerb   = "patch"
	replaceVerb = "replace"
	undoVerb    = "undo"
	mintVerb    = "mint"
	mintTool    = "mint_note"
	journalBy   = "level0"
	stampForm   = "2006-01-02T15:04:05.000Z"
	keeps       = "the edit journals every file it writes, which edits/undo reads back"
)

// src/modules/check/folders.go owns the undo journal folder, and the package spells it again. [[spec/design_output/apply#the-journal-holds-both-halves]]
const Journal = ".se/.runtime/undo"

// A patch: the ops, the ticket it serves, what it is for, and whether it writes. [[spec/design_output/apply#check-everything-then-write]]
type Patch struct {
	Ops     []Op   `json:"ops" doc:"the edits, each naming its file and its op"`
	Ticket  string `json:"ticket" doc:"the open ticket this write serves"`
	On      string `json:"on,omitempty" doc:"what this change is for, which undo takes back"`
	Preview bool   `json:"preview,omitempty" doc:"answer what lands and write nothing"`
}

// A replace: one pattern over every file a glob reaches. [[spec/design_output/apply#a-pattern-matching-nothing]]
type Replace struct {
	Glob        string   `json:"glob" doc:"which files to sweep, such as **/*.js"`
	Pattern     string   `json:"pattern" doc:"the pattern to find"`
	Replacement string   `json:"replacement" doc:"the text each match takes"`
	Flags       string   `json:"flags,omitempty" doc:"flags out of i m s, with g implied"`
	ExpectCount *float64 `json:"expect_count,omitempty" doc:"the total the sweep matches across the tree, or it refuses"`
	Ticket      string   `json:"ticket" doc:"the open ticket this sweep serves"`
	On          string   `json:"on,omitempty" doc:"what this change is for, which undo takes back"`
	Preview     bool     `json:"preview,omitempty" doc:"answer what lands and write nothing"`
}

// An undo: the change it takes back, as the apply named it. [[spec/design_output/apply#drift-refuses-the-restore]]
type Undo struct {
	On string `json:"on,omitempty" doc:"the change to take back, as the apply named it"`
}

// A mint: the kind, the path, the fields by name and header, and the ticket it serves. [[spec/design_output/schema#the-tool-writes-the-note]]
type Mint struct {
	Kind   string         `json:"kind" doc:"the kind of note, which names the schema it is minted from"`
	Path   string         `json:"path" doc:"where the note lands, such as spec/funnel/a-name.md"`
	Fields map[string]any `json:"fields,omitempty" doc:"the frontmatter values and the text under each chapter, keyed by field name and by header"`
	Ticket string         `json:"ticket" doc:"the open ticket this write serves"`
	On     string         `json:"on,omitempty" doc:"what this change is for, which undo takes back"`
}

// [[spec/tickets/edit-tools-answer-in-go]]
func Registers(c *q.Catalog) q.Writer {
	return q.Join(
		q.ActionIn(c, Module+"/"+patchVerb, func(in Patch) []q.Request { return asked(patchVerb, in) },
			q.Doc("Edits files: many ops, many files, one atomic call, through the write door, with a journal undo reads."), q.ToolName(patchVerb), q.Writes(), q.IO()),
		q.ActionIn(c, Module+"/"+replaceVerb, func(in Replace) []q.Request { return asked(replaceVerb, in) },
			q.Doc("One pattern over every file a glob reaches, in one atomic call, through the write door."), q.ToolName(replaceVerb), q.Writes(), q.IO()),
		q.ActionIn(c, Module+"/"+undoVerb, func(in Undo) []q.Request { return asked(undoVerb, in) },
			q.Doc("Puts back what the newest patch or replace of the name wrote, all or nothing."), q.ToolName(undoVerb), q.Writes(), q.IO()),
		q.ActionIn(c, Module+"/"+mintVerb, func(in Mint) []q.Request { return asked(mintVerb, in) },
			q.Doc("Writes a new note of a kind, in the shape its schema names."), q.ToolName(mintTool), q.Writes(), q.IO()),
	)
}

// [[spec/tickets/edit-tools-answer-in-go]]
func asked(verb string, in any) []q.Request {
	return []q.Request{{Module: Module, Verb: verb, Args: in, NoUndo: keeps}}
}

// What the module reads past the disk: the fault of a named ticket over the files a batch writes, the door's refusal of a written text, the files a glob reaches, the note a mint writes, and the time. [[spec/tickets/edit-tools-answer-in-go]]
type Outside struct {
	Root   string
	Ticket func(name string, files []string) string
	Judge  func(where, was string, stands bool, text string) Judged
	Sweep  func(glob string) []string
	Mint   func(kind, where string, fields map[string]any) (text, why string)
	Now    func() time.Time
}

// What the door answers over a written file: its refusal, or the text that lands and a line the answer carries. [[spec/tickets/edit-door-rules-port]]
type Judged struct {
	Refusal string
	Text    string
	Said    string
}

// The IO side of the module: it answers each request an edit action lists. [[spec/tickets/edit-tools-answer-in-go]]
func Accept(from Outside) func(q.Request) (any, error) {
	return func(asked q.Request) (any, error) {
		switch in := asked.Args.(type) {
		case Patch:
			return from.patches(in)
		case Replace:
			return from.replaces(in)
		case Undo:
			return from.undoes(in)
		case Mint:
			return from.mints(in)
		}
		return nil, fmt.Errorf("%s.%s takes no %T", asked.Module, asked.Verb, asked.Args)
	}
}

// [[spec/design_output/apply#check-everything-then-write]]
func (from Outside) patches(in Patch) (any, error) {
	held, err := from.reads(FilesIn(in.Ops))
	if err != nil {
		return nil, err
	}
	return from.lands(Applied(held, in.Ops), in.Ticket, in.On, in.Preview)
}

// [[spec/design_output/apply#a-pattern-matching-nothing]]
func (from Outside) replaces(in Replace) (any, error) {
	shape, err := Compiled(in.Pattern, in.Flags)
	if err != nil {
		return nil, fmt.Errorf("the pattern compiles to nothing: %w", err)
	}
	var paths []string
	if from.Sweep != nil {
		paths = from.Sweep(in.Glob)
	}
	held, err := from.reads(paths)
	if err != nil {
		return nil, err
	}
	var ops []Op
	for _, one := range paths {
		if shape.MatchString(held[one].Text) {
			ops = append(ops, Op{File: one, Op: opRegex, Pattern: in.Pattern, Replacement: in.Replacement, Flags: in.Flags})
		}
	}
	if len(ops) == 0 {
		return nil, errors.New("the pattern matches nothing under that glob")
	}
	took := Applied(held, ops)
	if took.Why == "" && in.ExpectCount != nil {
		hits := 0
		for _, one := range took.Counts {
			hits += one
		}
		if int(*in.ExpectCount) != hits {
			return nil, fmt.Errorf("the pattern matches %d times, and expect_count says %v", hits, *in.ExpectCount)
		}
	}
	return from.lands(took, in.Ticket, in.On, in.Preview)
}

// [[spec/design_output/schema#the-tool-writes-the-note]]
func (from Outside) mints(in Mint) (any, error) {
	if from.Mint == nil {
		return nil, errors.New("this box mints no note")
	}
	text, why := from.Mint(in.Kind, in.Path, in.Fields)
	if why != "" {
		return nil, errors.New(why)
	}
	ops := []Op{{File: in.Path, Op: opCreate, New: text}}
	held, err := from.reads(FilesIn(ops))
	if err != nil {
		return nil, err
	}
	return from.lands(Applied(held, ops), in.Ticket, in.On, false)
}

// The ticket, then the door over every file, then the journal, then the files. [[spec/design_output/apply#check-everything-then-write]]
func (from Outside) lands(took Took, ticket, on string, preview bool) (any, error) {
	if took.Why != "" {
		return nil, errors.New(took.Why)
	}
	if from.Ticket != nil {
		if fault := from.Ticket(ticket, FilesIn(opsOf(took))); fault != "" {
			return nil, errors.New(fault)
		}
	}
	var notes []string
	if from.Judge != nil {
		for i, one := range took.Files {
			judged := from.Judge(one.File, one.Was, !one.Born, one.Made)
			if judged.Refusal != "" {
				return nil, fmt.Errorf("%s refuses the batch, and nothing is written.\n\n%s", one.File, judged.Refusal)
			}
			took.Files[i].Made = judged.Text
			if judged.Said != "" {
				notes = append(notes, judged.Said)
			}
		}
	}
	if preview {
		return wouldLand(took), nil
	}
	said, err := from.writes(took, on, ticket)
	if err != nil || len(notes) == 0 {
		return said, err
	}
	return strings.Join(append([]string{fmt.Sprint(said)}, notes...), "\n\n"), nil
}

// [[spec/design_output/apply#check-everything-then-write]]
func opsOf(took Took) []Op {
	out := make([]Op, 0, len(took.Files))
	for _, one := range took.Files {
		out = append(out, Op{File: one.File})
	}
	return out
}

// [[spec/design_output/apply#the-journal-holds-both-halves]]
func (from Outside) writes(took Took, on, ticket string) (any, error) {
	at := from.Now().UTC().Format(stampForm)
	name := path.Join(Journal, FreeName(at, from.journalHolds))
	entry := JournalOf(at, on, journalBy, took.Files, ticket)
	if err := from.put(name, entryText(entry), true); err != nil {
		return nil, fmt.Errorf("the undo journal writes nothing, so nothing lands: %w", err)
	}
	var wrote []string
	for i, one := range took.Files {
		if err := from.put(one.File, one.Made, one.Born); err != nil {
			if len(wrote) == 0 {
				landed := false
				entry.Landed = &landed
				_ = from.put(name, entryText(entry), false)
				return nil, fmt.Errorf("nothing written: %s writes nothing: %w", one.File, err)
			}
			entry.Files = from.reached(entry.Files, i)
			_ = from.put(name, entryText(entry), false)
			return nil, fmt.Errorf("%s writes nothing: %w\nThe tree stands part written. Run undo to put it back, out of %s", one.File, err, name)
		}
		wrote = append(wrote, one.File)
	}
	rows := []string{fmt.Sprintf("%d file(s) written, and %s holds what they said before.", len(wrote), name)}
	for _, one := range wrote {
		rows = append(rows, fmt.Sprintf("  %s (%d place(s))", one, took.Counts[one]))
	}
	return strings.Join(append(rows, "", "Run undo to take this back while nothing else touches these files."), "\n"), nil
}

// Whether the journal folder holds the entry name, an absent folder holding none, since put makes it on the first apply. [[spec/tickets/journal-names-stay-unique]]
func (from Outside) journalHolds(name string) bool {
	_, err := os.Stat(from.at(path.Join(Journal, name)))
	return err == nil
}

// The files of a part-written apply, failing at the file at failed: every file before it, and the failing file only where it stands on disk, with the text read back, since a cut write leaves neither half. Undo then meets only the files the apply reached. [[spec/tickets/a-part-written-apply-undoes]]
func (from Outside) reached(files []EntryFile, failed int) []EntryFile {
	out := files[:failed:failed]
	if body, err := os.ReadFile(from.at(files[failed].File)); err == nil {
		stands := files[failed]
		stands.Made = string(body)
		out = append(out, stands)
	}
	return out
}

// [[spec/design_output/apply#check-everything-then-write]]
func wouldLand(took Took) string {
	rows := []string{}
	for _, one := range took.Files {
		row := fmt.Sprintf("  %s (%d place(s))", one.File, took.Counts[one.File])
		if one.Born {
			row += ", new"
		}
		rows = append(rows, row)
	}
	sort.Strings(rows)
	return strings.Join(append([]string{fmt.Sprintf("%d file(s) change, and nothing is written.", len(took.Files))}, rows...), "\n")
}

// [[spec/design_output/apply#drift-refuses-the-restore]]
func (from Outside) undoes(in Undo) (any, error) {
	found, _ := os.ReadDir(from.at(Journal))
	names := []string{}
	entries := map[string]Entry{}
	for _, one := range found {
		if one.IsDir() || !strings.HasSuffix(one.Name(), entryEnd) {
			continue
		}
		names = append(names, one.Name())
		body, err := os.ReadFile(from.at(path.Join(Journal, one.Name())))
		var entry Entry
		if err == nil && json.Unmarshal(body, &entry) == nil {
			entries[one.Name()] = entry
		}
	}
	if len(names) == 0 {
		return nil, errors.New("nothing to undo: no apply journal stands here")
	}
	name, entry, ok := NewestOn(names, entries, in.On)
	if !ok {
		who := in.On
		if who == "" {
			who = "this session"
		}
		return nil, fmt.Errorf("nothing of %s to undo: an undo takes back what its own name wrote", who)
	}
	journal := path.Join(Journal, name)
	// [[spec/design_output/apply#a-first-fault-writes-nothing]]
	if entry.Landed != nil && !*entry.Landed {
		_ = os.Remove(from.at(journal))
		return nil, errors.New("nothing waits to undo: the newest apply wrote nothing")
	}
	paths := make([]string, 0, len(entry.Files))
	for _, one := range entry.Files {
		paths = append(paths, one.File)
	}
	held, err := from.reads(paths)
	if err != nil {
		return nil, err
	}
	puts, removes, why := Restores(entry, held)
	if why != "" {
		return nil, errors.New(why)
	}
	done := []string{}
	for _, one := range puts {
		if err := from.put(one.File, one.Text, true); err != nil {
			return nil, err
		}
		done = append(done, "  put back "+one.File)
	}
	for _, one := range removes {
		if err := os.Remove(from.at(one)); err != nil && !errors.Is(err, os.ErrNotExist) {
			return nil, err
		}
		done = append(done, "  removed "+one+", which the apply made")
	}
	_ = os.Remove(from.at(journal))
	return strings.Join(append([]string{fmt.Sprintf("%d file(s) come back.", len(done))}, done...), "\n"), nil
}

// Every file as the disk holds it, and a refusal of a path outside the tree. [[spec/design_output/apply#bytes-in-bytes-out]]
func (from Outside) reads(paths []string) (map[string]Held, error) {
	held := map[string]Held{}
	for _, one := range paths {
		if outside(one) {
			return nil, fmt.Errorf("%s stands outside the tree, and an edit writes inside it alone", one)
		}
		body, err := os.ReadFile(from.at(one))
		if err == nil {
			held[one] = Held{Exists: true, Text: string(body)}
		}
	}
	return held, nil
}

// A file written under the root, its folder made first where asked. [[spec/design_output/apply#a-create-makes-its-folder]]
func (from Outside) put(where, text string, makesFolder bool) error {
	at := from.at(where)
	if makesFolder {
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			return err
		}
	}
	return os.WriteFile(at, []byte(text), 0o644)
}

// [[spec/design_output/apply#bytes-in-bytes-out]]
func (from Outside) at(where string) string {
	return filepath.Join(from.Root, filepath.FromSlash(where))
}

// A path relative to the root, which climbs out of it or names a disk of its own. [[spec/design_output/apply#bytes-in-bytes-out]]
func outside(where string) bool {
	slashed := strings.ReplaceAll(where, "\\", "/")
	if slashed == "" || strings.HasPrefix(slashed, "/") || (len(slashed) > 1 && slashed[1] == ':') {
		return true
	}
	clean := path.Clean(slashed)
	return clean == ".." || strings.HasPrefix(clean, "../")
}

// The entry as the bridge writes it: two spaces a level, and the text as it stands. [[spec/design_output/apply#the-journal-holds-both-halves]]
func entryText(entry Entry) string {
	var out strings.Builder
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	_ = writes.Encode(entry)
	return out.String()
}
