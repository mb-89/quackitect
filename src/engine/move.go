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
	sourceFormats = []string{".go", ".ts", ".tsx", ".js", ".mjs", ".json", ".ps1", ".py", ".yml", ".yaml",
		// A SHELL SCRIPT NAMES PATHS AND NOTHING ELSE. The battery that runs
		// every check named the folder six times and a rename left every one of
		// them pointing at a folder that no longer exists.
		".sh", ".bash", ".cmd", ".bat", ".toml", ".ini", ".cfg", ".css", ".html", ".mod"}
)

// A FILE NAMED RATHER THAN EXTENDED IS STILL A FILE THAT NAMES PATHS.
//
// .gitignore named five paths under src/. The verb read it, swept it,
// reported it unrewritten and left it, because a file with no extension was in
// neither list. The one file in the tree whose whole job is naming paths was
// the one file a rename could not repair.
//
// THEY TAKE THE PATH FORM ONLY, like source, because a wiki spelling means
// nothing in a list of paths.
var namedFiles = []string{
	".gitignore", ".rgignore", ".gitattributes", ".dockerignore",
	".npmignore", ".eslintignore", ".prettierignore", ".editorconfig",
}

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

	// A REWRITE THAT COULD NOT BE WRITTEN IS ANSWERED, NOT SWALLOWED. It was
	// neither counted as rewritten nor as left, so a read-only file kept its
	// old reference and the verb answered as though nothing were owed there.
	Unwritten []Residual `json:"unwritten,omitempty"`
}

type refPair struct {
	old, new  string
	proseOnly bool

	// A NAME THE REWRITE DECLINED, REPORTED ANYWAY. A top-level folder's bare
	// name is an English word, so the rewrite leaves it alone. The caller still
	// owes every place somebody wrote it as a path, and this says so without
	// editing it.
	segment bool

	// A FOLDER'S SPELLING ENDS AT ITS SEPARATOR AND A WORD FOLLOWS IT. The
	// rule that stops doc/old.md matching inside doc/old.mdx looks at the
	// character after the match and refuses a letter, which is every path
	// under a folder. So a prefix says not to ask.
	prefix bool
}

func refPairs(from, to string, dir bool) []refPair {
	// A DIRECTORY IS SPELLED WITH ITS SEPARATOR, so src/engine changes and
	// the English word source does not. Without it a rename of a folder called
	// source would edit every sentence about a source.
	if dir {
		pairs := []refPair{{old: from + "/", new: to + "/", prefix: true}}
		// THE COMMONEST WAY A FOLDER IS NAMED HAS NOTHING AFTER IT. Go test in
		// src/engine, and "go": "src/engine" in a config. The slashed
		// spelling alone repaired the paths under a folder and left every
		// sentence naming the folder pointing at one that no longer exists.
		//
		// NOT FOR A TOP-LEVEL FOLDER, and that is a decision rather than an
		// oversight: there the bare name is an English word, and leaving a
		// sentence about a source alone is the rule this verb is built on. A
		// nested folder's name carries its parent, so it is a path and not a
		// word.
		//
		// The ordinary rule then applies to the bare pair: src/engine
		// followed by a space, a quote or the end of a line is rewritten, and
		// src/engineering is refused because a letter follows.
		if strings.Contains(from, "/") {
			pairs = append(pairs, refPair{old: from, new: to})
		}
		return pairs
	}
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

// declinedPairs answers the spellings the rewrite refuses and the report keeps.
//
// FOR A TOP-LEVEL FOLDER THAT IS ITS BARE NAME. There the name is an English
// word, and rewriting it would edit every sentence about a source, which is the
// rule this verb is built on. It is still a path where somebody wrote it as
// one, and a caller told nothing about those finds them when the suite goes
// red.
func declinedPairs(from, to string, dir bool) []refPair {
	if !dir || strings.Contains(from, "/") {
		return nil
	}
	return []refPair{{old: from, new: to, segment: true}}
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
	// A DIRECTORY MOVES LIKE A FILE. It refused one, saying to move its files
	// one at a time, and a folder of a hundred files is not a hundred moves: it
	// is a loop somebody writes by hand every time, which is what this verb
	// exists to replace.
	//
	// The rewrite is a text substitution over the whole tree, and a directory
	// prefix substitutes as well as a file path does. What changes is which
	// spelling is looked for, and refPairs decides that.
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

	// A PATH WRITTEN OUT IN FULL IS THE SAME PATH. A slash on the left is part
	// of a name, because vendor/doc/old.md is a different file from doc/old.md.
	// Under the folder being worked on it is not: this folder's own path with
	// the old name after it is exactly the thing being renamed.
	root := filepath.ToSlash(r.Work) + "/"
	pairs := refPairs(fromRel, toRel, st.IsDir())
	for _, p := range refPairs(root+fromRel, root+toRel, st.IsDir()) {
		if !p.proseOnly {
			pairs = append(pairs, p)
		}
	}
	// LONGEST FIRST, so the short spelling never eats the front of the long one.
	sort.SliceStable(pairs, func(i, j int) bool { return len(pairs[i].old) > len(pairs[j].old) })
	var sourceOnly []refPair
	for _, p := range pairs {
		if !p.proseOnly {
			sourceOnly = append(sourceOnly, p)
		}
	}
	declined := declinedPairs(fromRel, toRel, st.IsDir())

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
		case endsWithAny(name, sourceFormats), isNamed(name):
			use = sourceOnly
		}
		if len(use) > 0 {
			after, n := applyPairs(text, use)
			if n > 0 && after != text {
				if err := writeAtomic(abs, []byte(after), 0o644); err == nil {
					out.Rewritten = append(out.Rewritten, Rewritten{Path: rel, Count: n})
					text = after
				} else {
					out.Unwritten = append(out.Unwritten, Residual{Path: rel, Text: err.Error()})
				}
			}
		}
		// EVERY FILE IS SWEPT BY EVERY SPELLING, whatever its format. What the
		// pass could not reach is the whole point of the report.
		//
		// Asking with the narrowed spelling alone meant it could not see what
		// that spelling skipped, and the verb answered zero unrewritten while
		// leaving two. Asking only in files it rewrites meant a format it does
		// not read kept its reference and nothing said so, which is the same
		// silence one step further out.
		sweep := use
		if len(sweep) == 0 {
			sweep = sourceOnly
		}
		// AND BY THE SPELLING THE REWRITE DECLINED. The rewrite asks may I
		// change this. The report asks does the caller still owe something
		// here. They are different questions, and asking the second with the
		// first one's spellings is how seven files were left naming a folder
		// that no longer existed while the verb answered zero.
		sweep = append(append([]refPair{}, sweep...), declined...)
		for _, look := range sweep {
			for _, h := range residualHits(text, look.old, look.new, look.prefix, look.segment) {
				out.UnrewritN++
				if len(out.Unrewrit) < residualLimit {
					out.Unrewrit = append(out.Unrewrit, Residual{Path: rel, Line: h.Line, Text: h.Text})
				}
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
	// A LINE MAY SAY IT IS NOT A PATH. A rename over the whole tree rewrote the
	// fixtures of the verb doing the renaming: the test saying that moving
	// source to src turns src/engine into src/engine had both halves of that
	// sentence rewritten and stopped meaning anything.
	//
	// One spelling can mean two things, and saying so on the line is how they
	// are told apart. It is the escape the glyph guard already uses.
	if strings.Contains(text, noPathsHere) {
		return text, 0
	}
	lines := strings.Split(text, nl)
	n := 0
	for i, line := range lines {
		if strings.Contains(line, notAPath) {
			continue
		}
		after, k := applyToLine(line, pairs)
		lines[i], n = after, n+k
	}
	return strings.Join(lines, nl), n
}

// What a line says when the words on it are not a reference to be repaired.
const notAPath = "not a path"

// AND WHAT A WHOLE FILE SAYS. A file about renaming is a file whose every path
// is a fixture, and marking them one line at a time is how one gets missed.
// The file says it once, at the top, and nothing in it is rewritten.
const noPathsHere = "every path in this file is a fixture"

func applyToLine(text string, pairs []refPair) (string, int) {
	n := 0
	for _, p := range pairs {
		var b strings.Builder
		at := 0
		for _, i := range every(text, p.old) {
			if i < at {
				continue
			}
			end := i + len(p.old)
			if runsOn(text, i, end, p.prefix) {
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

// asAPath answers whether a bare name was written where a path goes.
func asAPath(line string, at, end int) bool {
	edge := func(c byte) bool {
		return c == '"' || c == 39 || c == '`' || c == '/' || c == 92
	}
	return at > 0 && edge(line[at-1]) && end < len(line) && edge(line[end])
}

// residualHits finds the old path where it survived, and skips the ones that
// are only there because they are part of the new path.
//
// THAT EXCLUSION IS WHAT MAKES THIS USABLE. A move into a subdirectory leaves
// the old path as a literal substring of every path it just rewrote.
func residualHits(text, from, to string, prefix, segment bool) []Residual {
	var out []Residual
	if strings.Contains(text, noPathsHere) {
		return nil
	}
	for i, line := range strings.Split(text, "\n") {
		if !strings.Contains(line, from) || strings.Contains(line, notAPath) {
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
			if inside || runsOn(line, at, end, prefix) {
				continue
			}
			// A BARE NAME IS REPORTED ONLY WHERE IT WAS WRITTEN AS A PATH. A
			// quote or a separator on both sides is what a path segment looks
			// like in join(root, "source", "engine"), and it is not what a
			// sentence about a source looks like.
			if segment && !asAPath(line, at, end) {
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
func runsOn(line string, at, end int, prefix bool) bool {
	if at > 0 {
		c := line[at-1]
		if wordish.MatchString(string(c)) || c == '_' || c == '.' || c == '-' || c == '/' {
			return true
		}
	}
	// A PREFIX IS MEANT TO BE FOLLOWED BY A WORD. Asking would refuse every
	// path under the folder, which is all of them.
	if prefix {
		return false
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

func isNamed(name string) bool {
	for _, n := range namedFiles {
		if name == n {
			return true
		}
	}
	return false
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
	_ = filepath.WalkDir(root, func(abs string, d os.DirEntry, err error) error { // a walk that cannot finish answers what it found
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
