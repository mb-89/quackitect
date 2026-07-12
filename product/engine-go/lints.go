package main

// design: go-spec-lints  implements: req-spec-content-lint.3, req-spec-content-lint.4, req-spec-content-lint.1
// Three spec-content lints, all over the node-fenced sources plus
// the content notes - evidence docs are history and stay exempt:
// - external links: an http(s) URL may live ONLY inside a reference note (spec/references);
//   the body links the note, the fundamentals chapter derives the list (the pull law).
//   ONE narrow exemption: a DECK manifest may carry the repo's OWN clone URL (the git
//   origin remote, with or without .git) - the owner's self-containment rule: a walkthrough
//   deck is a hand-out, and its get-it slide must carry the clone line verbatim, not a
//   pointer to a pointer. Any OTHER external link in a deck still flags. An xmlns
//   namespace declaration (authored inline SVG, the figures law) is an identifier,
//   not a link, and never counts.
// - slot residue: an unfilled {{slot}} placeholder means an undrafted unit shipped. Fill
//   comments are permanent authoring guidance and are NOT residue.
// - dangling anchors: a refers entry keyed to a heading (id#slug) must resolve - heading
//   slugs are the stable referents rationale notes key to; a renamed heading must not
//   silently orphan its rationales. Plain-id refers ride the normal ref integrity.

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

var externalLinkRe = regexp.MustCompile(`https?://`)
var slotRe = regexp.MustCompile(`\{\{[^}]*\}\}`)
var deckModeRe = regexp.MustCompile(`(?m)^mode:\s*deck\s*$`)

// xmlnsRe: an XML namespace declaration is an IDENTIFIER, never a link. Authored
// inline SVG is sanctioned spec content (the figures law), so its xmlns attributes
// must not trip the external-link lint.
var xmlnsRe = regexp.MustCompile(`\bxmlns(?::[a-z]+)?="https?://[^"]*"`)

// ownCloneVariants lists the workspace's own clone-URL spellings (origin remote base,
// longest first so replacement never leaves a partial). A non-http(s) or absent remote
// yields none - the exemption simply never applies.
func ownCloneVariants(repoDir string) []string {
	r := strings.TrimSpace(originRemoteURL(repoDir))
	if !strings.HasPrefix(r, "https://") && !strings.HasPrefix(r, "http://") {
		return nil
	}
	base := strings.TrimSuffix(strings.TrimSuffix(r, "/"), ".git")
	return []string{base + ".git", base + "/", base}
}

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
	cloneVars := ownCloneVariants(filepath.Dir(specDir))
	for _, p := range paths {
		raw, err := os.ReadFile(p)
		if err != nil {
			continue
		}
		rel, _ := filepath.Rel(specDir, p)
		txt := string(raw)
		probe := xmlnsRe.ReplaceAllString(txt, "") // namespace ids are not links
		if len(cloneVars) > 0 && deckModeRe.MatchString(txt) {
			// a deck manifest: the repo's own clone URL is the one legal carry
			for _, v := range cloneVars {
				probe = strings.ReplaceAll(probe, v, "")
			}
		}
		if externalLinkRe.MatchString(probe) {
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

// design: go-terms-order-lint  implements: req-terms-before-use.1, req-terms-before-use.2, req-terms-before-use.3
// The terms-before-use ADVISORY: the rendered book's reading order (readerChapters — the
// SAME chapter list the renderer walks) is scanned for glossary-term uses that precede the
// term's definition point. The glossary IS the term set (adr-terms-source-glossary): the
// function takes the renderer's own glossary map and consults no second list, so the check
// follows the glossary's growth. The definition point is where the renderer splices the
// glossary — the end of the fundamentals chapter, or the book end when no fundamentals
// chapter exists. Matching mirrors go-auto-link's discipline: word boundaries,
// case-insensitive, the LONGEST name wins a position (aliases count as the term's names);
// code fences, headings, comment lines, inline code, and link targets are exempt. One
// finding per term — the FIRST use — naming the using and the defining location. Reading
// order is judgment: the class is advisory (termOrderBlocking pins it) and never blocks.

// fundamentalsChapterID names the chapter the glossary splices into — one fact,
// shared by the renderer's splice and this lint's definition point.
const fundamentalsChapterID = "man-ch2-fundamentals"

// termOrderBlocking is the lane's contribution to lint's blocking count: always zero.
// A term-order finding informs the author (req-terms-before-use.3); the selftest pins
// this class — making the lane blocking must break selftest:terms-before-use first.
func termOrderBlocking(_ []string) int { return 0 }

// termLinkTargetRe drops markdown link/embed targets; the label text stays a use.
var termLinkTargetRe = regexp.MustCompile(`\]\([^)]*\)`)

// termInlineCodeRe drops inline code spans (go-auto-link's protected spans).
var termInlineCodeRe = regexp.MustCompile("`[^`]*`")

func termOrderFindings(nodes map[string]Node, gloss map[string]GlossTerm) []string {
	if len(gloss) == 0 {
		return nil
	}
	chapters, _ := readerChapters(nodes)
	if len(chapters) == 0 {
		return nil
	}
	defIdx := len(chapters) - 1 // no fundamentals chapter: the glossary lands at the book end
	defLoc := "the glossary at the book end"
	for i, ch := range chapters {
		if ch.ID == fundamentalsChapterID {
			defIdx = i
			defLoc = "the glossary at the end of " + fundamentalsChapterID
		}
	}
	type nameEntry struct{ name, slug string }
	var names []nameEntry
	for slug, t := range gloss {
		for _, n := range append([]string{t.Term}, t.Aliases...) {
			if strings.TrimSpace(n) != "" {
				names = append(names, nameEntry{n, slug})
			}
		}
	}
	sort.Slice(names, func(a, b int) bool {
		if len(names[a].name) != len(names[b].name) {
			return len(names[a].name) > len(names[b].name) // the longest name wins a position
		}
		return names[a].name < names[b].name
	})
	res := make([]*regexp.Regexp, len(names))
	for i, n := range names {
		res[i] = regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(n.name) + `\b`)
	}
	// walk the reading order UP TO the definition point; the first hit per term wins.
	firstUse := map[string]string{}
	for ci := 0; ci <= defIdx && ci < len(chapters); ci++ {
		ch := chapters[ci]
		units := parseManifestUnits(manifestBody(ch.Path))
		for ui, u := range units {
			if u.Body == "" {
				continue
			}
			loc := ch.ID + "-u" + itoa(ui+1)
			inFence, inComment := false, false
			for _, line := range strings.Split(u.Body, "\n") {
				t := strings.TrimSpace(line)
				if inComment {
					if strings.Contains(t, "-->") {
						inComment = false
					}
					continue
				}
				if strings.HasPrefix(t, "```") {
					inFence = !inFence
					continue
				}
				if strings.HasPrefix(t, "<!--") {
					if !strings.Contains(t, "-->") {
						inComment = true
					}
					continue
				}
				if inFence || strings.HasPrefix(t, "#") {
					continue // code, headings, and comments stay exempt (go-auto-link)
				}
				prose := termInlineCodeRe.ReplaceAllString(line, " ")
				prose = termLinkTargetRe.ReplaceAllString(prose, "] ")
				var claimed [][]int
				overlaps := func(a, b int) bool {
					for _, c := range claimed {
						if a < c[1] && b > c[0] {
							return true
						}
					}
					return false
				}
				for i, n := range names {
					for _, m := range res[i].FindAllStringIndex(prose, -1) {
						if overlaps(m[0], m[1]) {
							continue // a longer name already owns this span
						}
						claimed = append(claimed, m)
						if _, seen := firstUse[n.slug]; !seen {
							firstUse[n.slug] = loc
						}
					}
				}
			}
		}
	}
	var out []string
	for slug, loc := range firstUse {
		out = append(out, "term '"+gloss[slug].Term+"' ("+slug+") is used at "+loc+" before its definition ("+defLoc+")")
	}
	sortStrings(out)
	return out
}

// enddesign
