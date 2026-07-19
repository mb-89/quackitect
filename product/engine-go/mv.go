package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

// design: go-quack-mv  implements: req-quack-mv
// The rename determinizer: `quack mv <old-id> <new-id>` renames a node and follows
// EVERY reference class the workspace owns, in one journaled, undoable pass. The
// classes: the file name, markdown links, bare ids, edge lanes, and the source.
// Link maintenance is purely mechanical, so it is an engine command, never an
// agent hand-sweep. Matching is boundary-safe: an id matches only between
// non-id characters, so a longer id containing the old one never corrupts.
// Generated renders (*.html) stay out; they regenerate. History prose renames
// too: a live old-iteration node referencing a dead id would break ref-integrity,
// and that outranks archival wording. --dry prints the plan and writes nothing.
func mvRename(roots, extras []string, oldID, newID string, dry, journal bool) (changed []string, refs int, err error) {
	idRe := regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)
	if !idRe.MatchString(oldID) || !idRe.MatchString(newID) {
		return nil, 0, fmt.Errorf("mv: ids are lowercase [a-z0-9-] - fix the id, then re-run")
	}
	if oldID == newID {
		return nil, 0, fmt.Errorf("mv: old and new are the same id - pick a different new id, then re-run")
	}
	var targets []string
	for _, r := range roots {
		filepath.Walk(r, func(p string, fi os.FileInfo, werr error) error {
			if werr != nil || fi.IsDir() {
				return nil
			}
			switch strings.ToLower(filepath.Ext(p)) {
			case ".md", ".jsonl", ".toml", ".base", ".go", ".json", ".ps1", ".sh", ".cmd":
				targets = append(targets, p)
			}
			return nil
		})
	}
	for _, e := range extras {
		if _, serr := os.Stat(e); serr == nil {
			targets = append(targets, e)
		}
	}
	sortStrings(targets)
	declRe := regexp.MustCompile(`(?m)^(?:id:[ \t]*|(?://|#) design:[ \t]*)` + regexp.QuoteMeta(newID) + `(?:[^a-z0-9-]|$)`)
	oldRe := regexp.MustCompile(`(^|[^a-z0-9-])` + regexp.QuoteMeta(oldID) + `($|[^a-z0-9-])`)
	repl := "${1}" + newID + "${2}"
	contents := map[string][]byte{}
	orig := map[string][]byte{}
	var order []string
	for _, p := range targets {
		raw, rerr := os.ReadFile(p)
		if rerr != nil {
			continue
		}
		if declRe.Match(raw) {
			return nil, 0, fmt.Errorf("mv: %s already declares the id %s - pick a free new id, then re-run", p, newID)
		}
		if !oldRe.Match(raw) {
			continue
		}
		refs += len(oldRe.FindAllIndex(raw, -1))
		// adjacent occurrences share a boundary byte; a second pass catches them
		nb := oldRe.ReplaceAll(raw, []byte(repl))
		nb = oldRe.ReplaceAll(nb, []byte(repl))
		order = append(order, p)
		orig[p] = raw
		contents[p] = nb
	}
	if len(order) == 0 {
		return nil, 0, fmt.Errorf("mv: id %s appears nowhere under the roots - check the id, then re-run", oldID)
	}
	renames := map[string]string{}
	created := map[string]bool{}
	for _, p := range targets {
		base := filepath.Base(p)
		ext := filepath.Ext(base)
		if strings.TrimSuffix(base, ext) == oldID {
			np := filepath.Join(filepath.Dir(p), newID+ext)
			if _, serr := os.Stat(np); serr == nil {
				return nil, 0, fmt.Errorf("mv: %s already exists - pick a free new id, then re-run", np)
			}
			renames[p] = np
			created[np] = true
		}
	}
	if dry {
		for _, p := range order {
			fmt.Printf("would edit %s\n", p)
		}
		for op, np := range renames {
			fmt.Printf("would rename %s -> %s\n", op, np)
		}
		fmt.Printf("dry run: %d file(s), %d reference(s), nothing written\n", len(order), refs)
		return order, refs, nil
	}
	if journal {
		jc := map[string][]byte{}
		for p, b := range contents {
			jc[p] = b
		}
		jo := make([]string, len(order))
		copy(jo, order)
		for op, np := range renames {
			if b, ok := contents[op]; ok {
				jc[np] = b
			} else if b2, r2 := os.ReadFile(op); r2 == nil {
				jc[np] = b2
			}
			if _, ok := orig[op]; !ok {
				if b2, r2 := os.ReadFile(op); r2 == nil {
					orig[op] = b2
					jo = append(jo, op)
				}
			}
			jo = append(jo, np)
		}
		if jerr := applyJournalRecord(jo, orig, created, jc); jerr != nil {
			return nil, 0, fmt.Errorf("mv: undo journal failed, nothing written: %v", jerr)
		}
	}
	for _, p := range order {
		if werr := writeFileAtomic(p, contents[p]); werr != nil {
			return changed, refs, fmt.Errorf("mv: writing %s: %v", p, werr)
		}
		changed = append(changed, p)
		fmt.Printf("edited %s\n", p)
	}
	for op, np := range renames {
		if rerr := os.Rename(op, np); rerr != nil {
			return changed, refs, fmt.Errorf("mv: renaming %s: %v", op, rerr)
		}
		fmt.Printf("renamed %s -> %s\n", op, np)
	}
	return changed, refs, nil
}

// cmdMv is the console shell: two ids, the workspace roots, journal on.
func cmdMv(rest []string) {
	var args []string
	for _, a := range rest {
		if !strings.HasPrefix(a, "--") {
			args = append(args, a)
		}
	}
	if len(args) != 2 {
		fmt.Fprintln(os.Stderr, "usage: quack mv <old-id> <new-id> [--dry] - rename a node and follow every reference")
		os.Exit(1)
	}
	roots := []string{SPEC, filepath.Join(ROOT, "product")}
	extras := []string{filepath.Join(ROOT, "README.md"), filepath.Join(ROOT, "AGENTS.md")}
	changed, refs, err := mvRename(roots, extras, args[0], args[1], hasFlag(rest, "--dry"), true)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	if !hasFlag(rest, "--dry") {
		fmt.Printf("mv: %s -> %s, %d file(s), %d reference(s); `quack apply --undo` reverts\n", args[0], args[1], len(changed), refs)
	}
}

func init() { registerCmd("mv", cmdMv) }

// enddesign
