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
	"quackitect/src/modules/lsp"
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
