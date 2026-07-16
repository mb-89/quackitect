package main

// design: go-spec-content  implements: req-project-content-roots.2
// Content notes are PROJECT content, not method machinery. Glossary terms, reference notes, fundamentals, and method notes live under the workspace spec: spec/glossary, spec/references, spec/fundamentals, spec/methods. This holds for every project, including quackitect itself. They are NOT trace nodes. The strict guard, LoadAll, and scanIDs skip these directories, and dedicated loaders read them. Every kind carries Obsidian-native aliases; the auto-link pass and Obsidian's own autocomplete share them. The method layer keeps everything else and stays inherited by driven workspaces unchanged.

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// specContentDirs names the project-content roots under spec/.
var specContentDirs = map[string]bool{
	"glossary": true, "references": true, "fundamentals": true, "methods": true,
}

// isSpecContent reports whether path sits inside a content dir relative to root.
func isSpecContent(root, path string) bool {
	rel, err := filepath.Rel(root, path)
	if err != nil {
		return false
	}
	seg := strings.SplitN(filepath.ToSlash(rel), "/", 2)[0]
	return specContentDirs[seg]
}

// ContentNote is one project-content note (term, reference, fundamental, or method).
type ContentNote struct {
	Slug      string
	Kind      string // the dir it came from: glossary | references | fundamentals | methods
	Statement string // one-liner (methods; fundamentals use it for the ch2 list)
	Title     string // references
	URL       string // references (the ONLY legal home for an external link)
	RefKind   string // references: normative | informative
	Version   string // references: the pin
	Accessed  string // references
	Class     string // terms: glossary | notation | meta
	Term      string
	Long      string
	Unit      string // notation symbols carry units
	Aliases   []string
	Source    string // methods: the reference note the method cites
	Body      string
	Path      string
}

var contentRootOverride string // test seam: an alternate spec root for the loaders

func contentRoot() string {
	if contentRootOverride != "" {
		return contentRootOverride
	}
	return SPEC
}

// ReadContentNotes loads one kind's notes from the workspace spec.
func ReadContentNotes(kind string) map[string]ContentNote {
	out := map[string]ContentNote{}
	dir := filepath.Join(contentRoot(), kind)
	ents, err := os.ReadDir(dir)
	if err != nil {
		return out
	}
	for _, e := range ents {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".md") || e.Name() == "README.md" {
			continue
		}
		p := filepath.Join(dir, e.Name())
		props := basePropsOf(p)
		c := ContentNote{
			Slug: strings.TrimSuffix(e.Name(), ".md"), Kind: kind, Path: p,
			Statement: props.scalars["statement"], Title: props.scalars["title"],
			URL: props.scalars["url"], RefKind: props.scalars["kind"],
			Version: props.scalars["version"], Accessed: props.scalars["accessed"],
			Class: props.scalars["class"], Term: props.scalars["term"],
			Long: props.scalars["long"], Unit: props.scalars["unit"],
			Source: props.scalars["source"], Aliases: props.lists["aliases"],
			Body: strings.TrimSpace(props.body),
		}
		out[c.Slug] = c
	}
	return out
}

// AliasIndex maps every name and alias to its owning note slug, across all kinds.
// A name claimed twice is a HARD error (fail loudly - never a guess).
func AliasIndex() (map[string]string, []string) {
	idx := map[string]string{}
	var errs []string
	kinds := []string{"glossary", "references", "fundamentals", "methods"}
	for _, kind := range kinds {
		notes := ReadContentNotes(kind)
		var slugs []string
		for s := range notes {
			slugs = append(slugs, s)
		}
		sort.Strings(slugs)
		for _, s := range slugs {
			c := notes[s]
			names := append([]string{}, c.Aliases...)
			if c.Term != "" {
				names = append(names, c.Term)
			}
			for _, name := range names {
				key := strings.ToLower(strings.TrimSpace(name))
				if key == "" {
					continue
				}
				if prev, dup := idx[key]; dup && prev != kind+":"+s {
					errs = append(errs, "alias '"+name+"' claimed by both "+prev+" and "+kind+":"+s)
					continue
				}
				idx[key] = kind + ":" + s
			}
		}
	}
	return idx, errs
}

// enddesign
