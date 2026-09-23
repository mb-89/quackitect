// The pipe to the editor, shared by the answers, the panel and the swap
// watcher. A frame goes in as one write, and a write and a flush each take the
// one lock, so a flush lands between frames.
// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
package main

import (
	"bufio"
	"sync"
)

type wire struct {
	guard sync.Mutex
	out   *bufio.Writer
}

func (one *wire) Write(said []byte) (int, error) {
	one.guard.Lock()
	defer one.guard.Unlock()
	return one.out.Write(said)
}

func (one *wire) Flush() error {
	one.guard.Lock()
	defer one.guard.Unlock()
	return one.out.Flush()
}
