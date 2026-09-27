// The outside se-front reads: its arguments, its streams and the files a
// normalise names.
// [[spec/tickets/go-writes-the-frontmatter]]
package main

import "os"

func main() {
	os.Exit(run(os.Args[1:], os.Stdin, os.Stdout, os.Stderr, files{}))
}

type files struct{}

func (files) read(path string) ([]byte, error) { return os.ReadFile(path) }
func (files) write(path string, said []byte) error {
	return os.WriteFile(path, said, 0o644)
}
