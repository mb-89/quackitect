package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// design: go-apply-manifest  implements: req-apply-manifest
// The judged bulk-edit applier: `quack apply <manifest.json>` runs a JSON array of
// {file, old, new} exact-string edits. Validate first, apply second — every edit's
// old text must match its file exactly once (byte-level), or the WHOLE manifest is
// refused and nothing is written. Edits to one file compose in manifest order
// against the in-memory content. Bytes in, bytes out: no encoding pass, no BOM
// handling. Writes are atomic per file (temp + rename).

// manifestEdit is one exact-string replacement in an apply manifest.
type manifestEdit struct {
	File string `json:"file"`
	Old  string `json:"old"`
	New  string `json:"new"`
}

// loadEditManifest parses the manifest file into its edit list.
func loadEditManifest(path string) ([]manifestEdit, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("apply: cannot read manifest %s: %v", path, err)
	}
	var edits []manifestEdit
	if err := json.Unmarshal(raw, &edits); err != nil {
		return nil, fmt.Errorf("apply: %s is not a JSON edit array: %v", path, err)
	}
	return edits, nil
}

// applyManifest validates every edit against the (progressively edited) file
// contents, then writes the results. With dry it validates and prints what
// would change, writing nothing.
func applyManifest(path string, dry bool) error {
	edits, err := loadEditManifest(path)
	if err != nil {
		return err
	}
	contents := map[string][]byte{} // keyed by cleaned path
	editCount := map[string]int{}
	var order []string // first-seen file order, for stable output and writes
	for i, e := range edits {
		if e.File == "" {
			return fmt.Errorf("apply: edit %d has no file", i)
		}
		if e.Old == "" {
			return fmt.Errorf("apply: edit %d (%s): old text is empty", i, e.File)
		}
		key := filepath.Clean(e.File)
		buf, ok := contents[key]
		if !ok {
			raw, rerr := os.ReadFile(key)
			if rerr != nil {
				return fmt.Errorf("apply: edit %d (%s): cannot read file: %v", i, e.File, rerr)
			}
			buf = raw
			order = append(order, key)
		}
		n := bytes.Count(buf, []byte(e.Old))
		if n != 1 {
			return fmt.Errorf("apply: edit %d (%s): old text matches %d times, need exactly 1 - manifest refused, nothing applied", i, e.File, n)
		}
		contents[key] = bytes.Replace(buf, []byte(e.Old), []byte(e.New), 1)
		editCount[key]++
	}
	if dry {
		for _, key := range order {
			fmt.Printf("would edit %s: %d edit(s)\n", key, editCount[key])
		}
		fmt.Printf("dry run: %d file(s) validated, nothing written\n", len(order))
		return nil
	}
	for _, key := range order {
		if err := writeFileAtomic(key, contents[key]); err != nil {
			return fmt.Errorf("apply: writing %s: %v", key, err)
		}
		fmt.Printf("edited %s: %d edit(s)\n", key, editCount[key])
	}
	return nil
}

// writeFileAtomic writes data via a temp file in the target's directory, then renames.
func writeFileAtomic(path string, data []byte) error {
	mode := os.FileMode(0o644)
	if fi, err := os.Stat(path); err == nil {
		mode = fi.Mode()
	}
	tmp, err := os.CreateTemp(filepath.Dir(path), ".apply-*")
	if err != nil {
		return err
	}
	tmpName := tmp.Name()
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		os.Remove(tmpName)
		return err
	}
	if err := tmp.Close(); err != nil {
		os.Remove(tmpName)
		return err
	}
	os.Chmod(tmpName, mode)
	if err := os.Rename(tmpName, path); err != nil {
		os.Remove(tmpName)
		return err
	}
	return nil
}

// underLedger reports whether a path points into the ledger (spec/ledger).
func underLedger(path string) bool {
	abs, err := filepath.Abs(path)
	if err != nil {
		return false
	}
	led, err := filepath.Abs(ledgerDir())
	if err != nil {
		return false
	}
	rel, err := filepath.Rel(led, abs)
	if err != nil {
		return false
	}
	return rel == "." || (!strings.HasPrefix(rel, "..") && !filepath.IsAbs(rel))
}

// cmdApply is the console shell: usage, the manifest-exists check, and the
// ledger guard — the ledger is never bulk-edited.
func cmdApply(rest []string) {
	var args []string
	for _, a := range rest {
		if !strings.HasPrefix(a, "--") {
			args = append(args, a)
		}
	}
	if len(args) != 1 {
		fmt.Fprintln(os.Stderr, "usage: "+brand()+" apply <manifest.json> [--dry]   (judged bulk edits: exact-once {file, old, new})")
		os.Exit(2)
	}
	path := args[0]
	if _, err := os.Stat(path); err != nil {
		fmt.Fprintln(os.Stderr, "apply: manifest not found: "+path)
		fmt.Fprintln(os.Stderr, "usage: "+brand()+" apply <manifest.json> [--dry]")
		os.Exit(2)
	}
	edits, err := loadEditManifest(path)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
	for i, e := range edits {
		if underLedger(e.File) {
			fmt.Fprintf(os.Stderr, "apply: edit %d (%s): the ledger is never bulk-edited - manifest refused\n", i, e.File)
			os.Exit(1)
		}
	}
	if err := applyManifest(path, hasFlag(rest, "--dry")); err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}

func init() { registerCmd("apply", cmdApply) }

// enddesign
