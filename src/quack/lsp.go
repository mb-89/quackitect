// quack lsp: the editor's stdio relayed whole to the lsp IO module over the
// port its standing file names, the token line first.
// [[spec/tickets/the-lsp-door-lands]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
	"quackitect/src/q"
)

// The verb: starts the index where none answers, dials the port the standing file names, and relays stdio until it ends. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func lsps(disk diskDoors, dial func(port int) (io.ReadWriteCloser, error), root string, start func() error, in io.Reader, out io.Writer) error {
	if err := start(); err != nil {
		return err
	}
	text, err := disk.read(filepath.Join(root, filepath.FromSlash(lsp.StandingFile)))
	if err != nil {
		return err
	}
	var standing lsp.Standing
	if err := json.Unmarshal(text, &standing); err != nil {
		return err
	}
	conn, err := dial(standing.Port)
	if err != nil {
		return err
	}
	defer conn.Close()
	return relays(in, out, conn, standing.Token)
}

// The verb over the tree's own root, where the index starts through the /v1 door. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func lspVerb(in io.Reader, out io.Writer) error {
	root, err := index.Root()
	if err != nil {
		return err
	}
	return lsps(realDisk(), dialLocal, root, func() error { _, err := reachV1(); return err }, in, out)
}

// Sends the token line, copies the input to the connection until it ends and half-closes, then copies the connection to the output until the IO module ends it. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func relays(in io.Reader, out io.Writer, conn io.ReadWriter, token string) error {
	if _, err := fmt.Fprintf(conn, "%s\n", token); err != nil {
		return err
	}
	go func() {
		io.Copy(conn, in)
		if half, ok := conn.(interface{ CloseWrite() error }); ok {
			half.CloseWrite()
		}
	}()
	_, err := io.Copy(out, conn)
	return err
}

// Opens the lsp listener over the store, reading the check module's sweep at each publish. [[spec/tickets/the-lsp-door-lands]]
func listensLSP(root string, store *q.Store, one hooked) (func(), error) {
	server := lsp.New(lsp.Outside{
		Root: root, Store: store, As: one.as, Bound: one.bound,
		Sweep: func() any { return store.Snapshot().Read(sweepName) },
		// [[spec/tickets/lsp-module-draws-the-tools]]
		Tools: lsp.ToolsAt(root, lspChecks(root)), Quiet: -1, Clock: wall,
		// [[spec/tickets/lsp-module-serves-the-features]]
		Check: lspChecks(root),
		Files: func() map[string]string {
			texts, _ := store.Snapshot().Read(one.bound(lsp.TextsName)).(map[string]string)
			return texts
		},
	})
	return lsp.Listen(root, server)
}

// The check module's rules and reads the lsp module draws on, over a tree under the root the links open files at, handed across here because one module imports no other. [[spec/tickets/lsp-module-draws-the-tools]]
func lspChecks(root string) lsp.Check {
	return lsp.Check{
		Tree: func(texts map[string]string) lsp.Tree { return check.TreeOver(root, check.Texts(texts)) },
		Faults: func(tree lsp.Tree, path string, function, file int, source string) []lsp.Finding {
			over, ok := tree.(*check.Tree)
			if !ok {
				return nil
			}
			out := []lsp.Finding{}
			for _, said := range check.TextFaults(over, path, function, file, source) {
				out = append(out, lsp.Finding(said))
			}
			return out
		},
		Draft: check.IsDraft, Relative: check.RelativeTo,
		ValeIni: check.ValeIni, Survey: check.ToolsAt, Bin: check.Bin,
		// [[spec/tickets/lsp-module-serves-the-features]]
		Hover: overTree(func(tree *check.Tree, path string, line, character int) any {
			return check.HoverAt(tree, path, line, character)
		}),
		Complete: overTree(func(tree *check.Tree, path string, line, character int) any {
			return check.Offers(tree, path, line, character)
		}),
		Links: overTree(func(tree *check.Tree, path string, _, _ int) any { return check.LinksIn(tree, path) }),
		Folds: overTree(func(tree *check.Tree, path string, _, _ int) any { return check.FoldsOf(tree.Read(path)) }),
	}
}

// A read over the check module's own tree as a port, which answers nothing over a tree of another make. [[spec/tickets/lsp-module-serves-the-features]]
func overTree(read func(tree *check.Tree, path string, line, character int) any) lsp.Feature {
	return func(tree lsp.Tree, path string, line, character int) any {
		over, ok := tree.(*check.Tree)
		if !ok {
			return nil
		}
		return read(over, path, line, character)
	}
}
