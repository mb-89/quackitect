// quack lsp. tests-red holds this stub, and tests-green fills it.
// [[spec/tickets/the-lsp-door-lands]]
package main

import (
	"io"
	"net"
)

// [[spec/design_output/model#the-editor-starts-quack-lsp]]
func relays(in io.Reader, out io.Writer, conn net.Conn, token string) error { return nil }
