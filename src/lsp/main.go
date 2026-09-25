// The command line over the server. A verb speaks to an editor, stands on a
// port, or answers a path and exits.
// [[spec/design_output/lsp#one-checker-every-front-asks]]
package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"quackitect/swap"
)

const (
	usage      = "usage: se-lsp <lsp|serve|check [path...]|standing|stop|version>"
	misuse     = 2
	tries      = 3
	answerWait = 30 * time.Second
	standPolls = 300
	standPoll  = 100 * time.Millisecond
)

func main() {
	argv := argsOf()[1:]
	if len(argv) == 0 {
		fmt.Fprintln(stderr, usage)
		exits(misuse)
	}

	if argv[0] == "version" || argv[0] == "--version" || argv[0] == "-v" {
		fmt.Println("se-lsp " + Version)
		return
	}

	root, err := rootHere()
	if err != nil {
		fmt.Fprintln(stderr, err)
		exits(1)
	}

	switch argv[0] {
	case "lsp":
		exits(speaks(root))
	case "serve":
		exits(serves(root))
	case "check":
		exits(checks(root, argv[1:]))
	case "standing", "stop", "sweep":
		exits(asks(root, argv[0]))
	}
	fmt.Fprintln(stderr, usage)
	exits(misuse)
}

func rootHere() (string, error) {
	said := envOf("QUACKITECT_ROOT")
	if said == "" {
		here, err := workDirOf()
		if err != nil {
			return "", err
		}
		said = here
	}
	return filepath.Abs(said)
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func speaks(root string) int {
	out := &wire{out: bufio.NewWriter(stdout)}
	defer out.Flush()
	checker, err := checkerAt(root, false)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	one := newServer(checker, out)
	// The port beside the pipe, whose pointer goes as the server ends, however it ends. [[spec/design_output/lsp#a-port-serves-the-list]]
	drops, err := one.listens(root)
	if err != nil {
		fmt.Fprintln(stderr, "the port did not stand:", err)
		drops = func() {}
	}
	defer drops()
	ends := func() {
		drops()
		out.Flush()
		exits(0)
	}
	// The editor starts the server again once it ends, so a swapped binary ends it. [[spec/design_output/lsp]]
	swap.Watches(ends)
	go func() {
		<-stops(func(func()) {})
		ends()
	}()
	if err := one.speaks(stdin); err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	return 0
}

func serves(root string) int {
	server, _, err := Serve(root)
	if err != nil {
		fmt.Fprintln(stderr, "the server did not stand:", err)
		return 1
	}
	defer removeFile(standingPath(root))

	<-stops(swap.Watches)
	server.Close()
	return 0
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
// A front hands this verb a folder, so every path under it reads as one of its own. [[spec/design_output/lsp#one-checker-every-front-asks]]
func pathsUnder(tree *Tree, where []string) []string {
	out := []string{}
	for _, one := range where {
		said := relativeTo(tree.Root, one)
		if !tree.Folder(said) {
			out = append(out, one)
			continue
		}
		under := strings.TrimSuffix(slashed(said), "/") + "/"
		for _, path := range tree.Paths() {
			if strings.HasPrefix(path, under) {
				out = append(out, path)
			}
		}
	}
	return out
}

func checks(root string, where []string) int {
	// The check reads the disk as it stands now, so the index sweeps before it answers. [[spec/design_output/lsp#the-server-reads-the-index]]
	checker, err := checkerAt(root, true)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	// The same sweep the running server holds, so a caller with no editor reads the same list. [[spec/design_output/lsp#a-port-serves-the-list]]
	found := []Finding{}
	if len(where) == 0 || (len(where) == 1 && where[0] == ".") {
		found = checker.Whole()
	} else {
		found = checker.Reads(where)
	}

	out, err := json.MarshalIndent(found, "", "  ")
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Println(string(out))
	return 0
}

func asks(root, method string) int {
	said, err := reaches(root, method)
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	if said.Error != "" {
		fmt.Fprintln(stderr, said.Error)
		return 1
	}
	out, err := json.MarshalIndent(said.Result, "", "  ")
	if err != nil {
		fmt.Fprintln(stderr, err)
		return 1
	}
	fmt.Println(string(out))
	return 0
}

// [[spec/design_output/lsp#the-standing-file]]
func reaches(root, method string) (answer, error) {
	for try := 0; try < tries; try++ {
		standing, err := standingOf(root)
		if err == nil && current(standing, root) {
			said, err := posts(standing, method)
			if err == nil {
				return said, nil
			}
		}
		if err == nil && standing.Port != 0 && !current(standing, root) {
			posts(standing, "stop")
		}
		if method == "stop" {
			return answer{Result: map[string]string{"standing": "none"}}, nil
		}
		removeFile(standingPath(root))
		if err := starts(root); err != nil {
			return answer{}, err
		}
	}
	return answer{}, errorOf("the server does not answer, and one would not start")
}

// [[spec/design_output/lsp#the-standing-file]]
func current(said Standing, root string) bool {
	if said.Root != "" && said.Root != root {
		return false
	}
	return said.Stamp == stampHere()
}

func standingOf(root string) (Standing, error) {
	var standing Standing
	said, err := readFile(standingPath(root))
	if err != nil {
		return standing, err
	}
	if err := json.Unmarshal(said, &standing); err != nil {
		return standing, err
	}
	if standing.Port == 0 {
		return standing, errorOf("the standing file names no port")
	}
	return standing, nil
}

func posts(standing Standing, method string) (answer, error) {
	body, err := json.Marshal(call{Method: method, Params: json.RawMessage("{}"), ID: 1})
	if err != nil {
		return answer{}, err
	}

	client := &http.Client{Timeout: answerWait}
	said, err := client.Post(
		fmt.Sprintf("http://127.0.0.1:%d/", standing.Port), "application/json", bytes.NewReader(body))
	if err != nil {
		return answer{}, err
	}
	defer said.Body.Close()

	var out answer
	return out, json.NewDecoder(said.Body).Decode(&out)
}
