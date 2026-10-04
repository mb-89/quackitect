// The small reads the box verbs share: whether a path stands, a file's text,
// one string as JSON writes it, and the home folder a box names.
// [[spec/tickets/box-verbs-port-to-go]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"strings"
)

// Whether a path stands, a link pointing nowhere reading as none. [[spec/tickets/box-verbs-port-to-go]]
func stands(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// The text of a file, and whether it reads. [[spec/tickets/box-verbs-port-to-go]]
func readText(path string) (string, bool) {
	text, err := os.ReadFile(path)
	return string(text), err == nil
}

// One string as JSON writes it, the HTML characters plain. [[spec/tickets/box-verbs-port-to-go]]
func jsonString(text string) string {
	var said bytes.Buffer
	writes := json.NewEncoder(&said)
	writes.SetEscapeHTML(false)
	_ = writes.Encode(text)
	return strings.TrimRight(said.String(), "\n")
}

// The home folder a box names, Windows' variable first. [[spec/design_output/extension#a-box-names-its-home]]
func homeOf(env func(string) string) string {
	if home := env("USERPROFILE"); home != "" {
		return home
	}
	return env("HOME")
}
