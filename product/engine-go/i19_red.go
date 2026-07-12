package main

import (
	"context"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// i19_red.go — this iteration's checks, in battery order (selftestRegistry in
// selftest.go concatenates the per-file slices EXPLICITLY; this file owns i19Tests).

var i19Tests = []namedTest{
	{"deck-links", selftestDeckLinks},
	{"terms-before-use", selftestTermsBeforeUse},
	{"white-label-book", selftestWhiteLabelBook},
	{"runme-orientation", selftestRunmeOrientation},
	{"onboarding-surface", selftestOnboardingSurface},
	{"pong-deck", selftestPongDeck},
}

// selftest:deck-links — proves deck citizenship on a fixture book (test-deck-links;
// req-deck-links.1-3, req-deck-semantics.1-2). Static assertions over the emitted
// HTML/JS, the sibling pattern:
//   - anchor stability: the deck and slide ids derive from the manifest and appear
//     unchanged across two renders;
//   - reflection: present navigation writes the current slide's anchor with
//     history.replaceState through the __deckShown hook;
//   - jump: the hash rail routes a deck fragment into present mode on hashchange
//     AND on load (__deckJump wired in both places);
//   - semantics: the deck boundary is a named region landmark with the slideshow
//     roledescription; slides are named groups (heading text, ordinal fallback);
//     present mode lifts aria-hidden;
//   - toc: no deck reference inside the contents tree while the chapter stays;
//   - timeline: ticks mark slide STARTS and the bar ends AT the last slide's tick
//     (fixture Minutes 1, 2.5, 1.5 -> 0%, 28.6%, 100%); the 5-minute total is a
//     caption after the bar, so nothing can read as a step after the last slide;
//     a deck without minutes renders no timeline;
//   - embed: the fenced script bakes INERT inside its <template> wrapper, once,
//     and only the start button's new-Function lane executes it (the manual lane;
//     the auto lane is pinned beside the pong deck).
func selftestDeckLinks() bool {
	dir, err := os.MkdirTemp("", "q19dl")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	man := "---\nid: man-deck-fix\ntype: manifest\nmode: deck\nstatement: Fixture walkthrough.\n---\n" +
		"<!-- ai:3 -->\n# Opening moves\nThe fixture deck's first slide.\nNote: hello\nMinutes: 1\n---\n" +
		"[req-fix](req-fix.md)\nMinutes: 2.5\n---\n" +
		"<!-- ai:3 -->\nPress start to run the embedded example.\n\n```embed\nEMBEDPROBE();\n```\nMinutes: 1.5\n"
	mp := filepath.Join(dir, "man-deck-fix.md")
	os.WriteFile(mp, []byte(man), 0o644)
	fx["man-deck-fix"] = Node{ID: "man-deck-fix", Type: "manifest", Mode: "deck", Statement: "Fixture walkthrough.", Path: mp}
	bare := "---\nid: man-deck-bare\ntype: manifest\nmode: deck\nstatement: Bare deck.\n---\n<!-- ai:3 -->\nOne slide, no minutes.\n"
	bp := filepath.Join(dir, "man-deck-bare.md")
	os.WriteFile(bp, []byte(bare), 0o644)
	fx["man-deck-bare"] = Node{ID: "man-deck-bare", Type: "manifest", Mode: "deck", Statement: "Bare deck.", Path: bp}
	h1, findings, _ := renderBookHTML(fx)
	if len(findings) != 0 {
		return false
	}
	h2, _, _ := renderBookHTML(fx)
	// anchor stability: manifest-derived ids, identical across renders (req-deck-links.3)
	for _, want := range []string{`id="man-deck-fix"`, `id="man-deck-fix-s1"`, `id="man-deck-fix-s3"`} {
		if !strings.Contains(h1, want) || !strings.Contains(h2, want) {
			return false
		}
	}
	// reflection + jump wiring: the fragment rides the existing hash rail (req-deck-links.1, .2)
	for _, want := range []string{
		"history.replaceState(null,'','#'+s.id)",
		"if(window.__deckShown)window.__deckShown(slides[cur],cur)",
		"if(window.__deckJump&&window.__deckJump(el))return",
		"if(location.hash){var el=document.getElementById(location.hash.slice(1));if(el)window.__deckJump(el);else window.__facetJump(location.hash.slice(1));}",
		"d.removeAttribute('aria-hidden')",
	} {
		if !strings.Contains(h1, want) {
			return false
		}
	}
	// machine-legible deck boundary + named slides, never landmark soup (req-deck-semantics.1)
	if !strings.Contains(h1, `<article class="deck" id="man-deck-fix" role="region" aria-roledescription="slideshow" aria-label="Fixture walkthrough."`) {
		return false
	}
	if strings.Count(h1, `role="group" aria-roledescription="slide"`) != 4 {
		return false // three fixture slides + the bare deck's one, each a named group
	}
	if !strings.Contains(h1, `aria-label="Opening moves"`) || !strings.Contains(h1, `aria-label="slide 1 of 1"`) {
		return false // heading-named slide, ordinal fallback
	}
	// no deck in the contents tree; the chapter stays (req-deck-semantics.2)
	ti := strings.Index(h1, `<div id="toc">`)
	if ti < 0 {
		return false
	}
	te := strings.Index(h1[ti:], "</div>")
	if te < 0 {
		return false
	}
	toc := h1[ti : ti+te]
	if strings.Contains(toc, "man-deck-fix") || strings.Contains(toc, "man-deck-bare") || !strings.Contains(toc, "man-fix") {
		return false
	}
	// the timeline renders measured minutes: start ticks over [0, last start], the
	// bar's right edge AT the last tick, the honest total as a caption after the bar
	if strings.Count(h1, `class="deck-timeline"`) != 1 {
		return false // the minutes-carrying deck only; no timeline without measurements
	}
	for _, want := range []string{`left:0.0%`, `left:28.6%`, `left:100.0%`, `>5 min<`, "tl-tick"} {
		if !strings.Contains(h1, want) {
			return false
		}
	}
	// the embed defers: inert in its template, run only through the start lane
	if strings.Count(h1, "EMBEDPROBE") != 1 {
		return false
	}
	pi := strings.Index(h1, "EMBEDPROBE")
	tb := strings.Index(h1, `<template id="man-deck-fix-s3-e1">`)
	if tb < 0 {
		return false
	}
	teEnd := strings.Index(h1[tb:], "</template>")
	if teEnd < 0 || pi < tb || pi > tb+teEnd {
		return false // the script body lives inside the non-executed wrapper
	}
	return strings.Contains(h1, `data-embed="man-deck-fix-s3-e1"`) &&
		strings.Contains(h1, "button.embed-start") &&
		strings.Contains(h1, "new Function(h.content?h.content.textContent:h.textContent)()")
}

// selftest:terms-before-use — the reading-order term lint (test-terms-before-use,
// req-terms-before-use), bound statement by statement:
//  1. a term used BEFORE the glossary's definition point flags ONCE — the first use —
//     naming the term, the using location, and the defining location; decoy uses in
//     headings and code fences never count;
//  2. the glossary IS the term set: the lint takes the renderer's own glossary map
//     (readGlossary — no second list exists by construction), and a term added to the
//     glossary joins the check with no other registration;
//  3. the class is advisory: the lane's blocking contribution is pinned zero, so the
//     lint exit stays 0 when only term-order findings exist.
func selftestTermsBeforeUse() bool {
	dir, err := os.MkdirTemp("", "q19to")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	restore := glossFixture(dir) // widget + tokenprobe, the shared glossary fixture
	defer restore()
	write := func(id string, order int, body string) Node {
		p := filepath.Join(dir, id+".md")
		os.WriteFile(p, []byte("---\nid: "+id+"\ntype: manifest\nmode: chapter\norder: "+itoa(order)+"\nstatement: "+id+".\n---\n"+body), 0o644)
		return Node{ID: id, Type: "manifest", Mode: "chapter", Order: order, Statement: id + ".", Path: p}
	}
	early := "<!-- ai:3 -->\n# widget in a heading is exempt\n```\nwidget in a code fence is exempt\n```\nA widget appears before any definition.\n"
	fx := map[string]Node{}
	fx["man-ch1-fix"] = write("man-ch1-fix", 10, early)
	fx[fundamentalsChapterID] = write(fundamentalsChapterID, 20, "<!-- ai:3 -->\nThe fundamentals prose; the glossary splices at this chapter's end.\n")
	fx["man-ch3-fix"] = write("man-ch3-fix", 30, "<!-- ai:3 -->\nA widget after the definition point is legal.\n")
	f := termOrderFindings(fx, readGlossary())
	if len(f) != 1 {
		return false // one term, ONE finding — the first use only; the decoys stayed exempt
	}
	if !strings.Contains(f[0], "'widget'") || !strings.Contains(f[0], "man-ch1-fix-u1") || !strings.Contains(f[0], fundamentalsChapterID) {
		return false // the finding names the term, the using and the defining location
	}
	// definitions-first passes: the same book without the early use is clean.
	fx["man-ch1-fix"] = write("man-ch1-fix", 10, "<!-- ai:3 -->\nAn opening with no load-bearing vocabulary.\n")
	if len(termOrderFindings(fx, readGlossary())) != 0 {
		return false
	}
	// the glossary's growth is the check's growth: a NEW term, no other registration,
	// makes yesterday's clean prose flag — the same source feeds render and lint.
	os.WriteFile(filepath.Join(dir, "glossary", "vocabulary.md"),
		[]byte("---\nterm: vocabulary\nlong: the fixture vocabulary\nclass: domain\n---\n<!-- ai:3 -->\nGrown later.\n"), 0o644)
	grown := termOrderFindings(fx, readGlossary())
	hit := false
	for _, g := range grown {
		if strings.Contains(g, "'vocabulary'") && strings.Contains(g, "man-ch1-fix-u1") {
			hit = true
		}
	}
	if !hit {
		return false
	}
	// advisory by construction: the lane adds ZERO to the blocking count, whatever it finds.
	return termOrderBlocking(grown) == 0 && lintExitCode(false, termOrderBlocking(grown)) == 0
}

// selftest:white-label-book — a vehicle's book carries the VEHICLE's identity
// (test-white-label-book, req-vehicle-white-label), the i18 vehicle-chain pattern
// (hermetic home, subprocessed binary):
//  1. a fixture vehicle renders its book: title and wordmark carry the vehicle's
//     name, zero engine-identity leaks (statements 1, 2);
//  2. the colophon credits the engine by name (statement 3);
//  3. a PLANTED leak — the engine's name forced into the title — fails, named (statement 4);
//  4. the identity rule: the overlay's product/<name> names the book; no overlay key
//     falls to the workspace basename (the dogfood titles itself quackitect); the brand
//     name asset wins over both.
func selftestWhiteLabelBook() bool {
	tmp, err := os.MkdirTemp("", "qwlb")
	if err != nil {
		return false
	}
	defer os.RemoveAll(tmp)
	vehicle := filepath.Join(tmp, "vech")
	if initVehicleFiles(vehicle) != nil {
		return false
	}
	exe, err := os.Executable()
	if err != nil {
		return false
	}
	home := filepath.Join(tmp, "home")
	env := append(os.Environ(), "QUACK_RATCHETED=1", "LOCALAPPDATA="+home, "XDG_DATA_HOME="+home)
	ctx, cancel := context.WithTimeout(context.Background(), 50*time.Second)
	defer cancel()
	out := filepath.Join(tmp, "book.html")
	cmd := exec.CommandContext(ctx, exe, "--base", vehicle, "report", "book", "--out", out)
	cmd.Dir = vehicle
	cmd.Env = env
	if _, rerr := cmd.CombinedOutput(); rerr != nil {
		return false
	}
	raw, err := os.ReadFile(out)
	if err != nil {
		return false
	}
	html := string(raw)
	// the identity surfaces carry the vehicle's name, never the engine binary's
	if !strings.Contains(html, "<title>vech — the spec book</title>") ||
		!strings.Contains(html, ">vech — the spec book</button>") {
		return false
	}
	// the engine is CREDIT, not identity: the colophon names it — in every book
	if !strings.Contains(html, engineCredit) {
		return false
	}
	// the leak guard enumerates the identity surfaces: this book is clean
	if len(whiteLabelLeaks(html, "vech")) != 0 {
		return false
	}
	// a planted leak — the engine name forced into the title path — FAILS naming the leak
	planted := strings.Replace(html, "<title>vech — the spec book</title>", "<title>quack — the spec book</title>", 1)
	leaks := whiteLabelLeaks(planted, "vech")
	if len(leaks) != 1 || !strings.Contains(leaks[0], "title") || !strings.Contains(leaks[0], "quack") {
		return false
	}
	return productNameOf("", "product/vech", "x") == "vech" &&
		productNameOf("", "", "quackitect") == "quackitect" &&
		productNameOf("acme", "product/vech", "x") == "acme"
}

// selftest:runme-orientation — the one-click scripts install and verify, then ORIENT;
// they never create a workspace (test-runme-orientation, req-runme-orientation):
//  1. both scripts check before installing, install with a why, and verify the result;
//  2. both print the orientation epilogue — the no-workspace honesty line, the two
//     start options, the book pointer riding beside them in the same epilogue;
//  3. NEITHER executes a workspace-creating command: every `start stubs` occurrence is
//     orientation TEXT (an output line), never an invocation of the resolved binary.
//
// The ship summary's one-truth line is guarded here too, beside the zip-root story the
// RUNME scripts ride in (no dedicated ship selftest exists).
func selftestRunmeOrientation() bool {
	// ship prints ONE truth: the summary enumerates exactly what went in; a skipped
	// book is absent from the line, never claimed.
	if shipSummary("out/z.zip", []string{"report.html", "RUNME.ps1", "RUNME.sh"}) !=
		"shipped -> out/z.zip (report.html + RUNME.ps1 + RUNME.sh at the zip root)" {
		return false
	}
	if !strings.Contains(shipSummary("out/z.zip", nil), "product/ tree only") ||
		strings.Contains(shipSummary("out/z.zip", nil), "book.html") {
		return false
	}
	toolsDir := filepath.Join(ROOT, "tools")
	if _, err := os.Stat(filepath.Join(toolsDir, "RUNME.ps1")); err != nil {
		// the scripts live in the engine repo's tools/; a workspace without them has
		// nothing to check — but the engine repo missing them is a failure.
		return !isEngineRepo(ROOT)
	}
	outputPrefixes := []string{"Write-Info", "Write-Host", "echo", "info", "printf", "#"}
	for f, markers := range map[string][]string{
		"RUNME.ps1": {
			"checking for the Go toolchain",            // check before install
			"winget install --id GoLang.Go",            // the install lane
			"why:",                                     // every install line says why
			"& $QuackCmd version",                      // verify the bootstrapped binary
			"no workspace and no project were created", // the honesty line
			"Start your own project:",                  // the orientation epilogue
			"option A - open this folder with your AI agent",
			"option B - run:",
			"start stubs", // the user's next step, mentioned as text
		},
		"RUNME.sh": {
			"checking for the Go toolchain",
			"apt-get install -y golang-go",
			"why:",
			"\"$QBIN\" version",
			"no workspace and no project were created",
			"Start your own project:",
			"option A - open this folder with your AI agent",
			"option B - run:",
			"start stubs",
		},
	} {
		raw, err := os.ReadFile(filepath.Join(toolsDir, f))
		if err != nil {
			return false
		}
		s := string(raw)
		for _, m := range markers {
			if !strings.Contains(s, m) {
				return false
			}
		}
		// the text/invocation distinction, asserted precisely: every line carrying
		// `start stubs` is an output primitive, never a command execution.
		for _, line := range strings.Split(s, "\n") {
			if !strings.Contains(line, "start stubs") {
				continue
			}
			t := strings.TrimSpace(line)
			ok := false
			for _, p := range outputPrefixes {
				if strings.HasPrefix(t, p) {
					ok = true
				}
			}
			if !ok {
				return false
			}
		}
	}
	return true
}

// selftest:onboarding-surface — the whole onboarding surface over the ONE shared
// real-book render (test-onboarding-surface; req-onboarding-chapter.1-3,
// req-deck-discoverable.1-2). One test for the triangle: chapter, guides row, README:
//   - the fundamentals chapter carries the Onboarding section as its SECOND unit
//     (the x.2 section number on its own heading);
//   - the section links the deck by its anchor AND the guides table through the
//     audience-preset fragment (user,newcomer);
//   - the guides table carries the deck row, typed newcomer, its expand linking the
//     deck by the same anchor;
//   - the README links the deck at its Pages URL (derived from the origin remote,
//     never hardcoded — the white-label discipline);
//   - the in-book README render rewrites SELF-links (the workspace's own published
//     book URL) to their bare-fragment form, so they navigate in-document through
//     the existing rails (deck delegation included); the README FILE keeps the
//     absolute URL — both truths pinned;
//   - the facet-preset rail is in the emitted shell: the ONE router (__facetJump),
//     its hashchange delegation, and the multi-value pill setter it drives.
func selftestOnboardingSurface() bool {
	html, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	if !strings.Contains(html, `id="man-deck-pong"`) {
		// a vehicle's book carries its own content; only the dogfood must carry the deck
		return !isEngineRepo(ROOT)
	}
	// the onboarding section IS the second unit of the fundamentals chapter (x.2)
	u2 := strings.Index(html, `id="man-ch2-fundamentals-u2"`)
	u3 := strings.Index(html, `id="man-ch2-fundamentals-u3"`)
	if u2 < 0 || u3 < u2 {
		return false
	}
	sec := html[u2:u3]
	if !regexp.MustCompile(`<span class="secnum">[0-9]+\.2</span> Onboarding`).MatchString(sec) {
		return false
	}
	// the deck link by anchor, the guides link with the preset fragment (statements 2, 3)
	if !strings.Contains(sec, `data-goto="man-deck-pong"`) ||
		!strings.Contains(sec, `data-goto="guides-table--aud=user,newcomer"`) {
		return false
	}
	// the guides table's deck row: typed newcomer, the deck linked by anchor in the expand
	ri := strings.Index(html, `id="guide-pong-walkthrough-deck"`)
	if ri < 0 {
		return false
	}
	row := html[ri:]
	if n := strings.Index(row[1:], `<tr class="urow`); n >= 0 {
		row = row[:n+1]
	}
	if !strings.Contains(row, `data-aud="newcomer"`) || !strings.Contains(row, `data-goto="man-deck-pong"`) {
		return false
	}
	// the README's further-reading reference: the deck at its Pages URL, by anchor
	raw, err := os.ReadFile(filepath.Join(ROOT, "README.md"))
	if err != nil {
		return false
	}
	want := "book.html#man-deck-pong" // no origin remote: the anchor still binds
	selfURL, hasRemote := pagesBookURL(originRemoteURL(ROOT))
	if hasRemote {
		want = selfURL + "#man-deck-pong"
	}
	if !strings.Contains(string(raw), want) {
		return false
	}
	// the in-book README: the deck self-link rewrote to its fragment form — and the
	// tooltip pass then upgraded it to the click-model button whose data-goto rides
	// the rails (bookGoto delegates a deck target into present mode); the absolute
	// self-URL is gone from the rendered section (the file above keeps it)
	rdi := strings.Index(html, `<div class="readme"`)
	if rdi < 0 {
		return false
	}
	rdb := html[rdi:]
	if n := strings.Index(rdb, "</article>"); n >= 0 {
		rdb = rdb[:n]
	}
	if hasRemote {
		if !strings.Contains(rdb, `data-goto="man-deck-pong"`) ||
			strings.Contains(rdb, selfURL+"#man-deck-pong") {
			return false
		}
	}
	// the preset rail is in the shell: one router, wired into the rail's readers
	return strings.Contains(html, "window.__facetJump=function(frag)") &&
		strings.Contains(html, "else if(window.__facetJump)window.__facetJump(location.hash.slice(1))") &&
		strings.Contains(html, "ut.setFacetMulti=function(fn,fvs)")
}

// selftest:pong-deck — the walkthrough deck's content shape over the shared real
// book (test-pong-deck; req-pong-deck.1-5, the round-2 owner rulings):
//   - six slides, s1..s6 in outline order, no seventh;
//   - the arc beats in order: clone fence + verbatim starter prompt (s1), the one
//     console grant + the rigor-fit note (s2), the three requirements (s3), the
//     recorded decision (s4), ships-more-than-code with the PICTURED deliverable
//     (s5), the discussion + the playable embed (s6);
//   - the figure law: s2 carries the authored chat figure (aria-labelled — no book
//     figure exists for a chat); s3/s4 REUSE the book's own figures, id-scoped to
//     their slide (never hand-authored duplicates); s2/s3/s5 carry the "What to see
//     above:" caption; s4's caption is dropped (owner ruling 2026-07-12) — its
//     interactive onion instance speaks for itself;
//   - the prerequisites slide names what the RUNME scripts actually check: the
//     managers parsed from RUNME.sh's own detection step, Winget from RUNME.ps1,
//     the Go toolchain from both — and claims no manager nothing probes;
//   - every slide carries a Minutes line; the timeline renders the real-walk
//     5-minute total (measured 4:46 walk-only, fixed friction excluded, half-minute
//     steps - owner ruling 2026-07-12), clean of float noise, the bar ending AT the
//     last slide's start tick (100%) with the total as a caption;
//   - s6 is two columns (the game FIRST, the discussion second, the owner's
//     formulation leading it) and its embed is the AUTO lane: inert in its
//     <template>, run once by the deck's show() on the slide's first entry — no
//     start button, the game's own Restart button kept;
//   - the embed sits under deckEmbedBudget, the render path REFUSES an over-budget
//     embed with the static stand-in, and the manual start-button lane still works
//     (all three probed at the unit seam).
func selftestPongDeck() bool {
	html, live := bookOnceHTML()
	if !live {
		return true // nested probe: the outer run decides
	}
	di := strings.Index(html, `id="man-deck-pong"`)
	if di < 0 {
		return !isEngineRepo(ROOT) // a vehicle's book has no pong deck; the dogfood must
	}
	// six slides in outline order
	var pos [6]int
	at := di
	for i := 1; i <= 6; i++ {
		p := strings.Index(html, `id="man-deck-pong-s`+itoa(i)+`"`)
		if p < at {
			return false
		}
		pos[i-1] = p
		at = p
	}
	if strings.Contains(html, `id="man-deck-pong-s7"`) {
		return false
	}
	deckEnd := len(html)
	if e := strings.Index(html[pos[5]:], "</article>"); e >= 0 {
		deckEnd = pos[5] + e
	}
	slide := func(i int) string {
		if i < 6 {
			return html[pos[i-1]:pos[i]]
		}
		return html[pos[5]:deckEnd]
	}
	// s1 — get it: the clone line for THIS repo, the verbatim agent prompt
	s1 := slide(1)
	clone := "github.com" // no origin remote: the clone lane still names the host
	if r := strings.TrimSpace(originRemoteURL(ROOT)); strings.HasPrefix(r, "https://") {
		clone = strings.TrimSuffix(strings.TrimSuffix(r, "/"), ".git")
	}
	if !strings.Contains(s1, "git clone "+clone) || !strings.Contains(s1, "start a new project") {
		return false
	}
	// s1 names EXACTLY what the RUNME scripts check (req-pong-deck.4)
	ps1raw, err1 := os.ReadFile(filepath.Join(ROOT, "tools", "RUNME.ps1"))
	shraw, err2 := os.ReadFile(filepath.Join(ROOT, "tools", "RUNME.sh"))
	if err1 != nil || err2 != nil {
		return false // the dogfood ships both scripts beside the deck
	}
	sh, low := string(shraw), strings.ToLower(s1)
	ds := strings.Index(sh, `step "detecting the standard package manager"`)
	de := strings.Index(sh, `step "checking for the Go toolchain"`)
	if ds < 0 || de < ds {
		return false
	}
	probed := map[string]bool{}
	for _, m := range regexp.MustCompile(`command -v ([a-z-]+)`).FindAllStringSubmatch(sh[ds:de], -1) {
		if m[1] == "sudo" {
			continue // privilege plumbing, not a prerequisite
		}
		probed[m[1]] = true
		if !strings.Contains(low, m[1]) {
			return false // a probed manager the slide does not name
		}
	}
	if len(probed) == 0 {
		return false
	}
	for _, cand := range []string{"zypper", "pacman", "brew", "choco", "scoop"} {
		if strings.Contains(low, cand) && !probed[cand] {
			return false // the slide claims a manager no script checks
		}
	}
	if !strings.Contains(low, "winget") || !strings.Contains(string(ps1raw), `Test-CommandExists "winget"`) {
		return false
	}
	if !strings.Contains(s1, "Go toolchain") ||
		!strings.Contains(string(ps1raw), "checking for the Go toolchain") ||
		!strings.Contains(sh, "checking for the Go toolchain") {
		return false
	}
	// s2..s6 — the arc's content beats, each on its own slide
	s2 := slide(2)
	if !strings.Contains(s2, "attest --grant") || !strings.Contains(s2, "overkill") {
		return false
	}
	// s2 — the authored chat figure, aria-labelled, captioned (the figure law)
	if !strings.Contains(s2, `aria-label="The start exchange as a chat: `) ||
		!strings.Contains(s2, "What to see above:") {
		return false
	}
	s3 := slide(3)
	for _, want := range []string{"paddle control", "ball physics", "single file"} {
		if !strings.Contains(s3, want) {
			return false
		}
	}
	// s3 — PONG's own design-input register (owner: pong's data, the book's table shape)
	if !strings.Contains(s3, "req-paddle-control") || !strings.Contains(s3, "q-table") ||
		!strings.Contains(s3, "What to see above:") {
		return false
	}
	s4 := slide(4)
	if !strings.Contains(s4, "canvas wins") || !strings.Contains(s4, "recorded ADR") {
		return false
	}
	// s4 — PONG's own model through the ONE interactive onion (the mermaid fence lane):
	// the instance-scoped drill views coexist with the chapter's engine onion (scoped
	// overview id, scoped drill targets, the shared drill JS in the shell); the compact
	// class sizes it into the slide (one screen is the visual check); the authored
	// payload labels a bar; the caption sentence below the figure is GONE (owner
	// ruling 2026-07-12: drop the sentence, the figure speaks).
	if !strings.Contains(s4, `class="onion onion-sm"`) ||
		!strings.Contains(s4, `id="man-deck-pong-s4m1-o0"`) ||
		!strings.Contains(s4, `data-onion-go="man-deck-pong-s4m1-oLv0"`) ||
		!strings.Contains(s4, `aria-label="layered overview"`) ||
		!strings.Contains(s4, "state to draw") ||
		strings.Contains(s4, "What to see above:") ||
		!strings.Contains(html, "__onionDrill") {
		return false
	}
	if s5 := slide(5); !strings.Contains(s5, "MORE than the deliverable") ||
		!strings.Contains(s5, "RUNME - the installer") ||
		!strings.Contains(s5, "Five artifacts go into the ship step") {
		return false
	}
	// the timeline: every slide carries its Minutes line; the total renders the REAL walk
	// (owner ruling 2026-07-12: the measured 4:46 walk-only, fixed friction excluded,
	// half-minute steps -> 5 minutes), never float noise
	units := parseManifestUnits(manifestBody(filepath.Join(SPEC, "man-deck-pong.md")))
	if len(units) != 6 {
		return false
	}
	for _, u := range units {
		if u.Minutes == "" {
			return false // the pace stays reconstructable per milestone slide
		}
	}
	deckHTML := html[di:deckEnd]
	if !strings.Contains(deckHTML, `aria-label="deck timeline: 5 measured minutes"`) ||
		!strings.Contains(deckHTML, ">5 min<") ||
		!strings.Contains(deckHTML, `left:100.0%`) {
		return false // the bar ends AT the last slide's start tick; the total is a caption
	}
	// s6 — the ALWAYS-VISIBLE court (owner rule): the auto lane builds the UI on the
	// slide's first entry (static court, no page-load work); the script's OWN start/stop
	// buttons run and halt the simulation; leaving the slide halts it via slot.__stop
	s6 := slide(6)
	th := `<template id="man-deck-pong-s6-e1" data-auto="1">`
	tb := strings.Index(s6, th)
	if tb < 0 {
		return false
	}
	te := strings.Index(s6[tb:], "</template>")
	if te < 0 {
		return false
	}
	code := s6[tb+len(th) : tb+te]
	if len(code) > deckEmbedBudget || !strings.Contains(code, "startPong") ||
		!strings.Contains(code, "haltPong") || !strings.Contains(code, "drawCourt") ||
		!strings.Contains(code, "slot.__stop") {
		return false
	}
	if strings.Contains(s6, "embed-start") {
		return false // the buttons are the SCRIPT's own; no engine start button remains
	}
	// the stop-on-leave walk and the auto lane are both wired in the shell
	if !strings.Contains(html, "stopEmbeds(d,s)") ||
		!strings.Contains(html, "template[data-auto]:not([data-run])") {
		return false
	}
	// the timeline reads as a timeline: caption + per-tick numbers (owner rule)
	if !strings.Contains(deckHTML, `class="tl-cap"`) || !strings.Contains(deckHTML, `class="tl-num"`) {
		return false
	}
	// s6 is two columns, the game column FIRST, the owner's formulation leading the second
	ci := strings.Index(s6, `class="slide-cols"`)
	ti := strings.Index(s6, "not an example you would usually use quackitect for")
	if ci < 0 || tb < ci || ti < tb {
		return false
	}
	// the budget guard, both directions: over-budget refuses the executable lane
	n := 0
	over := renderDeckEmbedSlots("probe-s1", []deckEmbed{{Code: strings.Repeat("x", deckEmbedBudget+1)}}, &n)
	if strings.Contains(over, "<template") || strings.Contains(over, "embed-start") ||
		!strings.Contains(over, "embed-fallback") || !strings.Contains(over, "static figure stands in") {
		return false
	}
	// the manual start-button lane still works; the auto lane bakes its marker, no button
	n = 0
	manual := renderDeckEmbedSlots("probe-s1", []deckEmbed{{Code: "ok();"}}, &n)
	if !strings.Contains(manual, `<template id="probe-s1-e1">ok();</template>`) ||
		!strings.Contains(manual, "embed-start") {
		return false
	}
	n = 0
	auto := renderDeckEmbedSlots("probe-s1", []deckEmbed{{Code: "ok();", Auto: true}}, &n)
	return strings.Contains(auto, `<template id="probe-s1-e1" data-auto="1">ok();</template>`) &&
		!strings.Contains(auto, "embed-start")
}
