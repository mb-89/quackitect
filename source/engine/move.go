package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// MOVE A FILE AND FIX EVERY REFERENCE TO IT, IN ONE PASS.
//
// Ported from v3's engine/move.ts. The rules are that file's, and the ones
// that matter are these.
//
// TWO FORMS OF REFERENCE. A path written as it is, and a wiki link with the
// extension dropped. Prose takes both. Source takes the path form only,
// because a bare wiki spelling in code would hit identifiers that mean
// something else.
//
// WHAT IT COULD NOT REWRITE IS REPORTED. The list of formats it knows cannot
// cover every language, so an empty rewritten list must never be the only
// thing separating "no references" from "references left dangling".
//
// NOTHING IS WRITTEN UNLESS THE MOVE ITSELF SUCCEEDS.

var (
	proseFormats  = []string{".md", ".canvas", ".base", ".txt"}
	sourceFormats = []string{".go", ".ts", ".tsx", ".js", ".mjs", ".json", ".ps1", ".py", ".yml", ".yaml"}
)

// How many residual hits travel back before the report counts only.
const residualLimit = 50

type Moved struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type Rewritten struct {
	Path  string `json:"path"`
	Count int    `json:"replacements"`
}

type Residual struct {
	Path string `json:"path"`
	Line int    `json:"line"`
	Text string `json:"text"`
}

type MoveResult struct {
	Moved Moved `json:"moved"`

	// What was repaired, and what it could not reach. The second is work the
	// caller still owes, which is why it is answered rather than swallowed.
	Rewritten []Rewritten `json:"rewritten"`
	Unrewrit  []Residual  `json:"unrewritten"`
	UnrewritN int         `json:"unrewritten_total"`
	Searched  int         `json:"files_searched"`
}

type refPair struct {
	old, new  string
	proseOnly bool
}

func refPairs(from, to string) []refPair {
	pairs := []refPair{{old: from, new: to}}
	// The wiki form is its own spelling and means nothing outside markdown.
	if strings.HasSuffix(from, ".md") && strings.HasSuffix(to, ".md") {
		pairs = append(pairs, refPair{
			old:       "[[" + strings.TrimSuffix(from, ".md"),
			new:       "[[" + strings.TrimSuffix(to, ".md"),
			proseOnly: true,
		})
	}
	// LONGEST FIRST, so one form is never half eaten by a shorter one that is
	// a substring of it.
	sort.SliceStable(pairs, func(i, j int) bool { return len(pairs[i].old) > len(pairs[j].old) })
	return pairs
}

// MoveFile moves one file and rewrites what refers to it.
func MoveFile(r Roots, from, to string) (MoveResult, error) {
	var out MoveResult
	absFrom, err := inRoot(r.Work, from)
	if err != nil {
		return out, err
	}
	absTo, err := inRoot(r.Work, to)
	if err != nil {
		return out, err
	}
	st, err := os.Stat(absFrom)
	if err != nil {
		return out, fmt.Errorf("%s: there is no such file to move", from)
	}
	// A DIRECTORY REFUSES BY NAME. Moving a folder would leave every reference
	// inside it unrewritten, which is the one thing this verb exists to stop.
	if st.IsDir() {
		return out, fmt.Errorf("%s is a directory. Move its files one at a time", from)
	}
	// A CASE CORRECTION IS A RENAME, NOT AN OCCUPIED DESTINATION. Windows paths
	// are case-insensitive, so Stat on the new spelling found the source itself
	// and the verb refused one of the commonest renames there is.
	if there, err := os.Stat(absTo); err == nil && !os.SameFile(st, there) {
		return out, fmt.Errorf("%s already exists. Nothing is overwritten without being asked for", to)
	}

	fromRel, toRel := slashed(r.Work, absFrom), slashed(r.Work, absTo)
	if err := os.MkdirAll(filepath.Dir(absTo), 0o755); err != nil {
		return out, err
	}
	if err := os.Rename(absFrom, absTo); err != nil {
		return out, err
	}
	out.Moved = Moved{From: fromRel, To: toRel}

	pairs := refPairs(fromRel, toRel)
	var sourceOnly []refPair
	for _, p := range pairs {
		if !p.proseOnly {
			sourceOnly = append(sourceOnly, p)
		}
	}

	walkWork(r.Work, func(abs, rel, name string) {
		b, err := os.ReadFile(abs)
		if err != nil {
			return
		}
		out.Searched++
		text := string(b)
		var use []refPair
		switch {
		case endsWithAny(name, proseFormats):
			use = pairs
		case endsWithAny(name, sourceFormats):
			use = sourceOnly
		}
		if len(use) > 0 {
			after, n := applyPairs(text, use)
			if n > 0 && after != text {
				if os.WriteFile(abs, []byte(after), 0o644) == nil {
					out.Rewritten = append(out.Rewritten, Rewritten{Path: rel, Count: n})
					text = after
				}
			}
		}
		// EVERY FILE IS SWEPT, whatever its format. What the pass could not
		// reach is the whole point of the report.
		for _, h := range residualHits(text, fromRel, toRel) {
			out.UnrewritN++
			if len(out.Unrewrit) < residualLimit {
				out.Unrewrit = append(out.Unrewrit, Residual{Path: rel, Line: h.Line, Text: h.Text})
			}
		}
	})

	sort.Slice(out.Rewritten, func(i, j int) bool { return out.Rewritten[i].Path < out.Rewritten[j].Path })
	sort.Slice(out.Unrewrit, func(i, j int) bool {
		if out.Unrewrit[i].Path != out.Unrewrit[j].Path {
			return out.Unrewrit[i].Path < out.Unrewrit[j].Path
		}
		return out.Unrewrit[i].Line < out.Unrewrit[j].Line
	})
	return out, nil
}

// THE REWRITE HAS THE SAME BOUNDARY AS THE REPORT. Without it, moving old.md
// rewrote every reference to very-old.md and to vendor/doc/old.md, and reported
// nothing, so the verb that exists to keep references honest broke two other
// files in silence.
func applyPairs(text string, pairs []refPair) (string, int) {
	n := 0
	for _, p := range pairs {
		var b strings.Builder
		at := 0
		for _, i := range every(text, p.old) {
			if i < at {
				continue
			}
			end := i + len(p.old)
			if runsOn(text, i, end) {
				continue
			}
			b.WriteString(text[at:i])
			b.WriteString(p.new)
			at = end
			n++
		}
		b.WriteString(text[at:])
		text = b.String()
	}
	return text, n
}

var wordish = regexp.MustCompile("[A-Za-z0-9]")

// residualHits finds the old path where it survived, and skips the ones that
// are only there because they are part of the new path.
//
// THAT EXCLUSION IS WHAT MAKES THIS USABLE. A move into a subdirectory leaves
// the old path as a literal substring of every path it just rewrote.
func residualHits(text, from, to string) []Residual {
	var out []Residual
	for i, line := range strings.Split(text, "\n") {
		if !strings.Contains(line, from) {
			continue
		}
		var covered [][2]int
		for _, at := range every(line, to) {
			covered = append(covered, [2]int{at, at + len(to)})
		}
		for _, at := range every(line, from) {
			end := at + len(from)
			inside := false
			for _, c := range covered {
				if at >= c[0] && end <= c[1] {
					inside = true
					break
				}
			}
			if inside || runsOn(line, at, end) {
				continue
			}
			out = append(out, Residual{Line: i + 1, Text: trim200(strings.TrimSpace(line))})
			break
		}
	}
	return out
}

// A LONGER NAME THAT MERELY ENDS WITH THE OLD ONE is a different file, so
// neither side of a hit may run on into a name.
//
// A SLASH ON THE LEFT IS PART OF A NAME. vendor/doc/old.md ends with doc/old.md
// and is a different file, and treating the slash as a boundary rewrote it.
func runsOn(line string, at, end int) bool {
	if at > 0 {
		c := line[at-1]
		if wordish.MatchString(string(c)) || c == '_' || c == '.' || c == '-' || c == '/' {
			return true
		}
	}
	return end < len(line) && wordish.MatchString(string(line[end]))
}

func every(line, want string) []int {
	var at []int
	for i := 0; ; {
		n := strings.Index(line[i:], want)
		if n < 0 {
			return at
		}
		at = append(at, i+n)
		i += n + 1
	}
}

func trim200(s string) string {
	if len(s) > 200 {
		return s[:200]
	}
	return s
}

func endsWithAny(name string, exts []string) bool {
	for _, e := range exts {
		if strings.HasSuffix(name, e) {
			return true
		}
	}
	return false
}

// WHAT THE SWEEP DOES NOT ENTER. A build output or a dependency tree is not
// somebody's writing, and rewriting one changes nothing that survives a build.
var skipDirs = map[string]bool{
	".git": true, "node_modules": true, ".bin": true, "out": true, "dist": true,
}

func walkWork(root string, see func(abs, rel, name string)) {
	_ = filepath.WalkDir(root, func(abs string, d os.DirEntry, err error) error {
		if err != nil {
			return nil
		}
		if d.IsDir() {
			if skipDirs[d.Name()] {
				return filepath.SkipDir
			}
			return nil
		}
		see(abs, slashed(root, abs), d.Name())
		return nil
	})
}

func slashed(root, abs string) string {
	rel, err := filepath.Rel(root, abs)
	if err != nil {
		return abs
	}
	return filepath.ToSlash(rel)
}

// inRoot refuses a path that leaves the folder being worked on.
func inRoot(root, p string) (string, error) {
	abs := p
	if !filepath.IsAbs(abs) {
		abs = filepath.Join(root, p)
	}
	abs = filepath.Clean(abs)
	rel, err := filepath.Rel(root, abs)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", fmt.Errorf("%s is outside the folder being worked on", p)
	}
	return abs, nil
}
