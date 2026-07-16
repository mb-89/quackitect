package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// design: go-compact  implements: req-iterations-compacted
// A shipped iteration compacts into ONE container file, <iter>/archive.md, that the loader reads natively (adr-compact-archive-loader). The container is line-oriented. The first line is the header. Each entry is a marker line, then the ORIGINAL file bytes verbatim. The marker names the file's path relative to the iteration dir. For example: <<<quackitect-archive v1>>> <<<node: req-a.md>>> --- id: req-a ... <<<node: tasks/f1-m1-gate.md>>> ... . Verbatim payloads are the whole trick. The loader parses the same bytes as before, so stmtHash and fullHash never move, the kill-criterion. A payload without a final newline writes under <<<node+pad: ...>>>. The splitter strips the one padding newline the writer added. A payload that itself carries a marker line refuses to compact, since the split would corrupt it. Recorded choices: evidence docs (M<n>-*.md) are SKIPPED. They stay beside archive.md, because evidenceDocSeed (engine.go) resolves evidence by disk glob and stays archive-unaware. The selftest fixture has no evidence docs, so its <=1 file bound holds. The strict referee (StrictIssues, trust.go) never flags archive.md. Its first line is the header, not '---', so nodeFence refuses it as a node candidate. Verified: StrictIssues returns at !nodeFence; LoadAll's plain-file path checks the same fence. Known seam: the referee also does not INDEX archived ids, so a live node referencing an archived one would flag dangling. Acceptable while only shipped, self-contained iterations compact.

const (
	archiveName      = "archive.md"
	archiveHeader    = "<<<quackitect-archive v1>>>"
	archiveMarkOpen  = "<<<node: "
	archiveMarkPad   = "<<<node+pad: "
	archiveMarkClose = ">>>"
)

// archEntry is one archived file: its path relative to the iteration dir, and its
// original bytes.
type archEntry struct {
	rel string
	raw []byte
}

// parseArchiveMarker reads one line as an entry marker. ok is false for every other line.
func parseArchiveMarker(line string) (rel string, pad bool, ok bool) {
	line = strings.TrimRight(line, "\r")
	if !strings.HasSuffix(line, archiveMarkClose) {
		return "", false, false
	}
	body := strings.TrimSuffix(line, archiveMarkClose)
	switch {
	case strings.HasPrefix(body, archiveMarkOpen):
		return body[len(archiveMarkOpen):], false, true
	case strings.HasPrefix(body, archiveMarkPad):
		return body[len(archiveMarkPad):], true, true
	}
	return "", false, false
}

// isArchiveFile reports whether raw is a container: the header is its first line.
func isArchiveFile(raw []byte) bool {
	s := string(raw)
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		s = s[:i]
	}
	return strings.TrimRight(s, "\r") == archiveHeader
}

// splitArchive splits container bytes into entries, payloads verbatim.
// It returns nil when raw is not a container.
func splitArchive(raw []byte) []archEntry {
	if !isArchiveFile(raw) {
		return nil
	}
	s := string(raw)
	body := ""
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		body = s[i+1:]
	}
	type mark struct {
		lineStart    int // where the marker line begins (the previous payload's end)
		payloadStart int // right after the marker line's newline
		rel          string
		pad          bool
	}
	var marks []mark
	pos := 0
	for pos < len(body) {
		line := body[pos:]
		next := len(body)
		if j := strings.IndexByte(line, '\n'); j >= 0 {
			line = line[:j]
			next = pos + j + 1
		}
		if rel, pad, ok := parseArchiveMarker(line); ok {
			marks = append(marks, mark{pos, next, rel, pad})
		}
		pos = next
	}
	out := make([]archEntry, 0, len(marks))
	for i, m := range marks {
		end := len(body)
		if i+1 < len(marks) {
			end = marks[i+1].lineStart
		}
		payload := body[m.payloadStart:end]
		if m.pad {
			payload = strings.TrimSuffix(payload, "\n")
		}
		out = append(out, archEntry{m.rel, []byte(payload)})
	}
	return out
}

// loadArchiveNodes parses every node entry of the container at path into nodes.
// It reports whether the file WAS a container — a false lets the walker fall through
// to the plain-file path. Recognition and filters match that path exactly. The
// synthetic path is the iteration dir joined with the recorded relative path — the
// ORIGINAL location — so ids and iterOf derive the same values as before the
// compaction.
func loadArchiveNodes(path string, nodes map[string]Node) bool {
	raw, err := os.ReadFile(path)
	if err != nil || !isArchiveFile(raw) {
		return false
	}
	dir := filepath.Dir(path)
	for _, e := range splitArchive(raw) {
		if !nodeFence(e.raw) {
			continue // an archived evidence-style entry is stored, never a node
		}
		syn := filepath.Join(dir, filepath.FromSlash(e.rel))
		n := ParseNodeBytes(syn, e.raw)
		if n.Statement != "" && !strings.HasPrefix(n.ID, "TASK-") && !strings.HasPrefix(n.ID, "MARK-") {
			nodes[n.ID] = n
		}
	}
	return true
}

// loadNodesUnder is the root-parameterized twin of the LoadAll walk (the test seam).
// Plain node files and archive containers under root load identically. It skips the
// full load's extras: the strict guard, code designs, and connection lanes.
func loadNodesUnder(root string) map[string]Node {
	nodes := map[string]Node{}
	filepath.Walk(root, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}
		if isSpecContent(root, path) {
			return nil // project-content notes load via their own readers
		}
		if filepath.Base(path) == archiveName && loadArchiveNodes(path, nodes) {
			return nil
		}
		raw, e := os.ReadFile(path)
		if e != nil || !nodeFence(raw) {
			return nil
		}
		n := ParseNodeBytes(path, raw)
		if n.Statement != "" && !strings.HasPrefix(n.ID, "TASK-") && !strings.HasPrefix(n.ID, "MARK-") {
			nodes[n.ID] = n
		}
		return nil
	})
	return nodes
}

// evidenceDocRe matches an evidence doc's base name (M<n>-*.md). Those files stay
// beside the archive — see the region note.
var evidenceDocRe = regexp.MustCompile(`^M\d+-.*\.md$`)

// compactIteration folds every file under <root>/iterations/<iter> (any depth) into
// one archive.md and deletes the originals. Entry order is the sorted relative paths,
// so the container is deterministic. Evidence docs are skipped.
func compactIteration(root, iter string) error {
	dir := filepath.Join(root, "iterations", iter)
	fi, err := os.Stat(dir)
	if err != nil || !fi.IsDir() {
		return fmt.Errorf("compact: no iteration dir %s", dir)
	}
	if _, aerr := os.Stat(filepath.Join(dir, archiveName)); aerr == nil {
		return fmt.Errorf("compact: %s already holds %s", iter, archiveName)
	}
	var rels []string
	filepath.Walk(dir, func(path string, wfi os.FileInfo, werr error) error {
		if werr != nil || wfi == nil || wfi.IsDir() {
			return nil
		}
		if evidenceDocRe.MatchString(filepath.Base(path)) {
			return nil // evidence stays a plain file: evidenceDocSeed globs the disk
		}
		if rel, rerr := filepath.Rel(dir, path); rerr == nil {
			rels = append(rels, filepath.ToSlash(rel))
		}
		return nil
	})
	if len(rels) == 0 {
		return nil // nothing to fold; an empty container helps no one
	}
	sort.Strings(rels)
	var b strings.Builder
	b.WriteString(archiveHeader + "\n")
	for _, rel := range rels {
		raw, rerr := os.ReadFile(filepath.Join(dir, filepath.FromSlash(rel)))
		if rerr != nil {
			return rerr
		}
		for _, line := range strings.Split(string(raw), "\n") {
			if _, _, ok := parseArchiveMarker(line); ok {
				return fmt.Errorf("compact: %s carries a container marker line — refused", rel)
			}
		}
		mark := archiveMarkOpen
		pad := len(raw) == 0 || raw[len(raw)-1] != '\n'
		if pad {
			mark = archiveMarkPad
		}
		b.WriteString(mark + rel + archiveMarkClose + "\n")
		b.Write(raw)
		if pad {
			b.WriteString("\n")
		}
	}
	if werr := os.WriteFile(filepath.Join(dir, archiveName), []byte(b.String()), 0o644); werr != nil {
		return werr
	}
	for _, rel := range rels {
		if derr := os.Remove(filepath.Join(dir, filepath.FromSlash(rel))); derr != nil {
			return derr
		}
	}
	pruneEmptyDirs(dir)
	return nil
}

// pruneEmptyDirs removes now-empty subdirectories under dir. Best effort, deepest
// first — a non-empty dir refuses its Remove and stays.
func pruneEmptyDirs(dir string) {
	var subs []string
	filepath.Walk(dir, func(path string, fi os.FileInfo, err error) error {
		if err == nil && fi != nil && fi.IsDir() && path != dir {
			subs = append(subs, path)
		}
		return nil
	})
	sort.Sort(sort.Reverse(sort.StringSlice(subs)))
	for _, s := range subs {
		os.Remove(s)
	}
}

// enddesign
