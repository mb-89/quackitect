package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strings"
)

// PROJECTION IS ONE MECHANISM, not a feature of one file.
//
// Some files exist because another tool insists on them, in its own place and
// its own format. Each of those is a projection of something authored here.
// What is projected where is DATA, in util/projections.json, so adding one is
// an entry rather than a change to this file.
//
// The engine projects. Nobody copies by hand. A changed source projects again
// on its own, and a projection is output: editing it is editing something
// that will be written over.

const generatedMark = "GENERATED. Edit the source named below, not this file."

type Projection struct {
	Name    string   `json:"name"`
	Target  string   `json:"target"`  // under the work root
	Sources []string `json:"sources"` // under the method root

	// SourcesFrom names a folder instead of the files in it.
	//
	// A HAND-WRITTEN LIST GOES STALE. Parking two guidance files meant editing
	// this list in three places, and a list nobody edits is a projection that
	// assembles a file somebody moved. The folder answers instead.
	//
	// TOP LEVEL ONLY. Guidance in a subfolder is for one lane, and the
	// standing layer is paid for by every agent on every turn. A parked file
	// is skipped, which is what makes parking enough on its own.
	SourcesFrom string            `json:"sources_from,omitempty"`
	Wrap        string            `json:"wrap"` // markdown, frontmatter, or none
	Frontmatter map[string]string `json:"frontmatter,omitempty"`

	// The one chapter to take from each source, named by its heading. Empty
	// means the whole file.
	Section string `json:"section,omitempty"`

	// PREAMBLE GOES IN FRONT OF THE RULES, WHOLE.
	//
	// It is one file, taken entire rather than by chapter, because it is not
	// guidance: it says what the reader is looking at and what to do about
	// having read it. Guidance is what a person maintains and this is what the
	// projection needs said around it.
	Preamble string `json:"preamble,omitempty"`
}

type projectionFile struct {
	Projections []Projection `json:"projections"`
}

// sourcesOf answers the files a projection assembles, from the folder it named
// or from the list it wrote.
func sourcesOf(methodRoot string, p Projection) ([]string, error) {
	if p.SourcesFrom == "" {
		return p.Sources, nil
	}
	dir := filepath.Join(methodRoot, filepath.FromSlash(p.SourcesFrom))
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, fmt.Errorf("%s reads %s, which cannot be read: %w", p.Name, p.SourcesFrom, err)
	}
	var out []string
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || Parked(e.Name()) {
			continue
		}
		out = append(out, path.Join(p.SourcesFrom, e.Name()))
	}
	sort.Strings(out)
	if len(out) == 0 {
		return nil, fmt.Errorf("%s reads %s and found nothing to assemble", p.Name, p.SourcesFrom)
	}
	return out, nil
}

func LoadProjections(methodRoot string) ([]Projection, error) {
	b, err := os.ReadFile(filepath.Join(methodRoot, "util", "projections.json"))
	if err != nil {
		// No declaration is not a failure. It means nothing is projected.
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, err
	}
	var f projectionFile
	if err := json.Unmarshal(b, &f); err != nil {
		return nil, fmt.Errorf("util/projections.json is not readable: %w", err)
	}
	return f.Projections, nil
}

// Project writes every projection that is not already correct. It is
// idempotent, and it returns only what it changed.
func Project(roots Roots) ([]string, error) {
	list, err := LoadProjections(roots.Method)
	if err != nil {
		return nil, err
	}
	vars, err := variables(roots)
	if err != nil {
		return nil, err
	}
	var written []string
	for _, p := range list {
		srcs, err := sourcesOf(roots.Method, p)
		if err != nil {
			return nil, err
		}
		body, err := assemble(roots.Method, srcs, p.Section, vars)
		if err != nil {
			return written, fmt.Errorf("%s: %w", p.Name, err)
		}
		if p.Preamble != "" {
			front, err := assemble(roots.Method, []string{p.Preamble}, "", vars)
			if err != nil {
				return written, fmt.Errorf("%s: %w", p.Name, err)
			}
			body = front + "\n" + body
		}
		out, err := wrap(p, srcs, body)
		if err != nil {
			return written, fmt.Errorf("%s: %w", p.Name, err)
		}
		dest := filepath.Join(roots.Work, filepath.FromSlash(p.Target))
		changed, err := writeIfDifferent(dest, out)
		if err != nil {
			return written, err
		}
		if changed {
			written = append(written, dest)
		}
	}
	return written, nil
}

// A source may name the engine or the roots, because a cage has to say which
// program the guards call. Nothing else is substituted.
//
// EVERY ONE OF THEM IS RELATIVE TO THE WORK ROOT WHEN IT CAN BE. A projection
// is a file in the work root, and some of them are in version control, so an
// absolute path in one is a path on one machine written into a file that
// travels to every other. It was right on the machine that wrote it and dead
// everywhere else.
//
// A path that leaves the work root stays absolute, because there is nothing
// else it could be. That is the driven case, where the method lives somewhere
// the project cannot name.
// THE ENGINE IS THE METHOD'S, and not whichever binary happens to be running.
// A cage names the program its guards call, and that program is the one the
// method root carries. Reading it from the running process made the cage
// depend on how the engine was started, and a copy run from somewhere else
// wrote a path that only that invocation could use.
func variables(roots Roots) (map[string]string, error) {
	// NO FILE EXTENSION, on either platform. The cage is in version control,
	// so it says one thing everywhere, and se.exe is not one thing everywhere.
	// The installer writes the program under both names for this.
	bin := filepath.Join(roots.Method, ".bin")
	return map[string]string{
		"engine": within(roots.Work, filepath.Join(bin, "se")),
		"mcp":    within(roots.Work, filepath.Join(bin, "se-mcp")),
		// THE TOOL LANE IS STARTED THROUGH A FILE GIT CARRIES, and never through
		// .bin. The harness spawns the MCP server before any hook can install
		// anything, so a fresh clone answered ENOENT and the session had no lane
		// and no door. See util/cage/mcp-lane.mjs.
		"mcplane": within(roots.Work, filepath.Join(roots.Method, "util", "cage", "mcp-lane.mjs")),
		// THE COMMAND HOOKS GO THE SAME WAY AND FOR THE SAME REASON. The cage
		// named .bin/se for the wake and for the start, and a clone carries no
		// .bin, so both were a path to nothing on the one box that needed them.
		"hooklane": within(roots.Work, filepath.Join(roots.Method, "util", "cage", "hook-lane.mjs")),
		"method":   within(roots.Work, roots.Method),
		"work":     within(roots.Work, roots.Work),
		// THE GUARD'S DOOR, derived from the work root, so the cage can name it
		// before an engine exists and every engine over this folder binds it.
		"hooks":        hooksURL(roots),
		"hook_timeout": fmt.Sprint(hookTimeoutSeconds),
	}, nil
}

// within says where something is, from the work root, in the shortest form
// that still finds it. The harness runs a hook and starts the tool lane with
// the work root as the working folder, so a relative path resolves.
func within(work, path string) string {
	rel, err := filepath.Rel(work, path)
	if err != nil || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return filepath.ToSlash(path)
	}
	if rel == "." {
		return "."
	}
	return "./" + filepath.ToSlash(rel)
}

// assemble joins the sources in order. With a section named, it takes only
// that chapter from each source, and a source without it is an error rather
// than a silent gap.
func assemble(methodRoot string, sources []string, section string, vars map[string]string) (string, error) {
	var b strings.Builder
	for i, name := range sources {
		raw, err := os.ReadFile(filepath.Join(methodRoot, filepath.FromSlash(name)))
		if err != nil {
			return "", fmt.Errorf("a source is missing: %w", err)
		}
		text := string(raw)
		if section != "" {
			only, found := chapter(text, section)
			if !found {
				return "", fmt.Errorf("%s has no chapter headed %q", name, section)
			}
			// The chapter is headed by the file it came from, so a reader of
			// three chapters in a row can tell which file each one belongs to.
			// The chapter sits under the name of the file it came from, so it
			// is demoted to level two whatever level it was written at.
			text = "# " + nameOf(name) + "\n\n" + shiftHeadings(only, 2)
		}
		if i > 0 {
			b.WriteString("\n")
		}
		b.WriteString(strings.TrimSpace(expand(text, vars)))
		b.WriteString("\n")
	}
	return b.String(), nil
}

// shiftHeadings rewrites a chapter so its own heading sits at the level given
// and everything under it keeps its distance.
func shiftHeadings(text string, to int) string {
	lines := strings.Split(text, "\n")
	first := 0
	for _, line := range lines {
		if d := headingDepth(line); d > 0 {
			first = d
			break
		}
	}
	if first == 0 || first == to {
		return text
	}
	by := to - first
	for i, line := range lines {
		d := headingDepth(line)
		if d == 0 {
			continue
		}
		level := d + by
		if level < 1 {
			level = 1
		}
		lines[i] = strings.Repeat("#", level) + line[d:]
	}
	return strings.Join(lines, "\n")
}

// nameOf is a source's name, which is its file name.
//
// IT IS THE FILE RATHER THAN A HEADING INSIDE IT. This read the first level-one
// heading, and a guidance file's chapters moved up to one hash, so every
// projection was headed "Motivation" and the reader could no longer tell which
// file a chapter came from.
func nameOf(source string) string {
	base := filepath.Base(filepath.FromSlash(source))
	base = strings.ReplaceAll(strings.TrimSuffix(base, filepath.Ext(base)), "-", " ")
	if base == "" {
		return base
	}
	return strings.ToUpper(base[:1]) + base[1:]
}

func expand(s string, vars map[string]string) string {
	for k, v := range vars {
		s = strings.ReplaceAll(s, "{{"+k+"}}", v)
	}
	return s
}

// Each format says it is generated in its own comment syntax. It is the first
// line a person sees when they open the wrong file.
// wrap puts the generated mark in front of the body, in the comment syntax the
// format has.
//
// IT IS HANDED THE SOURCES RATHER THAN READING THEM OFF THE PROJECTION. A
// projection that names a folder carries no list, so the mark read "Edit the
// source named below, not this file. Source:" and then named nothing, on the
// two files every agent is handed. What sourcesOf resolved is what is said.
func wrap(p Projection, sources []string, body string) (string, error) {
	said := sources
	if len(said) == 0 {
		said = p.Sources
	}
	mark := generatedMark + " Source: " + strings.Join(said, ", ")
	switch p.Wrap {
	case "markdown", "":
		return "<!-- " + mark + " -->\n\n" + body, nil
	case "frontmatter":
		var b strings.Builder
		b.WriteString("---\n")
		keys := make([]string, 0, len(p.Frontmatter))
		for k := range p.Frontmatter {
			keys = append(keys, k)
		}
		sort.Strings(keys)
		for _, k := range keys {
			b.WriteString(k + ": " + p.Frontmatter[k] + "\n")
		}
		b.WriteString("description: " + mark + "\n---\n\n")
		b.WriteString(body)
		return b.String(), nil
	case "none":
		// A format with no comment syntax, such as JSON. It carries the mark
		// inside itself, or not at all.
		return body, nil
	}
	return "", fmt.Errorf("no such wrapping: %q", p.Wrap)
}

func writeIfDifferent(path, content string) (bool, error) {
	if old, err := os.ReadFile(path); err == nil && string(old) == content {
		return false, nil
	}
	// A PROJECTION IS READ BY THE HARNESS WHILE IT IS WRITTEN. A truncating
	// write leaves a half-written cage for the length of the write, and a
	// harness that read it then ran with half its hooks.
	return true, writeAtomic(path, []byte(content), modeFor(path))
}

// A SHELL SCRIPT IS RUN, so it is written with the bit that lets it run.
// Seeding says the same thing about the same suffix, and one rule stated
// twice the same way is the rule holding in two places.
func modeFor(path string) os.FileMode {
	if strings.HasSuffix(path, ".sh") {
		return 0o755
	}
	return 0o644
}

// IsProjection says whether a path is one this engine writes, and where to
// write instead. The guard uses it: a write to a projection is the one
// refusal with no override.
func IsProjection(roots Roots, path string) (bool, string) {
	abs, err := filepath.Abs(path)
	if err != nil {
		return false, ""
	}
	list, err := LoadProjections(roots.Method)
	if err != nil {
		return false, ""
	}
	for _, p := range list {
		dest := filepath.Join(roots.Work, filepath.FromSlash(p.Target))
		if !sameFile(abs, dest) {
			continue
		}
		// WHERE TO WRITE INSTEAD IS THE FOLDER WHEN THE MAP NAMES ONE. A
		// projection assembled from a folder lists no source of its own, and
		// reading the first of an empty list took the guard down on the one
		// write it exists to refuse. The self-test found it.
		if p.SourcesFrom != "" {
			return true, filepath.Join(roots.Method, filepath.FromSlash(p.SourcesFrom))
		}
		if len(p.Sources) > 0 {
			return true, filepath.Join(roots.Method, filepath.FromSlash(p.Sources[0]))
		}
		return true, "the map in util/projections.json, which names no source for it"
	}
	return false, ""
}

func sameFile(a, b string) bool {
	if a == b {
		return true
	}
	// Windows compares paths without case, and both spellings of a separator
	// mean the same folder.
	return strings.EqualFold(filepath.Clean(a), filepath.Clean(b))
}

// GuidanceDigest is what change detection compares: the content of every
// source of every projection. A file written with the same bytes is not a
// change, and must not cost a rewrite of everything that reads it.
func GuidanceDigest(methodRoot string) (string, error) {
	list, err := LoadProjections(methodRoot)
	if err != nil {
		return "", err
	}
	seen := map[string]bool{}
	var names []string
	for _, p := range list {
		for _, s := range p.Sources {
			if !seen[s] {
				seen[s] = true
				names = append(names, s)
			}
		}
	}
	sort.Strings(names)
	h := sha256.New()
	for _, n := range names {
		b, err := os.ReadFile(filepath.Join(methodRoot, filepath.FromSlash(n)))
		if err != nil {
			return "", err
		}
		h.Write([]byte(n))
		h.Write(b)
	}
	return hex.EncodeToString(h.Sum(nil))[:16], nil
}
