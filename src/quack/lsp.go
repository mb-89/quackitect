// quack lsp: the editor's stdio relayed whole to the lsp IO module over the
// port its standing file names, the token line first.
// [[spec/tickets/the-lsp-door-lands]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"path/filepath"
	"time"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/holds"
	manager "quackitect/src/modules/index"
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

// The values the lenses read: the holds module's standing holds, and the tickets the cloud holds, which CloudPort in src/modules/tickets names under the tickets instance. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const cloudTickets = "tickets/cloud"

// The family a ticket's drawing stands under, which DrawnPort in src/modules/tickets names under the tickets instance, a path past it. [[spec/tickets/lsp-marks-the-held-fields]]
const drawnTickets = "tickets/drawn/"

// The seconds a press waits on its verb, which ACT_WAIT in src/extension/editor-index.js held for the extension's own post, and the caller its operations stand under. [[spec/tickets/lsp-draws-the-ticket-lenses]]
const (
	pressWait = 600 * time.Second
	lspCaller = "lsp"
)

// The manager's call of an action. [[spec/tickets/lsp-draws-the-ticket-lenses]]
type pressCall func(name string, input any, caller string, wait time.Duration) (manager.Answer, error)

// What the buttons over a ticket read and run: the holds and the cloud tickets off the store, a press through the manager's call, and a buffer's write under the root. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func lspTickets(root string, store *q.Store, call pressCall, write func(path string, data []byte, perm fs.FileMode) error) lsp.Tickets {
	reads := func(name string, into any) {
		if body, err := json.Marshal(store.Snapshot().Read(name)); err == nil {
			json.Unmarshal(body, into)
		}
	}
	return lsp.Tickets{
		Holds: func() []lsp.Hold {
			var out []lsp.Hold
			reads(holds.StandingName, &out)
			return out
		},
		Cloud: func() []string {
			var out []string
			reads(cloudTickets, &out)
			return out
		},
		Act: func(name string, input any) lsp.Ran {
			body, _ := json.Marshal(input)
			typed, err := store.Input(name, body)
			if err != nil {
				return lsp.Ran{Code: 1, Err: err.Error()}
			}
			said, err := call(name, typed, lspCaller, pressWait)
			return ranOf(name, said, err)
		},
		Save: func(path, text string) error {
			return write(filepath.Join(root, filepath.FromSlash(path)), []byte(text), 0o644)
		},
		Drawn: func(path string) lsp.Drawing {
			var out lsp.Drawing
			reads(drawnTickets+path, &out)
			return out
		},
		Names: []string{holds.StandingName, cloudTickets},
	}
}

// A call's answer as a run, the way the extension's index door reads a post: the output on an end, the handle past the wait, and the fault on a refusal. [[spec/tickets/the-lens-calls-actions]]
func ranOf(name string, said manager.Answer, err error) lsp.Ran {
	switch {
	case err != nil:
		return lsp.Ran{Code: 1, Err: err.Error()}
	case said.Error != "":
		return lsp.Ran{Code: 1, Err: said.Error}
	case said.Running:
		return lsp.Ran{Out: fmt.Sprintf("wait\n%s runs on at %s", name, said.Handle)}
	}
	if text, ok := said.Result.(string); ok {
		return lsp.Ran{Out: text}
	}
	if said.Result == nil {
		return lsp.Ran{}
	}
	body, _ := json.Marshal(said.Result)
	return lsp.Ran{Out: string(body)}
}

// Opens the lsp listener over the store, reading the check module's sweep at each publish. [[spec/tickets/the-lsp-door-lands]]
func listensLSP(root string, store *q.Store, one hooked, served manager.Served) (func(), error) {
	server := lsp.New(lsp.Outside{
		Root: root, Store: store, As: one.as, Bound: one.bound,
		Sweep: func() any { return store.Snapshot().Read(sweepName) },
		// [[spec/tickets/lsp-module-draws-the-tools]]
		Tools: toolsAt(root), Quiet: -1, Clock: wall,
		// [[spec/tickets/lsp-module-serves-the-features]]
		Check: lspChecks(root),
		Files: func() map[string]string {
			texts, _ := store.Snapshot().Read(one.bound(lsp.TextsName)).(map[string]string)
			return texts
		},
		Tickets: lspTickets(root, store, served.Call, realDisk().write),
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
		Survey: check.ToolsAt, Bin: check.Bin,
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
