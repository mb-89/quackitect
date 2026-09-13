// The command line over the server. One verb speaks to an editor, one stands on
// a port, and one answers a path and exits.
// [[spec/design_output/lsp#one-checker-every-front-asks]]
package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

const usage = "usage: se-lsp <lsp|serve|check [path...]|standing|stop|version>"

func main() {
	argv := os.Args[1:]
	if len(argv) == 0 {
		fmt.Fprintln(os.Stderr, usage)
		os.Exit(2)
	}

	if argv[0] == "version" || argv[0] == "--version" || argv[0] == "-v" {
		fmt.Println("se-lsp " + Version)
		return
	}

	root, err := rootHere()
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	switch argv[0] {
	case "lsp":
		os.Exit(speaks(root))
	case "serve":
		os.Exit(serves(root))
	case "check":
		os.Exit(checks(root, argv[1:]))
	case "standing", "stop", "sweep":
		os.Exit(asks(root, argv[0]))
	}
	fmt.Fprintln(os.Stderr, usage)
	os.Exit(2)
}

func rootHere() (string, error) {
	said := os.Getenv("QUACKITECT_ROOT")
	if said == "" {
		here, err := os.Getwd()
		if err != nil {
			return "", err
		}
		said = here
	}
	return filepath.Abs(said)
}

// [[spec/design_output/lsp#the-editor-speaks-over-stdio]]
func speaks(root string) int {
	out := bufio.NewWriter(os.Stdout)
	defer out.Flush()
	if err := Speaks(checkerAt(root), os.Stdin, out); err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	return 0
}

func serves(root string) int {
	server, _, err := Serve(root)
	if err != nil {
		fmt.Fprintln(os.Stderr, "the server did not stand:", err)
		return 1
	}
	defer os.Remove(standingPath(root))

	said := make(chan os.Signal, 1)
	signal.Notify(said, os.Interrupt, syscall.SIGTERM)
	<-said
	server.Close()
	return 0
}

// [[spec/design_output/lsp#one-checker-every-front-asks]]
func checks(root string, where []string) int {
	checker := checkerAt(root)
	found := []Finding{}
	if len(where) == 0 || (len(where) == 1 && where[0] == ".") {
		found = checker.Sweep()
	} else {
		for _, one := range where {
			found = append(found, checker.Over(one)...)
		}
		found = sorted(found)
	}

	out, err := json.MarshalIndent(found, "", "  ")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	fmt.Println(string(out))
	return 0
}

func asks(root, method string) int {
	said, err := reaches(root, method)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	if said.Error != "" {
		fmt.Fprintln(os.Stderr, said.Error)
		return 1
	}
	out, err := json.MarshalIndent(said.Result, "", "  ")
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return 1
	}
	fmt.Println(string(out))
	return 0
}

// [[spec/design_output/lsp#the-port-and-the-standing-file]]
func reaches(root, method string) (answer, error) {
	for try := 0; try < 3; try++ {
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
		os.Remove(standingPath(root))
		if err := starts(root); err != nil {
			return answer{}, err
		}
	}
	return answer{}, errorOf("the server does not answer, and one would not start")
}

// [[spec/design_output/lsp#the-port-and-the-standing-file]]
func current(said Standing, root string) bool {
	if said.Root != "" && said.Root != root {
		return false
	}
	return said.Stamp == stampHere()
}

func standingOf(root string) (Standing, error) {
	var standing Standing
	said, err := os.ReadFile(standingPath(root))
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

	client := &http.Client{Timeout: 30 * time.Second}
	said, err := client.Post(
		fmt.Sprintf("http://127.0.0.1:%d/", standing.Port), "application/json", bytes.NewReader(body))
	if err != nil {
		return answer{}, err
	}
	defer said.Body.Close()

	var out answer
	return out, json.NewDecoder(said.Body).Decode(&out)
}

func starts(root string) error {
	self, err := os.Executable()
	if err != nil {
		return err
	}

	one := exec.Command(self, "serve")
	one.Dir = root
	one.Env = append(os.Environ(), "QUACKITECT_ROOT="+root)
	if err := one.Start(); err != nil {
		return err
	}
	go one.Wait()

	for waited := 0; waited < 300; waited++ {
		if _, err := standingOf(root); err == nil {
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}
	return errorOf("the server took longer than thirty seconds to stand")
}
