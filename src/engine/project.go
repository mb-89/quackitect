package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
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
	Name        string            `json:"name"`
	Target      string            `json:"target"`  // under the work root
	Sources     []string          `json:"sources"` // under the method root
	Wrap        string            `json:"wrap"`    // markdown, frontmatter, or none
	Frontmatter map[string]string `json:"frontmatter,omitempty"`
}

type projectionFile struct {
	Projections []Projection `json:"projections"`
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
		body, err := assemble(roots.Method, p.Sources, vars)
		if err != nil {
			return written, fmt.Errorf("%s: %w", p.Name, err)
		}
		out, err := wrap(p, body)
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
func variables(roots Roots) (map[string]string, error) {
	exe, err := os.Executable()
	if err != nil {
		return nil, err
	}
	return map[string]string{
		"engine": filepath.ToSlash(exe),
		"method": filepath.ToSlash(roots.Method),
		"work":   filepath.ToSlash(roots.Work),
	}, nil
}

func assemble(methodRoot string, sources []string, vars map[string]string) (string, error) {
	var b strings.Builder
	for i, name := range sources {
		raw, err := os.ReadFile(filepath.Join(methodRoot, filepath.FromSlash(name)))
		if err != nil {
			return "", fmt.Errorf("a source is missing: %w", err)
		}
		if i > 0 {
			b.WriteString("\n")
		}
		b.WriteString(strings.TrimSpace(expand(string(raw), vars)))
		b.WriteString("\n")
	}
	return b.String(), nil
}

func expand(s string, vars map[string]string) string {
	for k, v := range vars {
		s = strings.ReplaceAll(s, "{{"+k+"}}", v)
	}
	return s
}

// Each format says it is generated in its own comment syntax. It is the first
// line a person sees when they open the wrong file.
func wrap(p Projection, body string) (string, error) {
	mark := generatedMark + " Source: " + strings.Join(p.Sources, ", ")
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
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return false, err
	}
	return true, os.WriteFile(path, []byte(content), 0o644)
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
		if sameFile(abs, dest) {
			return true, filepath.Join(roots.Method, filepath.FromSlash(p.Sources[0]))
		}
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
