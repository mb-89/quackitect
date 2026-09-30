// What the hooks door's write door reads off this box: the schemas over a
// written note, off the check module, and the voice over it, off Vale.
// [[spec/tickets/cage-write-door-port]]
package main

import (
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"quackitect/src/modules/check"
	"quackitect/src/modules/edits"
	"quackitect/src/modules/hooks"
	"quackitect/src/modules/hooks/command"
	"quackitect/src/modules/hooks/write"
	"quackitect/src/yaml"
)

// The files the voice reads no row of, the files a lint that ran nowhere refuses, and the rule it names, off CODE, PROSE and UNRAN in the bridge. [[spec/design_output/level0#a-broken-rule-says-so]]
var (
	codeFile  = regexp.MustCompile(`(?i)\.(js|jsx|ts|tsx|json|jsonc)$`)
	proseFile = regexp.MustCompile(`(?i)\.(md|markdown|txt)$`)
)

const (
	unranRule  = "VoiceRulesRan"
	unranSays  = "The voice rules did not run over this file: vale answered nothing. Mend the rule or the setup it names, and write again."
	errorLevel = "error"
)

// What the schemas answer over a written note, off schemaDoor in src/bridge/write.js: the stranger fault of the schema governing its path first, then the faults its own kind's schema finds. [[spec/design_output/schema#the-door-refuses-a-departure]]
func writeSchema(root, where, text string) write.Judged {
	schemas := check.SchemasIn(check.TreeOver(root, rootDisk{root}))
	if governor := check.GovernorOf(schemas, where); governor != nil {
		if found, ok := check.StrangerFault(text, governor, where); ok {
			return write.Judged{Kind: yaml.AsString(governor.Get("kind")), Stranger: true, Found: judgedOf([]check.Finding{found})}
		}
	}
	kind := check.KindOf(text)
	schema := schemas.Get(kind)
	if schema == nil {
		return write.Judged{Kind: kind}
	}
	return write.Judged{Kind: kind, Found: judgedOf(check.CheckNote(text, schema, where))}
}

// [[spec/tickets/cage-write-door-port]]
func judgedOf(found []check.Finding) []write.Finding {
	var out []write.Finding
	for _, one := range found {
		out = append(out, write.Finding{Rule: one.Rule, Line: one.Line, Column: one.Column, Message: one.Message, Severity: one.Severity})
	}
	return out
}

// The findings the voice keeps over a written file, off proseFaults in src/bridge/write.js: none over code or on a box with no Vale, and a refusing row over prose where Vale answers nothing. [[spec/design_output/level0#a-note-reads-clean-first]]
func writeProse(root, where, text string) []write.Finding {
	if codeFile.MatchString(where) {
		return nil
	}
	said := heardOver(root, where, text)
	if !said.ran {
		if said.stands && proseFile.MatchString(where) {
			return []write.Finding{{Rule: unranRule, Line: 1, Column: 1, Message: unranSays, Severity: errorLevel}}
		}
		return nil
	}
	var out []write.Finding
	for _, one := range said.rows {
		severity := one.severity
		if severity == "" {
			severity = errorLevel
		}
		out = append(out, write.Finding{Rule: one.found.Rule, Line: one.found.Line, Column: one.found.Column, Said: one.found.Said, Message: one.message, Severity: severity})
	}
	return out
}

// What the edits module reads past its own disk: the ticket door, the write door, the sweep and the mint, over the root. [[spec/tickets/edit-tools-answer-in-go]]
func editsOutside(root string) edits.Outside {
	return edits.Outside{
		Root: root, Now: time.Now, Judge: editDoor(root), Sweep: func(glob string) []string { return swept(root, glob) },
		Ticket: func(name string, files []string) string {
			for _, one := range files {
				if one != write.Handover {
					return command.TicketFault(name, rootDisk{root}, write.TicketHow)
				}
			}
			return ""
		},
		Mint: func(kind, where string, fields map[string]any) (string, string) {
			return check.Minted(check.SchemasIn(check.TreeOver(root, rootDisk{root})), kind, where, fields)
		},
	}
}

// The write door over a text an edit writes: the schema's refusal, then the voice's. [[spec/tickets/edit-tools-answer-in-go]]
func editDoor(root string) func(where, text string) string {
	return func(where, text string) string {
		return hooks.Judge(where,
			func() write.Judged { return writeSchema(root, where, text) },
			func() []write.Finding { return writeProse(root, where, text) })
	}
}

// The files under the root a glob reaches, past every dot folder. [[spec/tickets/edit-tools-answer-in-go]]
func swept(root, glob string) []string {
	var out []string
	_ = filepath.WalkDir(root, func(at string, entry fs.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		where, _ := filepath.Rel(root, at)
		where = filepath.ToSlash(where)
		if entry.IsDir() {
			if where != "." && strings.HasPrefix(entry.Name(), ".") {
				return filepath.SkipDir
			}
			return nil
		}
		if check.Matches(glob, where) {
			out = append(out, where)
		}
		return nil
	})
	return out
}

// The disk under the root as the check module reads it: slash paths under the root. [[spec/design_output/tree#the-tree-handed-in]]
type rootDisk struct{ root string }

func (one rootDisk) at(path string) string { return filepath.Join(one.root, filepath.FromSlash(path)) }

func (one rootDisk) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}

func (one rootDisk) Exists(path string) bool {
	_, err := os.Stat(one.at(path))
	return err == nil
}

func (one rootDisk) Folder(path string) bool {
	said, err := os.Stat(one.at(path))
	return err == nil && said.IsDir()
}

func (one rootDisk) Names(folder string) []string {
	found, _ := os.ReadDir(one.at(folder))
	out := []string{}
	for _, each := range found {
		if !each.IsDir() {
			out = append(out, each.Name())
		}
	}
	return out
}

// The names a folder holds, as the ticket door reads the holds. [[spec/tickets/edit-tools-answer-in-go]]
func (one rootDisk) List(folder string) []string { return one.Names(folder) }

// The schema read walks no tree, so the disk lists no path. [[spec/tickets/cage-write-door-port]]
func (one rootDisk) Paths() []string { return nil }
