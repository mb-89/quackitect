// The probe behind the doctor's `quack lsp` row, over a runner that answers
// each frame the way quack lsp does.
// [[spec/design_output/lsp#the-doctor-probes-the-server]]
package main

import (
	"encoding/json"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"testing"
)

var frameLength = regexp.MustCompile(`^Content-Length: (\d+)\r\n\r\n`)

// The frames a language server reads off its input, in the order the probe writes them. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func framesIn(t *testing.T, input string) []map[string]any {
	t.Helper()
	var out []map[string]any
	for input != "" {
		head := frameLength.FindStringSubmatch(input)
		if head == nil {
			t.Fatalf("a frame opens on %q", input)
		}
		length, _ := strconv.Atoi(head[1])
		body := input[len(head[0]) : len(head[0])+length]
		var said map[string]any
		if err := json.Unmarshal([]byte(body), &said); err != nil {
			t.Fatalf("a frame reads as no JSON: %q", body)
		}
		out = append(out, said)
		input = input[len(head[0])+length:]
	}
	return out
}

// A server answering the initialize and the shutdown by id, and a note it opens with the codes named. [[spec/design_output/lsp#the-doctor-probes-the-server]]
func answeringServer(t *testing.T, codes ...any) (func([]string, runOpts) ranResult, *[]runOpts) {
	var asked []runOpts
	return func(argv []string, o runOpts) ranResult {
		asked = append(asked, o)
		var out strings.Builder
		for _, one := range framesIn(t, o.stdin) {
			switch one["method"] {
			case "initialize", "shutdown":
				out.WriteString(framed(lspFrame{ID: int(one["id"].(float64)), Method: ""}))
			case "textDocument/didOpen":
				var drawn []map[string]any
				for _, code := range codes {
					drawn = append(drawn, map[string]any{"code": code, "message": "fires"})
				}
				out.WriteString(framed(lspFrame{Method: "textDocument/publishDiagnostics", Params: map[string]any{"diagnostics": drawn}}))
			}
		}
		return ranResult{stdout: out.String()}
	}, &asked
}

func TestALanguageServerThatAnswersDrawsARowNamingEachDiagnostic(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	run, asked := answeringServer(t, "Schema.Kind", "Voice.Tense", "Schema.Kind", 7)
	var stdin string
	d.run = func(argv []string, o runOpts) ranResult {
		stdin = o.stdin
		if !reflect.DeepEqual(argv, []string{"/bin/se-index", "lsp"}) {
			t.Errorf("the probe runs %v", argv)
		}
		return run(argv, o)
	}
	if row := lspProbe(d, "/bin/se-index", d.root); row != "answers, and draws Schema.Kind, Voice.Tense, 7 on the probe note" {
		t.Errorf("the row reads %q", row)
	}
	var methods []any
	frames := framesIn(t, stdin)
	for _, one := range frames {
		methods = append(methods, one["method"])
	}
	if !reflect.DeepEqual(methods, []any{"initialize", "textDocument/didOpen", "shutdown", "exit"}) {
		t.Errorf("the frames read %v", methods)
	}
	if !strings.HasPrefix(stdin, `Content-Length: `) || !strings.Contains(stdin, `{"jsonrpc":"2.0","id":1,"method":"initialize"`) {
		t.Errorf("the first frame reads %q", stdin)
	}
	opened := frames[1]["params"].(map[string]any)["textDocument"].(map[string]any)
	if uri := opened["uri"].(string); !strings.HasPrefix(uri, "file:///") || !strings.HasSuffix(uri, "/"+probeNote) || opened["text"] != probeText {
		t.Errorf("the note opens as %v", opened)
	}
	if (*asked)[0].cwd != d.root || (*asked)[0].timeout != lspWait {
		t.Errorf("the server runs as %+v", (*asked)[0])
	}
}

func TestALanguageServerDrawingNothingSaysSo(t *testing.T) {
	t.Parallel()
	d, _, _, _ := fakeBoxDoors(t)
	d.run, _ = answeringServer(t)
	if row := lspProbe(d, "/bin/se-index", d.root); row != "answers, and draws no diagnostic on the probe note" {
		t.Errorf("the row reads %q", row)
	}
}

func TestALanguageServerThatExitsDrawsAWarnRowNamingTheExit(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	runner.answers["se-index lsp"] = ranResult{code: 2, stderr: "panic: the checker reads no tree\ngoroutine 1\n"}
	if row := lspProbe(d, "/bin/se-index", d.root); row != "warn: quack lsp exits with 2 before it answers: panic: the checker reads no tree" {
		t.Errorf("the row reads %q", row)
	}
	runner.answers["se-index lsp"] = ranResult{}
	if row := lspProbe(d, "/bin/se-index", d.root); row != "warn: quack lsp exits with 0 before it answers: it says nothing" {
		t.Errorf("a server sending no publish reads %q", row)
	}
	runner.answers["se-index lsp"] = ranResult{code: exitFailed, missing: true, fault: "exec: no such file"}
	if row := lspProbe(d, "/bin/se-index", d.root); row != "warn: quack lsp exits with 1 before it answers: exec: no such file" {
		t.Errorf("a server that never starts reads %q", row)
	}
}

func TestALanguageServerStandingNowhereDrawsTheInstallsLine(t *testing.T) {
	t.Parallel()
	d, runner, _, _ := fakeBoxDoors(t)
	if row := lspProbe(d, "", d.root); row != "missing, run ./RUNME.sh" || len(runner.ran) != 0 {
		t.Errorf("the row reads %q after %v", row, runner.ran)
	}
}
