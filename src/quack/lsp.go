// quack lsp: the editor's stdio relayed whole to the lsp IO module over the
// port its standing file names, the token line first.
// [[spec/tickets/the-lsp-door-lands]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net"
	"os"
	"path/filepath"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
	"quackitect/src/q"
)

// The verb: starts the index where none answers, dials the port the standing file names, and relays stdio until it ends. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func lsps(root string, start func() error, in io.Reader, out io.Writer) error {
	if err := start(); err != nil {
		return err
	}
	text, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(lsp.StandingFile)))
	if err != nil {
		return err
	}
	var standing lsp.Standing
	if err := json.Unmarshal(text, &standing); err != nil {
		return err
	}
	conn, err := net.Dial("tcp", fmt.Sprintf("127.0.0.1:%d", standing.Port))
	if err != nil {
		return err
	}
	defer conn.Close()
	return relays(in, out, conn, standing.Token)
}

// The verb over the tree's own root, where the index starts through the /v1 door. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func lspVerb() error {
	root, err := index.Root()
	if err != nil {
		return err
	}
	return lsps(root, func() error { _, err := index.V1(); return err }, os.Stdin, os.Stdout)
}

// Sends the token line, copies the input to the connection until it ends and half-closes, then copies the connection to the output until the IO module ends it. [[spec/design_output/model#the-editor-starts-quack-lsp]]
func relays(in io.Reader, out io.Writer, conn net.Conn, token string) error {
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
		Tools: lsp.ToolsAt(root, lspChecks()), Quiet: -1,
		Files: func() map[string]string {
			texts, _ := store.Snapshot().Read(one.bound(lsp.TextsName)).(map[string]string)
			return texts
		},
	})
	return lsp.Listen(root, server)
}

// The check module's rules the lsp tools draw on, handed across here because one module imports no other. [[spec/tickets/lsp-module-draws-the-tools]]
func lspChecks() lsp.Check {
	return lsp.Check{
		Tree: func(texts map[string]string) lsp.Tree { return check.TreeOver("", check.Texts(texts)) },
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
	}
}
