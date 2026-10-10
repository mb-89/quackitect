// The journal an undo reads. It holds both halves of every file, so drift
// refuses the restore and the text comes back out of the entry itself, under
// the keys the journal files already on disk carry.
// [[spec/design_output/apply#the-journal-holds-both-halves]]
package edits

import (
	"fmt"
	"sort"
	"strings"
	"unicode"
)

// The digits an entry's name carries, and the end of its file. [[spec/design_output/apply#the-entry-names-its-time]]
const (
	stampDigits = 20
	entryEnd    = ".json"
)

// One file of an entry, as the bridge writes it. [[spec/design_output/apply#the-journal-holds-both-halves]]
type EntryFile struct {
	File        string `json:"file"`
	Was         string `json:"was"`
	Made        string `json:"made"`
	DidNotExist bool   `json:"did_not_exist"`
	DidNotStay  bool   `json:"did_not_stay"`
}

// An entry: whose apply, when, the ticket it serves, its files, and a word where nothing landed. [[spec/design_output/apply#an-entry-says-whose-apply]]
type Entry struct {
	On     string      `json:"on"`
	By     string      `json:"by"`
	At     string      `json:"at"`
	Ticket string      `json:"ticket"`
	Files  []EntryFile `json:"files"`
	Landed *bool       `json:"landed,omitempty"`
}

// [[spec/design_output/apply#an-entry-says-whose-apply]]
func JournalOf(at, on, by string, files []Changed, ticket string) Entry {
	out := Entry{On: on, By: by, At: at, Ticket: ticket, Files: make([]EntryFile, 0, len(files))}
	for _, one := range files {
		was := one.Was
		if one.Born {
			was = ""
		}
		out.Files = append(out.Files, EntryFile{File: one.File, Was: was, Made: one.Made, DidNotExist: one.Born})
	}
	return out
}

// [[spec/design_output/apply#the-entry-names-its-time]]
func NameOf(at string) string {
	digits := strings.Map(func(r rune) rune {
		if unicode.IsDigit(r) {
			return r
		}
		return -1
	}, at)
	digits += strings.Repeat("0", stampDigits)
	return digits[:stampDigits] + entryEnd
}

// The padding digits past the stamp an entry's name counts in, and the counts they hold. [[spec/tickets/journal-names-stay-unique]]
const (
	countDigits = 3
	counts      = 1000
)

// The first name the taken check reads as free, counting in the padding digits, so two entries in one millisecond both stand and sort in order. [[spec/tickets/journal-names-stay-unique]]
func FreeName(at string, taken func(name string) bool) string {
	stamp := NameOf(at)[:stampDigits-countDigits]
	name := ""
	for n := range counts {
		name = stamp + fmt.Sprintf("%0*d", countDigits, n) + entryEnd
		if !taken(name) {
			break
		}
	}
	return name
}

// The newest entry the name wrote, or any where the name is empty. [[spec/design_output/apply#an-entry-says-whose-apply]]
func NewestOn(names []string, entries map[string]Entry, on string) (string, Entry, bool) {
	sorted := append([]string(nil), names...)
	sort.Strings(sorted)
	for i := len(sorted) - 1; i >= 0; i-- {
		held, ok := entries[sorted[i]]
		if !ok || held.Files == nil {
			continue
		}
		if on == "" || held.On == on {
			return sorted[i], held, true
		}
	}
	return "", Entry{}, false
}

// A file an undo writes back. [[spec/design_output/apply#drift-refuses-the-restore]]
type Put struct {
	File string
	Text string
}

// What an undo writes and removes, or why it refuses: every file reads as the apply left it first. [[spec/design_output/apply#drift-refuses-the-restore]]
func Restores(entry Entry, held map[string]Held) ([]Put, []string, string) {
	if len(entry.Files) == 0 {
		return nil, nil, "the entry names no file"
	}
	for _, one := range entry.Files {
		said := held[one.File]
		switch {
		case one.DidNotStay && said.Exists:
			return nil, nil, "undo refused: " + one.File + " stands again since the apply. Somebody's work goes, so nothing comes back"
		case one.DidNotStay:
		case !said.Exists && one.DidNotExist:
		case !said.Exists:
			return nil, nil, "undo refused: " + one.File + " reads as absent since the apply. Put it back, then undo"
		case said.Text != one.Made:
			return nil, nil, "undo refused: " + one.File + " moves since the apply. Somebody's work goes, so nothing comes back"
		}
	}
	var writes []Put
	var removes []string
	for _, one := range entry.Files {
		if one.DidNotExist {
			removes = append(removes, one.File)
		} else {
			writes = append(writes, Put{File: one.File, Text: one.Was})
		}
	}
	return writes, removes, ""
}
