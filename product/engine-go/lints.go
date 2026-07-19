package main

// design: go-spec-lints  implements: req-spec-content-lint.3, req-spec-content-lint.4, req-spec-content-lint.1
// There are three spec-content lints, all over the node-fenced sources plus the content notes; evidence docs are history and stay exempt. The first is external links. An http(s) URL may live ONLY inside a reference note (spec/references). The body links the note, and the fundamentals chapter derives the list, the pull law. ONE narrow exemption applies: a DECK manifest may carry the repo's OWN clone URL, the git origin remote, with or without .git. This is the owner's self-containment rule. A walkthrough deck is a hand-out, and its get-it slide must carry the clone line verbatim, not a pointer to a pointer. Any OTHER external link in a deck still flags. An xmlns namespace declaration, authored inline SVG, the figures law, is an identifier, not a link, and never counts. The second is slot residue. An unfilled {{slot}} placeholder means an undrafted unit shipped. Fill comments are permanent authoring guidance and are NOT residue. The third is dangling anchors. A refers entry keyed to a heading (id#slug) must resolve. Heading slugs are the stable referents rationale notes key to, and a renamed heading must not silently orphan its rationales. Plain-id refers ride the normal ref integrity.

import (
	"fmt"
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

// design: go-terms-order-lint  implements: req-terms-before-use.1, req-terms-before-use.2, req-terms-before-use.3, req-terms-readme-scope, req-jargon-advisory
// This is the terms-before-use ADVISORY. The rendered book's reading order, readerChapters, the SAME chapter list the renderer walks, is scanned for glossary-term uses that precede the term's definition point. The glossary IS the term set (adr-terms-source-glossary). The function takes the renderer's own glossary map and consults no second list, so the check follows the glossary's growth. The definition point is where the renderer splices the glossary: the end of the fundamentals chapter, or the book end when no fundamentals chapter exists. Matching mirrors go-auto-link's discipline: word boundaries, case-insensitive, and the LONGEST name wins a position, with aliases counting as the term's names. Code fences, headings, comment lines, inline code, and link targets are exempt. One finding appears per term, the FIRST use, naming the using and the defining location. Reading order is judgment. The class is advisory (termOrderBlocking pins it) and never blocks.

// fundamentalsChapterID names the chapter the glossary splices into — one fact,
// shared by the renderer's splice and this lint's definition point.
const fundamentalsChapterID = "man-fundamentals"

// termOrderBlocking is the lane's contribution to lint's blocking count: always zero.
// A term-order finding informs the author (req-terms-before-use.3); the selftest pins
// this class — making the lane blocking must break selftest:terms-before-use first.
func termOrderBlocking(_ []string) int { return 0 }

// termLinkTargetRe drops markdown link/embed targets; the label text stays a use.
var termLinkTargetRe = regexp.MustCompile(`\]\([^)]*\)`)

// termInlineCodeRe drops inline code spans (go-auto-link's protected spans).
var termInlineCodeRe = regexp.MustCompile("`[^`]*`")

func termOrderFindings(nodes map[string]Node, gloss map[string]GlossTerm) []string {
	// RETIRED (owner cleanup order 2026-07-16, the superseding decision on
	// req-terms-before-use): every glossary term renders as a termref whose toast
	// carries the full definition, so the definition travels WITH the word and
	// reading order stopped mattering. The jargon lane still catches unregistered
	// terms; the README rule still guards the front door.
	return nil
}

func termOrderFindingsRetired(nodes map[string]Node, gloss map[string]GlossTerm) []string {
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

// The README extension (req-terms-readme-scope): the README is the FIRST document of
// the reading order and the one surface the manifest walk cannot reach (owner law:
// entry documents carry no bare method jargon). A glossary-term use in the README is
// fine when LINKED (its definition is one click away); a BARE use is a finding. Same
// span discipline as the chapter walk, but linked spans drop WHOLE (label included) -
// the link is exactly what legalizes the term. Advisory, like every terms lane.
var termLinkWholeRe = regexp.MustCompile(`\[[^\]]*\]\([^)]*\)`)

func readmeTermFindings(readmePath string, gloss map[string]GlossTerm) []string {
	raw, err := os.ReadFile(readmePath)
	if err != nil || len(gloss) == 0 {
		return nil
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
			return len(names[a].name) > len(names[b].name)
		}
		return names[a].name < names[b].name
	})
	// define-before-use, README edition: the term's FIRST occurrence decides. A linked
	// first use puts the definition one click away, so later plain uses read fine (the
	// same reason a paper defines a term once). A bare first use is the finding.
	var proseB strings.Builder
	inFence, inComment := false, false
	for _, line := range strings.Split(string(raw), "\n") {
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
			continue
		}
		proseB.WriteString(termInlineCodeRe.ReplaceAllString(line, " ") + "\n")
	}
	text := proseB.String()
	linkSpans := termLinkWholeRe.FindAllStringIndex(text, -1)
	inLink := func(a, b int) bool {
		for _, s := range linkSpans {
			if a >= s[0] && b <= s[1] {
				return true
			}
		}
		return false
	}
	firstBare := map[string]bool{}
	for _, n := range names {
		if _, done := firstBare[n.slug]; done {
			continue
		}
		if m := regexp.MustCompile(`(?i)\b` + regexp.QuoteMeta(n.name) + `\b`).FindStringIndex(text); m != nil {
			firstBare[n.slug] = !inLink(m[0], m[1])
		}
	}
	var out []string
	for slug, bare := range firstBare {
		if bare {
			out = append(out, "term '"+gloss[slug].Term+"' ("+slug+") is used BARE in the README before any linked use - link the first use or reword")
		}
	}
	sortStrings(out)
	return out
}

// design: go-rigor-fit  implements: req-rigor-fit
// This is the rigor-fit advisory. It compares the ACTIVE iteration's composed trace size against the rigor's fit band (fit_min/fit_max in the rigor definition; the band lives with the rigor, one home). Below the band reads as ceremony overkill, and above reads as a rigor too thin. It is advisory by law. The human confirms rigor at start (contract rule 5), and the engine only hints (req-rigor-fit.2).

func rigorFitBand(rigor string) (int, int) {
	raw, err := os.ReadFile(filepath.Join(EngineDir(), "method", "rigor", rigor, "rigor.md"))
	if err != nil {
		return 0, 0
	}
	lo, hi := 0, 0
	for _, line := range strings.Split(string(raw), "\n") {
		if k, v, ok := strings.Cut(line, ":"); ok {
			n := 0
			fmt.Sscanf(strings.TrimSpace(v), "%d", &n)
			switch strings.TrimSpace(k) {
			case "fit_min":
				lo = n
			case "fit_max":
				hi = n
			}
		}
	}
	return lo, hi
}

// rigorFitAdvisory is the pure rule: a composed count against a band.
func rigorFitAdvisory(count int, rigor string, lo, hi int) []string {
	switch {
	case lo > 0 && count < lo:
		return []string{fmt.Sprintf("rigor-fit: %d trace nodes composed under %s (fit band starts at %d) - the ceremony may be overkill for this size; the rigor stays the human's call", count, rigor, lo)}
	case hi > 0 && count > hi:
		return []string{fmt.Sprintf("rigor-fit: %d trace nodes composed under %s (fit band ends at %d) - the work may deserve a step up in rigor; the call stays human", count, rigor, hi)}
	}
	return nil
}

func rigorFitFindings(nodes map[string]Node) []string {
	cfg := readProjectConfig()
	if cfg.Version == "" || cfg.Rigor == "" {
		return nil
	}
	count := 0
	for _, n := range nodes {
		if iterOf(n.Path) != cfg.Version {
			continue
		}
		switch n.Type {
		case "requirement", "usecase", "test", "adr", "question", "model", "need":
			count++
		}
	}
	lo, hi := rigorFitBand(cfg.Rigor)
	return rigorFitAdvisory(count, cfg.Rigor, lo, hi)
}

// enddesign

// The jargon extension (req-jargon-advisory) pairs with the glossary's DRY law: the
// glossary IS the term set, so an unregistered term is invisible to every term lane
// by construction. This advisory catches the shape of the escape: an ALL-CAPS acronym
// (2-8 letters) in reader-facing prose that no glossary name covers. Emphasis caps
// self-calibrate away: a caps token whose lowercase form appears anywhere in the
// book's own prose (the vocab) is an emphasized WORD, never an acronym. Register the
// term or reword - the finding only points.
var jargonAcronymRe = regexp.MustCompile(`\b[A-Z][A-Z0-9]{1,7}\b`)
var jargonWordRe = regexp.MustCompile(`[a-z][a-z0-9-]*`)

// jargonVocab collects the lowercase word set of reader prose - the emphasis filter.
func jargonVocab(bodies []string) map[string]bool {
	v := map[string]bool{}
	for _, b := range bodies {
		for _, w := range jargonWordRe.FindAllString(b, -1) {
			v[w] = true
		}
	}
	return v
}

func jargonFindings(body, loc string, gloss map[string]GlossTerm, vocab map[string]bool) []string {
	known := map[string]bool{}
	for _, t := range gloss {
		for _, n := range append([]string{t.Term}, t.Aliases...) {
			for _, w := range strings.Fields(strings.ToUpper(n)) {
				known[w] = true
			}
		}
	}
	found := map[string]string{}
	inFence, inComment := false, false
	for _, line := range strings.Split(body, "\n") {
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
			continue
		}
		prose := termInlineCodeRe.ReplaceAllString(line, " ")
		prose = termLinkTargetRe.ReplaceAllString(prose, "] ")
		for _, m := range jargonAcronymRe.FindAllString(prose, -1) {
			if len(m) < 2 || known[m] || vocab[strings.ToLower(m)] {
				continue // glossary term, or an emphasized word the prose also writes small
			}
			if _, seen := found[m]; !seen {
				found[m] = loc
			}
		}
	}
	var out []string
	for tok, l := range found {
		out = append(out, "possible jargon '"+tok+"' at "+l+" is no glossary term - register it or reword")
	}
	sortStrings(out)
	return out
}

// enddesign
