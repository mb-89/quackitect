// The test binary answers as Vale where a case asks, so the fake runs on
// every box, Windows included, and needs no shell.
// [[spec/design_output/doors#a-fake-behaves]]
package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

// What the fake answers, the file it keeps what it read in, and the answer that reads the lines. [[spec/design_output/doors#a-fake-behaves]]
const (
	fakeValeSays  = "QUACKITECT_FAKE_VALE_SAYS"
	fakeValeHeard = "QUACKITECT_FAKE_VALE_HEARD"
	fakeValeLines = "lines"
)

// The test binary started as Vale answers as Vale, and exits before any test runs. [[spec/design_output/doors#a-fake-behaves]]
func init() {
	says, held := os.LookupEnv(fakeValeSays)
	if !held {
		return
	}
	read, _ := io.ReadAll(os.Stdin)
	if at := os.Getenv(fakeValeHeard); at != "" {
		_ = os.WriteFile(at, read, 0o644)
	}
	if says == fakeValeLines {
		says = valeLines(string(read), os.Args[1:])
	}
	fmt.Print(says)
	os.Exit(0)
}

// A Vale that behaves over stdin: a semicolon breaks Characters as a warning, and the marker breaks Private at error. [[spec/design_output/doors#a-fake-behaves]]
func valeLines(text string, args []string) string {
	path := ""
	for _, arg := range args {
		if said, ok := strings.CutPrefix(arg, "--path="); ok {
			path = said
		}
	}
	type row struct {
		Check    string `json:"Check"`
		Line     int    `json:"Line"`
		Span     []int  `json:"Span"`
		Match    string `json:"Match"`
		Message  string `json:"Message"`
		Severity string `json:"Severity"`
	}
	var rows []row
	for i, line := range strings.Split(text, "\n") {
		if strings.Contains(line, ";") {
			rows = append(rows, row{"VoiceVale.Characters", i + 1, []int{1, 1}, ";", "A semicolon joins two sentences.", "warning"})
		}
		if strings.Contains(line, "SECRET") {
			rows = append(rows, row{"VoiceVale.Private", i + 1, []int{1, 1}, "SECRET", "A private name leaves the box.", "error"})
		}
	}
	if len(rows) == 0 {
		return "{}\n"
	}
	said, _ := json.Marshal(map[string][]row{path: rows})
	return string(said) + "\n"
}

// Names the test binary as Vale in the root's tool survey, answering with says and keeping what it read at heard where one stands. [[spec/design_output/doors#a-fake-behaves]]
func fakeVale(t *testing.T, root, says, heard string) {
	t.Helper()
	self, err := os.Executable()
	if err != nil {
		t.Fatal(err)
	}
	survey, err := json.Marshal(map[string]map[string]string{"vale": {"path": self}})
	if err != nil {
		t.Fatal(err)
	}
	seedsFile(t, root, check.ToolsAt, string(survey))
	t.Setenv(fakeValeSays, says)
	t.Setenv(fakeValeHeard, heard)
}
