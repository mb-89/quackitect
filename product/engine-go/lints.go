package main

// design: go-spec-lints  implements: req-external-links, req-residue-lint, req-anchor-refers
// Three spec-content lints (owner walk 2026-07-05), all over the node-fenced sources plus
// the content notes - evidence docs are history and stay exempt:
// - external links: an http(s) URL may live ONLY inside a reference note (spec/references);
//   the body links the note, the fundamentals chapter derives the list (the pull law).
// - slot residue: an unfilled {{slot}} placeholder means an undrafted unit shipped. Fill
//   comments are permanent authoring guidance and are NOT residue.
// - dangling anchors: a refers entry keyed to a heading (id#slug) must resolve - heading
//   slugs are the stable referents rationale notes key to; a renamed heading must not
//   silently orphan its rationales. Plain-id refers ride the normal ref integrity.

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var externalLinkRe = regexp.MustCompile(`https?://`)
var slotRe = regexp.MustCompile(`\{\{[^}]*\}\}`)

// headingSlug mirrors the template convention: lower-case, spaces to dashes, alnum+dash only.
func headingSlug(h string) string {
	h = strings.ToLower(strings.TrimSpace(h))
	var b strings.Builder
	dash := false
	for _, r := range h {
		switch {
		case r >= 'a' && r <= 'z' || r >= '0' && r <= '9':
			b.WriteRune(r)
			dash = false
		case !dash && b.Len() > 0:
			b.WriteByte('-')
			dash = true
		}
	}
	return strings.TrimSuffix(b.String(), "-")
}

// fileHeadingSlugs collects the heading slugs of one markdown file's body.
func fileHeadingSlugs(path string) map[string]bool {
	out := map[string]bool{}
	raw, err := os.ReadFile(path)
	if err != nil {
		return out
	}
	for _, line := range strings.Split(string(raw), "\n") {
		t := strings.TrimSpace(line)
		if strings.HasPrefix(t, "#") {
			out[headingSlug(strings.TrimLeft(t, "# "))] = true
		}
	}
	return out
}

// specLintFindings runs the three lints over the workspace. All three are fatal.
func specLintFindings(nodes map[string]Node) (external, residue, anchors []string) {
	return specLintFindingsAt(SPEC, nodes)
}

func specLintFindingsAt(specDir string, nodes map[string]Node) (external, residue, anchors []string) {
	// the scan set: node-fenced spec files + content notes except references
	var paths []string
	filepath.Walk(specDir, func(path string, fi os.FileInfo, err error) error {
		if err != nil || fi.IsDir() || !strings.HasSuffix(path, ".md") {
			return nil
		}
		rel, _ := filepath.Rel(specDir, path)
		seg := strings.SplitN(filepath.ToSlash(rel), "/", 2)[0]
		if seg == "references" {
			return nil // the ONLY legal home for an external link
		}
		if specContentDirs[seg] {
			paths = append(paths, path) // glossary, fundamentals, methods: scanned
			return nil
		}
		if raw, e := os.ReadFile(path); e == nil && nodeFence(raw) {
			paths = append(paths, path) // nodes and manifests; evidence docs stay exempt
		}
		return nil
	})
	sortStrings(paths)
	for _, p := range paths {
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		rel, _ := filepath.Rel(specDir, p)
		txt := string(raw)
		if externalLinkRe.MatchString(txt) {
			external = append(external, filepath.ToSlash(rel)+": external link outside a reference note (wrap it: spec/references)")
		}
		if m := slotRe.FindString(txt); m != "" {
			residue = append(residue, filepath.ToSlash(rel)+": unfilled slot "+m)
		}
	}
	// dangling heading anchors: refers entries of the form id#slug
	var ids []string
	for id := range nodes {
		ids = append(ids, id)
	}
	sortStrings(ids)
	for _, id := range ids {
		n := nodes[id]
		for _, r := range n.Refers {
			kv := strings.SplitN(r, "#", 2)
			target, ok := nodes[kv[0]]
			if !ok {
				anchors = append(anchors, id+" refers to '"+kv[0]+"' (no such node)")
				continue
			}
			if len(kv) == 2 && !fileHeadingSlugs(target.Path)[kv[1]] {
				anchors = append(anchors, id+" refers to '"+r+"' - no heading with that slug (renamed?)")
			}
		}
	}
	return external, residue, anchors
}

// enddesign
