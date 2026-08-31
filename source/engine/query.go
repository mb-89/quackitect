package main

import (
	"os"
	"path/filepath"
	"strconv"
)

// TOKENS AS ROWS, WHICH IS THE ONLY PLACE THAT BINDS THE TWO.
//
// Everything in view.go works on flat maps and knows nothing about work. This
// file is the join, and it is deliberately the whole of it: a second source
// drawn in the same window is a second function like this one, and it changes
// nothing else.
//
// THE FILE PROPERTIES ARE HERE BECAUSE A TOKEN IS A NOTE. name, path, folder
// and ext mean something now, and a query written against Obsidian's format
// expects them.

func rowOf(r Roots, t Token) Row {
	dir := dirFor(r, t)
	path := filepath.Join(dir, t.ID+".md")
	rel, err := filepath.Rel(r.Work, path)
	if err != nil {
		rel = path
	}
	row := Row{
		"id": vs(t.ID), "type": vs(TypeWork), "form": vs(t.Form),
		"detail": vs(t.Detail), "guidance": vs(t.Guidance),
		"status": vs(string(t.Status)), "assignee": vs(t.Assignee),
		"scope": vs(string(t.Scope)), "traced": vb(t.Traced),
		"disposition": vs(string(t.Disposition)), "reason": vs(t.Reason),
		"holder": vs(t.Holder), "bucket": vs(t.Bucket), "parent": vs(t.Parent),
		"subs": vl(t.Subs), "depends_on": vl(t.DependsOn),
		"successors": vl(t.Successors),
		"evidence":   vl(t.Evidence.Sections), "evidence_script": vs(t.Evidence.Script),
		"rounds": vn(float64(t.Rounds)), "minted_by": vs(t.MintedBy),
		"opened": vs(t.Opened), "taken_at": vs(t.TakenAt),
		"sent_at": vs(t.SentAt), "closed_at": vs(t.ClosedAt),

		"file.name":   vs(t.ID),
		"file.path":   vs(filepath.ToSlash(rel)),
		"file.folder": vs(filepath.ToSlash(filepath.Dir(rel))),
		"file.ext":    vs("md"),
	}
	// WHAT A QUERY CAN ASK THAT THE TOKEN DOES NOT ANSWER ITSELF. Blocked is
	// a walk over other tokens, so it cannot be a field and it can be a
	// property. A view filters on it without knowing how it is worked out.
	row["blocked"] = vs(Blocked(r, t))
	row["rounds_text"] = vs(strconv.Itoa(t.Rounds))
	return row
}

// TokenRows is every token, as rows. The order is the ledger's, and sorting is
// the view's business.
func TokenRows(r Roots) []Row {
	var out []Row
	for _, t := range Tokens(r) {
		out = append(out, rowOf(r, t))
	}
	return out
}

// ViewPath finds a view file. A project may keep its own beside the ones the
// method ships, and its own wins, because a project that overrides a view has
// said something about how it wants to be looked at.
func ViewPath(r Roots, name string) (string, bool) {
	if filepath.IsAbs(name) {
		if _, err := os.Stat(name); err == nil {
			return name, true
		}
		return "", false
	}
	if filepath.Ext(name) == "" {
		name += ".base"
	}
	for _, dir := range []string{r.Private("views"), filepath.Join(r.Method, "util", "views")} {
		p := filepath.Join(dir, name)
		if _, err := os.Stat(p); err == nil {
			return p, true
		}
	}
	return "", false
}

// Views lists what can be asked for, so a person or a panel can offer them
// rather than having to know their names.
func Views(r Roots) []string {
	seen := map[string]bool{}
	var out []string
	for _, dir := range []string{r.Private("views"), filepath.Join(r.Method, "util", "views")} {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || filepath.Ext(e.Name()) != ".base" {
				continue
			}
			name := e.Name()[:len(e.Name())-len(".base")]
			if !seen[name] {
				seen[name] = true
				out = append(out, name)
			}
		}
	}
	return out
}
