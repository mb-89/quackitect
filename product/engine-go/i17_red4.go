package main

// i17_red4.go — the book-publish probes (the R5 batch). The iteration's red battery is
// closed: these registered green-at-birth against the already-landed build, noted in the
// batch's evidence trail.
// pages-url        — the Pages-URL derivation + the no-git origin read, fixture strings only
// book-publish     — ship's copy law: one render, every published path, byte-identical
// scaffold-readme  — both scaffolds plant a README with a working further-reading block

import (
	"os"
	"path/filepath"
	"strings"
)

var i17dTests = []namedTest{
	{"pages-url", selftestPagesURL},
	{"book-publish", selftestBookPublish},
	{"scaffold-readme", selftestScaffoldReadme},
}

func selftestPagesURL() bool {
	// the derivation: owner/repo out of every github.com remote shape, nothing else.
	good := map[string]string{
		"https://github.com/mb-89/quackitect.git": "https://mb-89.github.io/quackitect/book.html",
		"https://github.com/mb-89/quackitect":     "https://mb-89.github.io/quackitect/book.html",
		"https://github.com/mb-89/quackitect/":    "https://mb-89.github.io/quackitect/book.html",
		"git@github.com:owner/repo.git":           "https://owner.github.io/repo/book.html",
		"ssh://git@github.com/owner/repo.git":     "https://owner.github.io/repo/book.html",
		" https://github.com/o/r.git ":            "https://o.github.io/r/book.html",
	}
	for remote, want := range good {
		got, ok := pagesBookURL(remote)
		if !ok || got != want {
			return false
		}
	}
	bad := []string{
		"", "not a url",
		"https://gitlab.com/o/r.git",   // wrong host: no Pages to derive
		"https://github.com/onlyowner", // no repo half
		"https://github.com/o/r/extra", // too deep
		"git@github.com:.git", "git@github.com:o/.git",
	}
	for _, remote := range bad {
		if _, ok := pagesBookURL(remote); ok {
			return false
		}
	}
	// the origin read: hand-rolled .git/config parsing, no git call anywhere.
	dir, err := os.MkdirTemp("", "qpu")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	if originRemoteURL(dir) != "" {
		return false // no .git: no remote
	}
	repo := filepath.Join(dir, "repo")
	os.MkdirAll(filepath.Join(repo, ".git"), 0o755)
	os.WriteFile(filepath.Join(repo, ".git", "config"),
		[]byte("[core]\n\tbare = false\n[remote \"origin\"]\n\turl = https://github.com/mb-89/duckpond.git\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n[remote \"backup\"]\n\turl = https://example.com/x.git\n"), 0o644)
	if originRemoteURL(repo) != "https://github.com/mb-89/duckpond.git" {
		return false
	}
	// a worktree's .git FILE redirects one hop to the real git dir.
	wt := filepath.Join(dir, "wt")
	os.MkdirAll(wt, 0o755)
	os.WriteFile(filepath.Join(wt, ".git"), []byte("gitdir: "+filepath.Join(repo, ".git")+"\n"), 0o644)
	return originRemoteURL(wt) == "https://github.com/mb-89/duckpond.git"
}

func selftestBookPublish() bool {
	// the wiring: ship and the drift lint share ONE path list, and it names both copies.
	paths := publishedBookPaths()
	if len(paths) != 2 {
		return false
	}
	if !strings.HasSuffix(filepath.ToSlash(paths[0]), "spec/book.html") ||
		!strings.HasSuffix(filepath.ToSlash(paths[1]), "docs/book.html") {
		return false
	}
	// the copy law: one render lands byte-identically at every published path,
	// creating the docs/ folder on the way.
	dir, err := os.MkdirTemp("", "qbp")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	fx := bookFixture(dir, 1, true)
	html, _, _ := renderBookHTML(fx)
	spec := filepath.Join(dir, "spec", "book.html")
	docs := filepath.Join(dir, "docs", "book.html")
	if writeBookCopies(html, []string{spec, docs}) != nil {
		return false
	}
	a, _ := os.ReadFile(spec)
	b, _ := os.ReadFile(docs)
	if string(a) != html || string(b) != html {
		return false
	}
	// the drift law holds at the docs copy exactly as at spec/book.html.
	if bookDriftFindingAt(docs, fx) != nil {
		return false // a matching copy is clean
	}
	os.WriteFile(docs, []byte(html+"<!-- tampered -->"), 0o644)
	if len(bookDriftFindingAt(docs, fx)) != 1 {
		return false // a drifted copy is flagged
	}
	os.Remove(docs)
	return bookDriftFindingAt(docs, fx) == nil // absent = disarmed
}

func selftestScaffoldReadme() bool {
	dir, err := os.MkdirTemp("", "qsr")
	if err != nil {
		return false
	}
	defer os.RemoveAll(dir)
	// stubs into a target WITHOUT a git remote: the placeholder line stands in.
	bare := filepath.Join(dir, "pond-a")
	cmdStartStubs([]string{bare})
	raw, _ := os.ReadFile(filepath.Join(bare, "README.md"))
	md := string(raw)
	if !strings.Contains(md, "## Further reading") ||
		!strings.Contains(md, "(spec/book.html)") ||
		!strings.Contains(md, "no git origin remote") {
		return false
	}
	if strings.Contains(md, "github.io/pond-a") {
		return false // nothing derived without a remote
	}
	// stubs into a target WITH an origin remote: the Pages link derives from it.
	linked := filepath.Join(dir, "pond-b")
	os.MkdirAll(filepath.Join(linked, ".git"), 0o755)
	os.WriteFile(filepath.Join(linked, ".git", "config"),
		[]byte("[remote \"origin\"]\n\turl = git@github.com:mb-89/pond-b.git\n"), 0o644)
	cmdStartStubs([]string{linked})
	raw, _ = os.ReadFile(filepath.Join(linked, "README.md"))
	if !strings.Contains(string(raw), "https://mb-89.github.io/pond-b/book.html") {
		return false
	}
	// idempotent: a second run never overwrites a project's own README.
	os.WriteFile(filepath.Join(linked, "README.md"), []byte("KEPT"), 0o644)
	cmdStartStubs([]string{linked})
	raw, _ = os.ReadFile(filepath.Join(linked, "README.md"))
	if string(raw) != "KEPT" {
		return false
	}
	// start init plants the same block in a full vehicle.
	vehicle := filepath.Join(dir, "pond-c")
	if initVehicleFiles(vehicle) != nil {
		return false
	}
	raw, _ = os.ReadFile(filepath.Join(vehicle, "README.md"))
	return strings.Contains(string(raw), "## Further reading") &&
		strings.Contains(string(raw), "(spec/book.html)")
}
