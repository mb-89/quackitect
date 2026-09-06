package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/expr"
	"strings"
	"time"
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

func rowOf(r Roots, t Token) expr.Row {
	dir := dirFor(r, t)
	path := filepath.Join(dir, t.ID+".md")
	rel, err := filepath.Rel(r.Work, path)
	if err != nil {
		rel = path
	}
	row := expr.Row{
		// KIND IS A CONSTANT AND IT IS STILL A COLUMN. Every token this
		// function sees is a work-token, because that is what picked the
		// schema that read it. A view says so anyway, so the filter still
		// reads as a question about the note rather than about this program.
		"kind": expr.Str("work-token"),
		"id":   expr.Str(t.ID), "title": expr.Str(t.Title), "file": expr.Str(rel),
		"detail": expr.Str(t.Detail), "guidance": expr.Str(t.Guidance),
		"status": expr.Str(string(t.Status)), "process": expr.Str(t.Process),
		"bucket": expr.Str(t.Bucket),
		"holder": expr.Str(t.Holder), "needs_human": expr.Bool(t.NeedsHuman), "urgent": expr.Bool(t.Urgent),
		"depends_on": expr.List(t.DependsOn), "parent": expr.Str(t.Parent), "ready_when": expr.Str(t.ReadyWhen),
		"disposition": expr.Str(string(t.Disposition)), "reason": expr.Str(t.Reason),
		"began": expr.List(t.Began), "ended": expr.List(t.Finished),
		"successors": expr.List(t.Successors),
	}
	// WHAT A QUERY CAN ASK THAT THE TOKEN DOES NOT ANSWER ITSELF. Blocked is
	// a walk over other tokens, so it cannot be a field and it can be a
	// property. A view filters on it without knowing how it is worked out.
	row["blocked"] = expr.Str(Blocked(r, t))
	// THE CLAIM IS THE SAME KIND OF ANSWER, and it is the one thing standing
	// between two boxes and the same token. A person could see it by running
	// se claim --list at a prompt and nowhere else.
	//
	// IT IS THE STANDING CLAIM AND NOT THE FIELD. A claim made here is on the
	// note and one made elsewhere reached this box through git, so reading the
	// field alone would draw another box's token as free. A claim that has
	// lapsed is not one either, and ClaimedNow answers all three.
	row["claimed_by"] = expr.Str(ClaimedNow(r, t, time.Now().UTC()))
	return row
}

// TokenRows is every token, as rows. The order is the ledger's, and sorting is
// the view's business.
func TokenRows(r Roots) []expr.Row {
	var out []expr.Row
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
	for _, dir := range viewDirs(r) {
		p := filepath.Join(dir, name)
		if _, err := os.Stat(p); err == nil {
			return p, true
		}
	}
	return "", false
}

// ViewPathToWrite finds the file an EDIT is about to change, and it cannot
// leave the folder being worked on.
//
// READING FALLS BACK TO THE METHOD AND WRITING DOES NOT. The fallback was
// writable, so a command told to work on one folder wrote into another whenever
// the work folder carried no copy of its own, which is exactly what isolating
// yourself in a fresh folder looks like. A reviewer working in a temporary
// folder changed the owner's board twice.
//
// AN EDIT MAKES THE PROJECT ITS OWN COPY. A project that changes how it is
// looked at has said something about how it wants to be looked at, and that is
// what a copy of its own means. So the method's is copied in and the edit lands
// on the copy, rather than the edit being refused and somebody having to do the
// copy by hand before they can move a column.
func ViewPathToWrite(r Roots, name string) (string, bool) {
	if filepath.IsAbs(name) {
		if _, err := os.Stat(name); err == nil {
			return name, true
		}
		return "", false
	}
	if filepath.Ext(name) == "" {
		name += ".base"
	}
	// A copy the folder already has, wherever it keeps it.
	for _, dir := range viewDirs(r) {
		if !under(r.Work, dir) {
			continue
		}
		if p := filepath.Join(dir, name); exists(p) {
			return p, true
		}
	}
	from, ok := ViewPath(r, name)
	if !ok {
		return "", false
	}
	to := filepath.Join(r.Work, "util", "views", name)
	if err := os.MkdirAll(filepath.Dir(to), 0o755); err != nil {
		return "", false
	}
	b, err := os.ReadFile(from)
	if err != nil {
		return "", false
	}
	if err := writeAtomic(to, b, 0o644); err != nil {
		return "", false
	}
	return to, true
}

// under answers whether a path is inside a folder.
//
// A NEIGHBOUR IS NOT A CHILD, and a string prefix cannot tell them apart. This
// machine has the pair: quackitect and quackitect-v4, side by side. The method
// path starts with the work path, so a prefix test called it inside, and an
// edit told to work on the first wrote into the second, which is the owner's
// live board.
//
// The same question is asked properly twice already, a few files away, in
// inRoot and in underPrivate. This is the shape they use.
func under(folder, path string) bool {
	folder, err := filepath.Abs(folder)
	if err != nil {
		return false
	}
	path, err = filepath.Abs(path)
	if err != nil {
		return false
	}
	rel, err := filepath.Rel(folder, path)
	if err != nil {
		return false
	}
	return rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator))
}

// WHERE A VIEW IS LOOKED FOR, NEAREST FIRST.
//
// THE FOLDER BEING WORKED ON WINS. A command told to work on one folder wrote
// into another: a reviewer isolating itself with --work still reached the live
// util/views, because only the method root was searched for a shipped view.
//
// So the work folder's own util/views comes before the method's. A tree that
// carries a copy of the method is worked on by itself, which is what --work
// means, and the method stays the fallback for a project that ships none.
func viewDirs(r Roots) []string {
	dirs := []string{r.Private("views"), filepath.Join(r.Work, "util", "views")}
	if r.Method != r.Work {
		dirs = append(dirs, filepath.Join(r.Method, "util", "views"))
	}
	return dirs
}

// Views lists what can be asked for, so a person or a panel can offer them
// rather than having to know their names.
func Views(r Roots) []string {
	seen := map[string]bool{}
	var out []string
	for _, dir := range viewDirs(r) {
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() || filepath.Ext(e.Name()) != ".base" || Parked(e.Name()) {
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
