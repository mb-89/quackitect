// quack lsp relays the editor's stdio to the lsp IO module whole, the token
// line first.
// [[spec/tickets/the-lsp-door-lands]]
package main

import (
	"bytes"
	"io"
	"net"
	"strings"
	"testing"
	"time"
)

func TestQuackLspRelaysTheStreamWhole(t *testing.T) {
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listen.Close()
	frame := "Content-Length: 2\r\n\r\n{}"
	heard := make(chan string, 1)
	go func() {
		conn, err := listen.Accept()
		if err != nil {
			heard <- ""
			return
		}
		defer conn.Close()
		read, _ := io.ReadAll(conn)
		conn.Write([]byte(frame))
		heard <- string(read)
	}()
	conn, err := net.Dial("tcp", listen.Addr().String())
	if err != nil {
		t.Fatal(err)
	}
	var out bytes.Buffer
	if err := relays(strings.NewReader(frame), &out, conn, "tok"); err != nil {
		t.Fatal(err)
	}
	conn.Close()
	select {
	case said := <-heard:
		if said != "tok\n"+frame {
			t.Fatalf("the IO module hears %q, and wants the token line, then the frame whole", said)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the IO module hears nothing")
	}
	if out.String() != frame {
		t.Fatalf("the editor reads %q, and wants the reply frame whole", out.String())
	}
}
