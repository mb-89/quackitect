package main

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

// design: go-apply-manifest  implements: req-apply-manifest, req-apply-general
// This is the judged bulk-edit applier. `quack apply <manifest.json>` runs a JSON array of {file, old, new} exact-string edits. Validate first, apply second. Every edit's old text must match its file exactly once, byte-level, or the WHOLE manifest is refused and nothing is written. Edits to one file compose in manifest order against the in-memory content. Bytes in, bytes out: no encoding pass, no BOM handling. Writes are atomic per file, temp plus rename.

// manifestEdit is one operation in an apply manifest. Op "" is the byte-exact
// replacement; "create" births a file that must not exist; "write" replaces a whole
// file's content (req-apply-general.1). Every op validates before anything writes.
type manifestEdit struct {
	File  string `json:"file"`
	Old   string `json:"old"`
	New   string `json:"new"`
	Op    string `json:"op"`
	Field string `json:"field"`
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
func applyManifest(path string, dry bool) ([]string, error) {
	edits, err := loadEditManifest(path)
	if err != nil {
		return nil, err
	}
	if verdict := applyRedGuardLive(edits); verdict != "" {
		return nil, errors.New(verdict) // go-red-edit-guard: a strand is refused before validation
	}
	contents := map[string][]byte{} // keyed by cleaned path
	editCount := map[string]int{}
	orig := map[string][]byte{}  // prior bytes per file, for the undo journal (go-apply-undo)
	created := map[string]bool{} // files this apply brings into being
	var order []string           // first-seen file order, for stable output and writes
	seenFile := func(key string) {
		if _, ok := contents[key]; !ok {
			order = append(order, key)
		}
	}
	for i, e := range edits {
		if e.File == "" {
			return nil, fmt.Errorf("apply: edit %d has no file", i)
		}
		key := filepath.Clean(e.File)
		switch e.Op {
		case "create":
			if e.New == "" {
				return nil, fmt.Errorf("apply: edit %d (%s): create with no content", i, e.File)
			}
			if _, ok := contents[key]; ok {
				return nil, fmt.Errorf("apply: edit %d (%s): create over an earlier edit - merge the edits into one entry, then re-run", i, e.File)
			}
			if _, serr := os.Stat(key); serr == nil {
				return nil, fmt.Errorf("apply: edit %d (%s): create refused, the file exists - use a byte-exact edit instead; nothing applied", i, e.File)
			}
			seenFile(key)
			created[key] = true
			contents[key] = []byte(e.New)
			editCount[key]++
		case "write":
			if e.New == "" {
				return nil, fmt.Errorf("apply: edit %d (%s): write with no content", i, e.File)
			}
			if _, ok := contents[key]; !ok {
				if raw, rerr := os.ReadFile(key); rerr == nil {
					orig[key] = raw
				} else {
					created[key] = true // a write to a missing file births it: undo removes
				}
			}
			seenFile(key)
			contents[key] = []byte(e.New)
			editCount[key]++
		case "":
			if e.Old == "" {
				return nil, fmt.Errorf("apply: edit %d (%s): old text is empty (use op create/write for whole files)", i, e.File)
			}
			buf, ok := contents[key]
			if !ok {
				raw, rerr := os.ReadFile(key)
				if rerr != nil {
					return nil, fmt.Errorf("apply: edit %d (%s): cannot read file: %v", i, e.File, rerr)
				}
				buf = raw
				seenFile(key)
				contents[key] = raw
				orig[key] = raw // the prior bytes, for the undo journal (go-apply-undo)
			}
			if !ok {
				buf = contents[key]
			}
			n := bytes.Count(buf, []byte(e.Old))
			if n != 1 {
				return nil, fmt.Errorf("apply: edit %d (%s): old text matches %d times, need exactly 1 - make the old text unique, then re-run; nothing applied", i, e.File, n)
			}
			contents[key] = bytes.Replace(buf, []byte(e.Old), []byte(e.New), 1)
			editCount[key]++
		case "set-field":
			if e.Field == "" || e.New == "" {
				return nil, fmt.Errorf("apply: edit %d (%s): set-field needs field and new - add both, then re-run", i, e.File)
			}
			buf, ok := contents[key]
			if !ok {
				raw, rerr := os.ReadFile(key)
				if rerr != nil {
					return nil, fmt.Errorf("apply: edit %d (%s): cannot read file: %v", i, e.File, rerr)
				}
				buf = raw
				seenFile(key)
				contents[key] = raw
				orig[key] = raw
			}
			nb, ferr := setFrontmatterField(buf, e.Field, e.New)
			if ferr != nil {
				return nil, fmt.Errorf("apply: edit %d (%s): %v", i, e.File, ferr)
			}
			contents[key] = nb
			editCount[key]++
		default:
			return nil, fmt.Errorf("apply: edit %d (%s): unknown op %q", i, e.File, e.Op)
		}
	}
	if dry {
		for _, key := range order {
			fmt.Printf("would edit %s: %d edit(s)\n", key, editCount[key])
		}
		fmt.Printf("dry run: %d file(s) validated, nothing written\n", len(order))
		return order, nil
	}
	// the undo journal snapshots BEFORE the writes (go-apply-undo); a journal failure
	// refuses the apply — an unrevertible bulk edit is the incident class this kills
	if err := applyJournalRecord(order, orig, created, contents); err != nil {
		return nil, fmt.Errorf("apply: undo journal failed, nothing written: %v", err)
	}
	for _, key := range order {
		if err := writeFileAtomic(key, contents[key]); err != nil {
			return order, fmt.Errorf("apply: writing %s: %v", key, err)
		}
		fmt.Printf("edited %s: %d edit(s)\n", key, editCount[key])
	}
	return order, nil
}

// design: go-apply-field-ops  implements: req-apply-field-ops
// set-field edits ONE frontmatter field, structure-aware: the field's line
// replaces in place, or inserts before the closing fence when absent; every other
// byte survives untouched. A nested block refuses. Scalar surgery only.
func setFrontmatterField(raw []byte, field, value string) ([]byte, error) {
	s := string(raw)
	nl := "\n"
	if strings.Contains(s, "\r\n") {
		nl = "\r\n"
	}
	if !strings.HasPrefix(s, "---") {
		return nil, errors.New("set-field: no frontmatter block - add one, then re-run")
	}
	end := strings.Index(s[3:], nl+"---")
	if end < 0 {
		return nil, errors.New("set-field: the frontmatter never closes - fix the fences, then re-run")
	}
	head := s[:3+end]
	tail := s[3+end:]
	lineRe := regexp.MustCompile(`(?m)^` + regexp.QuoteMeta(field) + `:[^\n]*(\n[ \t]+[^\n]*)*`)
	if m := lineRe.FindString(head); m != "" {
		if strings.Contains(m, "\n") {
			return nil, fmt.Errorf("set-field: %s is a nested block - edit it byte-exactly, then re-run", field)
		}
		head = lineRe.ReplaceAllString(head, field+": "+value)
	} else {
		head = head + nl + field + ": " + value
	}
	return []byte(head + tail), nil
}

// enddesign

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
	// the undo lane (go-apply-undo): revert the most recent journaled apply
	if hasFlag(rest, "--undo") {
		if err := applyUndo(); err != nil {
			fmt.Fprintln(os.Stderr, err.Error())
			os.Exit(1)
		}
		callLogSetExtra("outcome", "undone")
		return
	}
	var args []string
	for _, a := range rest {
		if !strings.HasPrefix(a, "--") {
			args = append(args, a)
		}
	}
	if len(args) != 1 {
		fmt.Fprintln(os.Stderr, "usage: "+brand()+" apply <manifest.json> [--dry] | apply --undo   (judged bulk edits: exact-once {file, old, new}; --undo reverts the last apply)")
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
			fmt.Fprintf(os.Stderr, "apply: edit %d (%s): the ledger is never bulk-edited - use the bless and observe-red lanes instead\n", i, e.File)
			os.Exit(1)
		}
	}
	files, err := applyManifest(path, hasFlag(rest, "--dry"))
	// the audit trail (req-apply-general.2): touched files and the outcome ride the
	// dispatch's call-log line
	outcome := "applied"
	if hasFlag(rest, "--dry") {
		outcome = "dry-run"
	}
	if err != nil {
		outcome = "refused"
	}
	callLogSetExtra("files", files)
	callLogSetExtra("outcome", outcome)
	if err != nil {
		fmt.Fprintln(os.Stderr, err.Error())
		os.Exit(1)
	}
}

func init() { registerCmd("apply", cmdApply) }

// enddesign

// design: go-apply-undo  implements: req-apply-undo
// The apply journal, ruled by the owner after the b25 corruption incident. Every applied
// manifest records the touched files' PRIOR bytes plus the sha of what it wrote. The
// record is a numbered entry under the data home, and the last few entries stay.
// `apply --undo` restores the newest entry byte-exactly and pops it. It refuses when any
// touched file drifted since the apply: a silent clobber is worse than no undo. A file
// the apply CREATED is removed by its undo. The ledger stays out, as it is for apply.
var applyJournalOverride string

const applyJournalKeep = 4

func applyJournalDir() string {
	if applyJournalOverride != "" {
		return applyJournalOverride
	}
	return filepath.Join(dataDirFor("evidence"), "apply-journal")
}

type applyJournalMeta struct {
	Files   []string          `json:"files"`
	Applied map[string]string `json:"applied"` // file -> sha256 of the bytes the apply wrote
	Created map[string]bool   `json:"created"` // the apply created it: undo removes the file
}

func applySha(b []byte) string {
	x := sha256.Sum256(b)
	return hex.EncodeToString(x[:])
}

// applyJournalEntries lists the journal's numbered entries, ascending.
func applyJournalEntries() []int {
	var ns []int
	ents, err := os.ReadDir(applyJournalDir())
	if err != nil {
		return nil
	}
	for _, e := range ents {
		if !e.IsDir() {
			continue
		}
		if n, cerr := strconv.Atoi(e.Name()); cerr == nil {
			ns = append(ns, n)
		}
	}
	sort.Ints(ns)
	return ns
}

// applyJournalRecord snapshots one apply: prior bytes per file, applied hashes, creations.
func applyJournalRecord(order []string, orig map[string][]byte, created map[string]bool, contents map[string][]byte) error {
	ns := applyJournalEntries()
	next := 1
	if len(ns) > 0 {
		next = ns[len(ns)-1] + 1
	}
	dir := filepath.Join(applyJournalDir(), strconv.Itoa(next))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}
	meta := applyJournalMeta{Files: order, Applied: map[string]string{}, Created: map[string]bool{}}
	for i, key := range order {
		meta.Applied[key] = applySha(contents[key])
		if created[key] {
			meta.Created[key] = true
			continue
		}
		if err := os.WriteFile(filepath.Join(dir, "before-"+strconv.Itoa(i)+".bin"), orig[key], 0o644); err != nil {
			return err
		}
	}
	raw, err := json.MarshalIndent(meta, "", " ")
	if err != nil {
		return err
	}
	if err := os.WriteFile(filepath.Join(dir, "meta.json"), raw, 0o644); err != nil {
		return err
	}
	// the journal stays bounded: the oldest entries beyond the keep fall away
	ns = applyJournalEntries()
	for len(ns) > applyJournalKeep {
		os.RemoveAll(filepath.Join(applyJournalDir(), strconv.Itoa(ns[0])))
		ns = ns[1:]
	}
	return nil
}

// applyUndo restores the newest journaled apply byte-exactly and pops the entry.
func applyUndo() error {
	ns := applyJournalEntries()
	if len(ns) == 0 {
		return errors.New("apply: nothing to undo - the journal is empty")
	}
	dir := filepath.Join(applyJournalDir(), strconv.Itoa(ns[len(ns)-1]))
	raw, err := os.ReadFile(filepath.Join(dir, "meta.json"))
	if err != nil {
		return fmt.Errorf("apply: undo journal unreadable: %v - remove the entry by hand", err)
	}
	var meta applyJournalMeta
	if err := json.Unmarshal(raw, &meta); err != nil {
		return fmt.Errorf("apply: undo journal malformed: %v - remove the entry by hand", err)
	}
	// drift check FIRST, over every file — the undo is all-or-nothing
	for _, key := range meta.Files {
		cur, rerr := os.ReadFile(key)
		if rerr != nil {
			return fmt.Errorf("apply: undo refused - %s is unreadable since the apply (%v); restore the file, then retry", key, rerr)
		}
		if applySha(cur) != meta.Applied[key] {
			return fmt.Errorf("apply: undo refused - %s changed since the apply; resolve by hand, nothing restored", key)
		}
	}
	for i, key := range meta.Files {
		if meta.Created[key] {
			if err := os.Remove(key); err != nil {
				return fmt.Errorf("apply: undo of created %s failed: %v", key, err)
			}
			fmt.Printf("removed %s (the apply created it)\n", key)
			continue
		}
		before, rerr := os.ReadFile(filepath.Join(dir, "before-"+strconv.Itoa(i)+".bin"))
		if rerr != nil {
			return fmt.Errorf("apply: undo journal missing %s's prior bytes: %v", key, rerr)
		}
		if err := writeFileAtomic(key, before); err != nil {
			return fmt.Errorf("apply: restoring %s: %v", key, err)
		}
		fmt.Printf("restored %s\n", key)
	}
	os.RemoveAll(dir)
	fmt.Println("apply: the most recent apply is undone")
	return nil
}

// enddesign
