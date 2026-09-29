// The LSP's checker: the check module's rules over the tree, the tools beside
// them, and the reads of the box and the index the rules take no part in.
// [[spec/tickets/lsp-rules-move-to-check]]
package main

import (
	"path/filepath"

	"quackitect/src/modules/check"
)

type Checker struct {
	tree *Tree
	// The runs the restated rules refuse, off the config. [[spec/design_output/lsp#a-second-copy-draws]]
	pointer int
	rule    int
	// The tools the checker runs beside its own rules, or none where a case hands in none. [[spec/design_output/lsp#the-server-runs-the-tools]]
	outside *Outside
}

// The checker over the index. A fresh one walks the index again first, which the check asks for and the editor does not. [[spec/design_output/lsp#the-server-reads-the-index]]
func checkerAt(root string, fresh bool) (*Checker, error) {
	tree, err := treeAt(root, fresh)
	if err != nil {
		return nil, err
	}
	tree.Words = wordsHere(root)
	tree.Node = nodeHere()
	tree.Survey = surveyHere(root)
	tree.Box = boxHere(root)
	pointer, rule := restatedHere(root)
	return &Checker{tree: tree, pointer: pointer, rule: rule, outside: outsideAt(root)}, nil
}

// The rules the check module holds, over this checker's tree. [[spec/tickets/lsp-rules-move-to-check]]
func (one *Checker) rules() *check.Checker {
	return check.CheckerOver(one.tree, one.pointer, one.rule)
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Over(path string) []Finding { return one.rules().Over(path) }

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Sweep() []Finding { return one.rules().Sweep() }

func (one *Checker) Tree() *Tree { return one.tree }

// The whole list every front reads: this server's own rules, and the tools beside them. [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Whole() []Finding {
	return sorted(append(one.Sweep(), one.OutsideSweep()...))
}

// The list over the paths named, each a file or a folder: this server's rules over every file, and the tools over the paths. [[spec/design_output/lsp#one-checker-every-front-asks]]
func (one *Checker) Reads(where []string) []Finding {
	found := []Finding{}
	for _, path := range pathsUnder(one.tree, where) {
		found = append(found, one.Over(path)...)
	}
	return sorted(append(found, one.OutsideOver(where)...))
}

// The tools over the whole tree, or nothing where the checker holds none. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Checker) OutsideSweep() []Finding {
	if one.outside == nil {
		return nil
	}
	return pastHistory(one.tree, one.outside.Sweep(one.tree))
}

// The tools over the paths named, or nothing where the checker holds none. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Checker) OutsideOver(where []string) []Finding {
	if one.outside == nil || len(where) == 0 {
		return nil
	}
	return pastHistory(one.tree, one.outside.Over(one.tree, where))
}

// The rules over one file's text, under this tool set's ceilings. [[spec/design_output/lsp#the-server-runs-the-tools]]
func (one *Outside) textFaults(tree *Tree, path string) []Finding {
	return check.TextFaults(tree, path, one.Function, one.File, fromTree)
}

// The binary's tree, over the index. A fresh tree walks the index again first, so the check reads the disk as it stands. [[spec/design_output/lsp#the-server-reads-the-index]]
func treeAt(root string, fresh bool) (*Tree, error) {
	disk, err := overIndex(root, indexAt(root), fresh)
	if err != nil {
		return nil, err
	}
	return treeOver(root, disk), nil
}

// [[spec/tickets/a-door-holds-file-calls]]
func treeOver(root string, disk Disk) *Tree {
	return check.TreeOver(root, diskSource{root: root, disk: disk})
}

// The disk a tree reads through, as a case's memory disk or the binary's index disk, under the root. [[spec/tickets/lsp-rules-move-to-check]]
func diskOf(tree *Tree) Disk {
	said, _ := tree.Source().(diskSource)
	return said.disk
}

// The LSP's disk as the check module reads it: slash paths under the root. [[spec/tickets/lsp-rules-move-to-check]]
type diskSource struct {
	root string
	disk Disk
}

func (one diskSource) at(path string) string {
	return filepath.Join(one.root, filepath.FromSlash(path))
}

func (one diskSource) Read(path string) (string, bool) {
	read, err := one.disk.ReadFile(one.at(path))
	if err != nil {
		return "", false
	}
	return string(read), true
}

func (one diskSource) Exists(path string) bool {
	_, err := one.disk.Stat(one.at(path))
	return err == nil
}

func (one diskSource) Folder(path string) bool {
	said, err := one.disk.Stat(one.at(path))
	return err == nil && said.IsDir()
}

func (one diskSource) Names(folder string) []string {
	found, err := one.disk.ReadDir(one.at(folder))
	if err != nil {
		return nil
	}
	out := []string{}
	for _, entry := range found {
		if !entry.IsDir() {
			out = append(out, entry.Name())
		}
	}
	return out
}

// The paths git tracks where the index holds the tree, and a walk of the folder otherwise. [[spec/design_output/tree#the-tree-handed-in]]
func (one diskSource) Paths() []string {
	if list, ok := one.disk.(interface{ tracked() []string }); ok {
		return list.tracked()
	}
	return diskHolds(one.disk, one.root)
}

// [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one diskSource) Pulls() ([]string, []string, error) {
	from, ok := one.disk.(interface {
		pulls() ([]string, []string, error)
	})
	if !ok {
		return nil, nil, nil
	}
	return from.pulls()
}

// [[spec/design_output/lsp#the-panel-follows-the-index]]
func (one diskSource) Changes(since int64) (int64, error) {
	from, ok := one.disk.(interface {
		changes(int64) (int64, error)
	})
	if !ok {
		return since, errNoIndex
	}
	return from.changes(since)
}

// [[spec/design_output/private#the-box-names-the-owner]]
func boxHere(root string) Box {
	first := func(names ...string) string {
		for _, one := range names {
			if said := envOf(one); said != "" {
				return said
			}
		}
		return ""
	}
	asked := func(key string) string { return gitSays(root, key) }
	return Box{
		User:  first("USER", "USERNAME", "LOGNAME"),
		Home:  first("HOME", "USERPROFILE"),
		Name:  asked("user.name"),
		Email: asked("user.email"),
	}
}
